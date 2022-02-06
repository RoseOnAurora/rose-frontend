/* eslint-disable */
import { POOLS_MAP, PoolName, TRANSACTION_TYPES, Token } from "../constants"
import {
  useAllContracts,
  useLPTokenContract,
  usePoolContract,
} from "./useContract"
import { useDispatch, useSelector } from "react-redux"

import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import { ContractReceipt } from "@ethersproject/contracts"
import { Erc20 } from "../../types/ethers-contracts/Erc20"
import { FraxPoolDeposit } from "../../types/ethers-contracts/FraxPoolDeposit"
import FRAX_POOL_DEPOSIT from "../constants/abis/FraxPoolDeposit.json"
import { NumberInputState } from "../utils/numberInputState"
// import { Zero } from "@ethersproject/constants"
import checkAndApproveTokenForTrade from "../utils/checkAndApproveTokenForTrade"
import { getContract } from "../utils"
import { parseUnits } from "@ethersproject/units"
import { subtractSlippage } from "../utils/slippage"
import { updateLastTransactionTimes } from "../state/application"
import { useActiveWeb3React } from "."
import { useMemo } from "react"
import { GasPrices } from "../state/user"

interface ApproveAndDepositStateArgument {
  [tokenSymbol: string]: NumberInputState
}

export function useApproveAndDeposit(
  poolName: PoolName,
): (
  state: ApproveAndDepositStateArgument,
  shouldDepositWrapped?: boolean,
) => Promise<ContractReceipt | void> {
  const dispatch = useDispatch()
  // const swapContract = useSwapContract(poolName)
  const poolContract = usePoolContract(poolName)
  const lpTokenContract = useLPTokenContract(poolName)
  const tokenContracts = useAllContracts()
  const { account, chainId, library } = useActiveWeb3React()
  const {
    slippageCustom,
    slippageSelected,
    infiniteApproval,
    gasPriceSelected,
    gasCustom,
  } = useSelector((state: AppState) => state.user)
  const { gasStandard, gasFast, gasInstant } = useSelector(
    (state: AppState) => state.application,
  )
  const POOL = POOLS_MAP[poolName]
  const metaSwapContract = useMemo(() => {
    if (POOL.metaSwapAddresses && chainId && library) {
      return getContract(
        POOL.metaSwapAddresses?.[chainId],
        JSON.stringify(FRAX_POOL_DEPOSIT),
        library,
        account ?? undefined,
      ) as FraxPoolDeposit
    }
    return null
  }, [chainId, library, POOL.metaSwapAddresses, account])

  return async function approveAndDeposit(
    state: ApproveAndDepositStateArgument,
    shouldDepositWrapped = false,
  ): Promise<ContractReceipt | void> {
    try {
      if (!account) throw new Error("Wallet must be connected")
      if (
        !poolContract ||
        !lpTokenContract ||
        (shouldDepositWrapped && !metaSwapContract)
      )
        throw new Error("Swap contract is not loaded")

      const poolTokens = shouldDepositWrapped
        ? (POOL.underlyingPoolTokens as Token[])
        : POOL.poolTokens
      const effectiveSwapContract = shouldDepositWrapped
        ? (metaSwapContract as FraxPoolDeposit)
        : poolContract

      let gasPrice: any
      if (gasPriceSelected === GasPrices.Custom) {
        gasPrice = gasCustom?.valueSafe
      } else if (gasPriceSelected === GasPrices.Fast) {
        gasPrice = gasFast
      } else if (gasPriceSelected === GasPrices.Instant) {
        gasPrice = gasInstant
      } else {
        gasPrice = gasStandard
      }
      gasPrice = parseUnits(gasPrice?.toString() || "45", "gwei")
      const approveSingleToken = async (token: Token): Promise<void> => {
        const spendingValue = BigNumber.from(state[token.symbol].valueSafe)
        if (spendingValue.isZero()) return
        const tokenContract = tokenContracts?.[token.symbol] as Erc20
        if (tokenContract == null) return
        await checkAndApproveTokenForTrade(
          tokenContract,
          effectiveSwapContract.address,
          account,
          spendingValue,
          infiniteApproval,
          gasPrice,
          {
            onTransactionError: (error) => {
              console.error(error)
              throw new Error("Your transaction could not be completed")
            },
          },
        )
        return
      }
      // For each token being deposited, check the allowance and approve it if necessary
      for (const token of poolTokens) {
        await approveSingleToken(token)
      }

      const effectivePoolContract = effectiveSwapContract
      const txnAmounts: BigNumber[] = poolTokens.map((poolToken) => {
        return BigNumber.from(state[poolToken.symbol].valueSafe)
      })

      const isFirstTransaction = (await lpTokenContract.totalSupply()).isZero()
      let minToMint: BigNumber
      if (isFirstTransaction) {
        minToMint = BigNumber.from("0")
      } else {
        minToMint = await effectivePoolContract.calc_token_amount(
          txnAmounts,
          true, // deposit boolean
        )
      }

      minToMint = subtractSlippage(minToMint, slippageSelected, slippageCustom)

      // const swapFlashLoanContract = effectiveSwapContract as RoseStablesPool
      const spendTransaction = await effectivePoolContract.add_liquidity(
        txnAmounts,
        minToMint,
        {
          gasPrice,
        },
      )

      // notifyHandler(spendTransaction.hash, "deposit")

      const receipt = await spendTransaction.wait()
      dispatch(
        updateLastTransactionTimes({
          [TRANSACTION_TYPES.DEPOSIT]: Date.now(),
        }),
      )
      return receipt
    } catch (e) {
      console.error(e)
      // notifyCustomError(e as Error)
    }
  }
}
