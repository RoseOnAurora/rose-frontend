/* eslint @typescript-eslint/no-explicit-any: 0 */
/* eslint @typescript-eslint/no-unsafe-assignment: 0 */
/* eslint @typescript-eslint/no-unsafe-call: 0 */
/* eslint @typescript-eslint/no-unsafe-member-access: 0 */
/* eslint @typescript-eslint/no-unsafe-return: 0 */
import { ChainId, POOLS_MAP, PoolName, TRANSACTION_TYPES } from "../constants"
import { addSlippage, subtractSlippage } from "../utils/slippage"
import { formatUnits, parseUnits } from "@ethersproject/units"
import { useLPTokenContract, usePoolContract } from "./useContract"
import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import { ContractReceipt } from "@ethersproject/contracts"
import { GasPrices } from "../state/user"
import { NumberInputState } from "../utils/numberInputState"
import { Zero } from "@ethersproject/constants"
import checkAndApproveTokenForTrade from "../utils/checkAndApproveTokenForTrade"
import { updateLastTransactionTimes } from "../state/application"
import { useActiveWeb3React } from "."
import { useDispatch } from "react-redux"
import { useSelector } from "react-redux"

interface ApproveAndWithdrawStateArgument {
  tokenFormState: { [symbol: string]: NumberInputState }
  withdrawType: string
  lpTokenAmountToSpend: BigNumber
}

export function useApproveAndWithdraw(
  poolName: PoolName,
): (state: ApproveAndWithdrawStateArgument) => Promise<ContractReceipt | void> {
  const dispatch = useDispatch()
  const poolContract = usePoolContract(poolName)
  const { account, chainId } = useActiveWeb3React()
  const { gasStandard, gasFast, gasInstant } = useSelector(
    (state: AppState) => state.application,
  )
  const {
    slippageCustom,
    slippageSelected,
    gasPriceSelected,
    gasCustom,
    infiniteApproval,
  } = useSelector((state: AppState) => state.user)
  const lpTokenContract = useLPTokenContract(poolName)
  const POOL = POOLS_MAP[poolName]

  return async function approveAndWithdraw(
    state: ApproveAndWithdrawStateArgument,
  ): Promise<ContractReceipt | void> {
    try {
      if (!account) throw new Error("Wallet must be connected")
      if (!poolContract) throw new Error("Swap contract is not loaded")
      if (state.lpTokenAmountToSpend.isZero()) return
      if (lpTokenContract == null) return
      // const gasPrice = Zero
      let gasPrice
      if (gasPriceSelected === GasPrices.Custom && gasCustom?.valueSafe) {
        gasPrice = gasCustom.valueSafe
      } else if (gasPriceSelected === GasPrices.Standard) {
        gasPrice = gasStandard
      } else if (gasPriceSelected === GasPrices.Instant) {
        gasPrice = gasInstant
      } else {
        gasPrice = gasFast
      }
      gasPrice =
        chainId === ChainId.AURORA_MAINNET
          ? parseUnits(gasPrice?.toString() || "45", "gwei")
          : Zero
      const allowanceAmount =
        state.withdrawType === "IMBALANCE"
          ? addSlippage(
              state.lpTokenAmountToSpend,
              slippageSelected,
              slippageCustom,
            )
          : state.lpTokenAmountToSpend
      await checkAndApproveTokenForTrade(
        lpTokenContract,
        poolContract.address,
        account,
        allowanceAmount,
        infiniteApproval,
        gasPrice,
        {
          onTransactionError: () => {
            throw new Error("Your transaction could not be completed")
          },
        },
      )

      console.debug(
        `lpTokenAmountToSpend: ${formatUnits(state.lpTokenAmountToSpend, 18)}`,
      )
      let spendTransaction
      if (state.withdrawType === "ALL") {
        const txnAmounts: BigNumber[] = POOL.poolTokens.map((poolToken) => {
          return subtractSlippage(
            BigNumber.from(state.tokenFormState[poolToken.symbol].valueSafe),
            slippageSelected,
            slippageCustom,
          )
        })
        spendTransaction = await poolContract.remove_liquidity(
          state.lpTokenAmountToSpend,
          txnAmounts,
          {
            gasPrice,
          },
        )
      } else if (state.withdrawType === "IMBALANCE") {
        const txnAmounts: string[] = POOL.poolTokens.map((poolToken) => {
          return state.tokenFormState[poolToken.symbol].valueSafe
        })
        spendTransaction = await poolContract.remove_liquidity_imbalance(
          txnAmounts,
          addSlippage(
            state.lpTokenAmountToSpend,
            slippageSelected,
            slippageCustom,
          ),
          {
            gasPrice,
          },
        )
      } else {
        // state.withdrawType === [TokenSymbol]
        spendTransaction = await poolContract.remove_liquidity_one_coin(
          state.lpTokenAmountToSpend,
          POOL.poolTokens.findIndex(
            ({ symbol }) => symbol === state.withdrawType,
          ),
          subtractSlippage(
            BigNumber.from(
              state.tokenFormState[state.withdrawType || ""].valueSafe,
            ),
            slippageSelected,
            slippageCustom,
          ),
          {
            gasPrice,
          },
        )
      }

      // notifyHandler(spendTransaction.hash, "withdraw")

      const receipt = await spendTransaction.wait()
      dispatch(
        updateLastTransactionTimes({
          [TRANSACTION_TYPES.WITHDRAW]: Date.now(),
        }),
      )
      return receipt
    } catch (e) {
      console.error(e)
      // notifyCustomError(e as Error)
    }
  }
}
