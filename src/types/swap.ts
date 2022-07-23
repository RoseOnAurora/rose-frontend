import { BigNumber } from "@ethersproject/bignumber"
import { SWAP_TYPES } from "../constants"

export type ExchangeRateInfo = {
  pair: string
  exchangeRate: BigNumber
  priceImpact: BigNumber
}

export type SwapRouteToken = {
  icon: string
  symbol: string
}

export type SwapTokenOption = {
  symbol: string
  name: string
  valueUSD: BigNumber
  amount: BigNumber
  icon: string
  decimals: number
  swapType: SWAP_TYPES | null
  isAvailable: boolean
}

/** TO-DO: swap logic needs improvement. Main concerns:
 * 1. Swapping is functional but need to improve interfaces
 * 2. Migration to formik form is not complete; we have state
 * managed outside of the form
 * 3. user feedback - i.e. errors, ui enhancements etc
 */
export type SwapState = {
  from: SwapSide
  to: {
    // we need to manage to outside of the form as its calculated from user input
    value: BigNumber
    valueUSD: BigNumber
  } & SwapSide
  priceImpact: BigNumber
  exchangeRate: BigNumber
  swapType: SWAP_TYPES
  currentSwapPairs: SwapData[]
}

export type SwapFormValues = {
  from: string
  to: string
}

export type SwapSide = {
  symbol: string
  poolName?: string
  tokenIndex?: number
}

export type SwapData =
  | {
      from: Required<SwapSide>
      to: Required<SwapSide>
      type: Exclude<SWAP_TYPES, SWAP_TYPES.INVALID>
      route: string[]
    }
  | {
      from: SwapSide
      to: SwapSide
      type: SWAP_TYPES.INVALID
      route: string[]
    }

export type TokenToSwapDataMap = { [symbol: string]: SwapData[] }
