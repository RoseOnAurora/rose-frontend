/* eslint @typescript-eslint/no-explicit-any: 0 */
/* eslint @typescript-eslint/no-unsafe-assignment: 0 */
/* eslint @typescript-eslint/no-unsafe-call: 0 */
/* eslint @typescript-eslint/no-unsafe-member-access: 0 */
/* eslint @typescript-eslint/no-unsafe-return: 0 */
import {
  ChainId,
  POOLS_MAP,
  RosePool,
  SWAP_TYPES,
  TOKENS_MAP,
  TRANSACTION_TYPES,
} from "../constants"
import { ContractReceipt, ContractTransaction } from "@ethersproject/contracts"
import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import { Bridge } from "../../types/ethers-contracts/Bridge"
import { Erc20 } from "../../types/ethers-contracts/Erc20"
import { GasPrices } from "../state/user"
import { SwapComposer } from "../../types/ethers-contracts/SwapComposer"
import { Zero } from "@ethersproject/constants"
import checkAndApproveTokenForTrade from "../utils/checkAndApproveTokenForTrade"
import { parseUnits } from "@ethersproject/units"
import { subtractSlippage } from "../utils/slippage"
import { updateLastTransactionTimes } from "../state/application"
import { useActiveWeb3React } from "."
import { useAllContracts } from "./useContract"
import { useDispatch } from "react-redux"
import { useSelector } from "react-redux"
import { utils } from "ethers"

type Contracts = {
  poolContract: RosePool | null
  bridgeContract: Bridge | null
  swapComposerContract: SwapComposer | null
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
  return async function approveAndSwap(
    state: ApproveAndSwapStateArgument,
  ): Promise<ContractReceipt | void> {
    try {
      if (!account) throw new Error("Wallet must be connected")
      if (state.swapType === SWAP_TYPES.DIRECT && !state.poolContract)
        throw new Error("Swap contract is not loaded")
      if (
        state.swapType === SWAP_TYPES.META_TO_META &&
        !state.swapComposerContract
      )
        throw new Error("Swap Composer contract is not loaded")
      if (chainId === undefined) throw new Error("Unknown chain")
      // For each token being deposited, check the allowance and approve it if necessary
      const tokenContract = tokenContracts?.[state.from.symbol] as Erc20
      // const gasPrice = Zero
      let gasPrice
      if (gasPriceSelected === GasPrices.Custom) {
        gasPrice = gasCustom?.valueSafe
      } else if (gasPriceSelected === GasPrices.Fast) {
        gasPrice = gasFast
      } else if (gasPriceSelected === GasPrices.Instant) {
        gasPrice = gasInstant
      } else {
        gasPrice = gasStandard
      }
      gasPrice =
        chainId === ChainId.AURORA_MAINNET
          ? parseUnits(gasPrice?.toString() || "45", "gwei")
          : Zero
      if (tokenContract == null) return
      let addressToApprove = ""
      if (
        state.swapType === SWAP_TYPES.DIRECT ||
        state.swapType === SWAP_TYPES.STABLES_TO_META
      ) {
        addressToApprove = state.poolContract?.address as string
      } else if (state.swapType === SWAP_TYPES.META_TO_META) {
        addressToApprove = state.swapComposerContract?.address as string
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
      )
      let swapTransaction: ContractTransaction
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
        swapTransaction = await (
          state.poolContract as NonNullable<
            typeof state.poolContract // we already check for nonnull above
          >
        ).exchange(...args)
      } else if (state.swapType === SWAP_TYPES.STABLES_TO_META) {
        const args = [
          state.from.tokenIndex,
          state.to.tokenIndex,
          state.from.amount,
          subtractSlippage(state.to.amount, slippageSelected, slippageCustom),
          { gasPrice },
        ] as const
        console.debug("exchange_underlying - stables to meta", args)
        swapTransaction = await (
          state.poolContract as NonNullable<
            typeof state.poolContract // we already check for nonnull above
          >
        ).exchange_underlying(...args)
      } else if (state.swapType === SWAP_TYPES.META_TO_META) {
        const args = [
          TOKENS_MAP[state.from.symbol].addresses[chainId],
          TOKENS_MAP[state.to.symbol].addresses[chainId],
          state.from.amount,
          subtractSlippage(state.to.amount, slippageSelected, slippageCustom),
          { gasPrice },
        ] as const
        console.debug("exchange_thru_stables - meta to meta", args)
        swapTransaction = await (
          state.swapComposerContract as NonNullable<
            typeof state.swapComposerContract // we already check for nonnull above
          >
        ).exchange_thru_stables(...args)
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
      const error = e as { code: number; message: string }
      throw error
    }
  }
}
