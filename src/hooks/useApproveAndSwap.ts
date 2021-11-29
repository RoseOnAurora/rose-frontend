/* eslint @typescript-eslint/no-explicit-any: 0 */
/* eslint @typescript-eslint/no-unsafe-assignment: 0 */
/* eslint @typescript-eslint/no-unsafe-call: 0 */
/* eslint @typescript-eslint/no-unsafe-member-access: 0 */
/* eslint @typescript-eslint/no-unsafe-return: 0 */
import { Contract, ContractReceipt } from "@ethersproject/contracts"
import { POOLS_MAP, SWAP_TYPES, TRANSACTION_TYPES } from "../constants"
// import { notifyCustomError, notifyHandler } from "../utils/notifyHandler"

import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import { Bridge } from "../../types/ethers-contracts/Bridge"
import { Erc20 } from "../../types/ethers-contracts/Erc20"
import { Zero } from "@ethersproject/constants"
import checkAndApproveTokenForTrade from "../utils/checkAndApproveTokenForTrade"
import { subtractSlippage } from "../utils/slippage"
import { updateLastTransactionTimes } from "../state/application"
import { useActiveWeb3React } from "."
import { useAllContracts } from "./useContract"
import { useDispatch } from "react-redux"
import { useSelector } from "react-redux"
import { utils } from "ethers"

type Contracts = {
  poolContract: Contract | null
  bridgeContract: Bridge | null
}
type SwapSide = {
  amount: BigNumber
  symbol: string
  poolName: string
  tokenIndex: number
}
type FormState = {
  from: SwapSide
  to: SwapSide & { amountMediumSynth: BigNumber }
  swapType: Exclude<SWAP_TYPES, SWAP_TYPES.INVALID>
}
type ApproveAndSwapStateArgument = FormState & Contracts

export function useApproveAndSwap(): (
  state: ApproveAndSwapStateArgument,
) => Promise<ContractReceipt | void> {
  const dispatch = useDispatch()
  const tokenContracts = useAllContracts()
  const { account, chainId } = useActiveWeb3React()
  const { slippageCustom, slippageSelected, infiniteApproval } = useSelector(
    (state: AppState) => state.user,
  )
  return async function approveAndSwap(
    state: ApproveAndSwapStateArgument,
  ): Promise<ContractReceipt | void> {
    try {
      if (!account) throw new Error("Wallet must be connected")
      if (state.swapType === SWAP_TYPES.DIRECT && !state.poolContract)
        throw new Error("Swap contract is not loaded")
      if (state.swapType !== SWAP_TYPES.DIRECT && !state.bridgeContract)
        throw new Error("Bridge contract is not loaded")
      if (chainId === undefined) throw new Error("Unknown chain")
      // For each token being deposited, check the allowance and approve it if necessary
      const tokenContract = tokenContracts?.[state.from.symbol] as Erc20
      const gasPrice = Zero
      // if (gasPriceSelected === GasPrices.Custom) {
      //   gasPrice = gasCustom?.valueSafe
      // } else if (gasPriceSelected === GasPrices.Fast) {
      //   gasPrice = gasFast
      // } else if (gasPriceSelected === GasPrices.Instant) {
      //   gasPrice = gasInstant
      // } else {
      //   gasPrice = gasStandard
      // }
      // gasPrice = parseUnits(String(gasPrice) || "45", 9)
      if (tokenContract == null) return
      let addressToApprove = ""
      if (state.swapType === SWAP_TYPES.DIRECT) {
        addressToApprove = state.poolContract?.address as string
      } else {
        addressToApprove = state.bridgeContract?.address as string
      }
      await checkAndApproveTokenForTrade(
        tokenContract,
        addressToApprove,
        account,
        state.from.amount,
        infiniteApproval,
        gasPrice,
        {
          onTransactionError: () => {
            throw new Error("Your transaction could not be completed")
          },
        },
      )
      let swapTransaction
      if (state.swapType === SWAP_TYPES.TOKEN_TO_TOKEN) {
        const originPool = POOLS_MAP[state.from.poolName]
        const destinationPool = POOLS_MAP[state.to.poolName]
        const args = [
          [
            originPool.addresses[chainId],
            destinationPool.addresses[chainId],
          ] as [string, string],
          state.from.tokenIndex,
          state.to.tokenIndex,
          state.from.amount,
          subtractSlippage(
            state.to.amountMediumSynth,
            slippageSelected,
            slippageCustom,
          ), // subtract slippage from minSynth
          { gasPrice },
        ] as const
        console.debug("swap - tokenToToken", args)
        swapTransaction = await (state.bridgeContract as Bridge).tokenToToken(
          ...args,
        )
      } else if (state.swapType === SWAP_TYPES.SYNTH_TO_TOKEN) {
        const destinationPool = POOLS_MAP[state.to.poolName]
        const args = [
          destinationPool.addresses[chainId],
          utils.formatBytes32String(state.from.symbol),
          state.to.tokenIndex,
          state.from.amount,
          subtractSlippage(
            state.to.amountMediumSynth,
            slippageSelected,
            slippageCustom,
          ), // subtract slippage from minSynth
          { gasPrice },
        ] as const
        console.debug("swap - synthToToken", args)
        swapTransaction = await (state.bridgeContract as Bridge).synthToToken(
          ...args,
        )
      } else if (state.swapType === SWAP_TYPES.TOKEN_TO_SYNTH) {
        const originPool = POOLS_MAP[state.from.poolName]
        const args = [
          originPool.addresses[chainId],
          state.from.tokenIndex,
          utils.formatBytes32String(state.to.symbol),
          state.from.amount,
          subtractSlippage(state.to.amount, slippageSelected, slippageCustom),
          { gasPrice },
        ] as const
        console.debug("swap - tokenToSynth", args)
        swapTransaction = await (state.bridgeContract as Bridge).tokenToSynth(
          ...args,
        )
      } else if (state.swapType === SWAP_TYPES.DIRECT) {
        const args = [
          state.from.tokenIndex,
          state.to.tokenIndex,
          state.from.amount,
          subtractSlippage(state.to.amount, slippageSelected, slippageCustom),
          { gasPrice },
        ] as const
        console.debug("exchange - direct", args)
        swapTransaction = await (state.poolContract as NonNullable<
          typeof state.poolContract // we already check for nonnull above
        >).exchange(...args)
      } else {
        throw new Error("Invalid Swap Type, or contract not loaded")
      }

      dispatch(
        updateLastTransactionTimes({
          [TRANSACTION_TYPES.SWAP]: Date.now(),
        }),
      )
      return await swapTransaction?.wait()
    } catch (e) {
      console.error(e)
    }
  }
}
