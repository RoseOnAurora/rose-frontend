import { RUSD, SWAP_TYPES } from "../constants"
import { SwapTokenOption } from "../types/swap"
import { shiftBNDecimals } from "."

export const sortTokenOptions = (
  a: SwapTokenOption,
  b: SwapTokenOption,
): 1 | -1 => {
  if (a.isAvailable !== b.isAvailable) {
    return a.isAvailable ? -1 : 1
  }
  // if either is invalid, put the valid one first
  if (a.swapType === SWAP_TYPES.INVALID || b.swapType === SWAP_TYPES.INVALID) {
    return a.swapType === SWAP_TYPES.INVALID ? 1 : -1
  }
  // prioritize RUSD irrespective of user token balances
  if (a.symbol === RUSD.symbol || b.symbol === RUSD.symbol) {
    return a.symbol === RUSD.symbol ? -1 : 1
  }
  if (a.valueUSD.eq(b.valueUSD)) {
    const amountA = shiftBNDecimals(a.amount, 18 - a.decimals)
    const amountB = shiftBNDecimals(b.amount, 18 - b.decimals)
    return amountA.gt(amountB) ? -1 : 1
  } else if (a.valueUSD.gt(b.valueUSD)) {
    return -1
  }
  return 1
}
