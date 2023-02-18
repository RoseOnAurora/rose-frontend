import { ChainId, SWAP_TYPES, TOKENS_MAP } from "../constants"
import { SwapData, SwapTokenOption } from "../types/swap"
import { AppState } from "../state"
import { Zero } from "@ethersproject/constants"
import { calculatePrice } from "../utils"
import { sortTokenOptions } from "../utils/swapUtils"
import { useMemo } from "react"
import { usePoolTokenBalances } from "./useTokenBalances"
import { useSelector } from "react-redux"
import { useWeb3React } from "@web3-react/core"

const useSwapTokenOptions = (
  currentSwapPairs: SwapData[],
): { from: SwapTokenOption[]; to: SwapTokenOption[] } => {
  const tokenBalances = usePoolTokenBalances()
  const { tokenPricesUSD } = useSelector((state: AppState) => state.application)
  const { chainId } = useWeb3React()

  // build a representation of pool tokens for the UI
  const tokenOptions = useMemo(() => {
    const allTokens = Object.values(TOKENS_MAP)
      .filter(({ isLPToken }) => !isLPToken)
      .filter(({ addresses }) => !!addresses[chainId as ChainId])
      .map(({ symbol, name, icon, decimals }) => {
        const amount = tokenBalances?.[symbol] || Zero
        return {
          name,
          icon,
          symbol,
          decimals,
          amount,
          valueUSD: calculatePrice(amount, tokenPricesUSD?.[symbol], decimals),
          isAvailable: true,
          swapType: null,
        }
      })
      .sort(sortTokenOptions)
    const toTokens =
      currentSwapPairs.length > 0
        ? currentSwapPairs
            .map(({ to, type: swapType }) => {
              const { symbol, name, icon, decimals } = TOKENS_MAP[to.symbol]
              const amount = tokenBalances?.[symbol] || Zero
              return {
                name,
                icon,
                symbol,
                decimals,
                amount,
                valueUSD: calculatePrice(
                  amount,
                  tokenPricesUSD?.[symbol],
                  decimals,
                ),
                swapType,
                isAvailable: swapType !== SWAP_TYPES.INVALID,
              }
            })
            .sort(sortTokenOptions)
        : allTokens
    // from: all tokens always available. to: limited by selected "from" token.
    return {
      from: allTokens,
      to: toTokens,
    }
  }, [tokenPricesUSD, tokenBalances, currentSwapPairs, chainId])
  return tokenOptions
}

export default useSwapTokenOptions
