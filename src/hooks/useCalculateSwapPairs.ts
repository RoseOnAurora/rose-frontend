/* eslint @typescript-eslint/no-unsafe-member-access: 0 */
/* eslint @typescript-eslint/no-unsafe-call: 0 */
import {
  ChainId,
  POOLS_MAP,
  Pool,
  PoolsMap,
  SWAP_TYPES,
  TOKENS_MAP,
  Token,
  TokensMap,
} from "../constants/index"
import { SwapData, SwapSide, TokenToSwapDataMap } from "../types/swap"
import { useMemo, useState } from "react"
import { intersection } from "../utils/index"
import usePoolTVLs from "./usePoolsTVL"
import { useWeb3React } from "@web3-react/core"

// swaptypes in order of least to most preferred (aka expensive)
const SWAP_TYPES_ORDERED_ASC = [
  SWAP_TYPES.INVALID,
  SWAP_TYPES.META_TO_META,
  SWAP_TYPES.STABLES_TO_META,
  SWAP_TYPES.DIRECT,
]

type TokenToPoolsMap = {
  [tokenSymbol: string]: string[]
}

export function useCalculateSwapPairs(): (token?: Token) => SwapData[] {
  const { chainId } = useWeb3React()
  const [pairCache, setPairCache] = useState<TokenToSwapDataMap>({})
  const poolTVLs = usePoolTVLs()
  const [tokenToPoolsMapSorted] = useMemo(() => {
    const sortedPools = Object.values(POOLS_MAP).sort((a, b) => {
      const aTVL = poolTVLs[a.name]
      const bTVL = poolTVLs[b.name]
      if (aTVL && bTVL) {
        return aTVL.gt(bTVL) ? -1 : 1
      }
      return aTVL ? -1 : 1
    })
    const tokenToPools = sortedPools.reduce((acc, { name: poolName }) => {
      const pool = POOLS_MAP[poolName]
      const newAcc = { ...acc }
      pool.poolTokens.forEach((token) => {
        newAcc[token.symbol] = (newAcc[token.symbol] || []).concat(poolName)
      })
      return newAcc
    }, {} as TokenToPoolsMap)
    return [tokenToPools]
  }, [poolTVLs])

  return function calculateSwapPairs(token?: Token): SwapData[] {
    if (!token || !chainId) return []
    const cacheHit = pairCache[token.symbol]
    if (cacheHit) return cacheHit
    const swapPairs = getTradingPairsForToken(
      TOKENS_MAP,
      POOLS_MAP,
      tokenToPoolsMapSorted,
      token,
      chainId,
    )
    setPairCache((prevState) => ({ ...prevState, [token.symbol]: swapPairs }))
    return swapPairs
  }
}

function buildSwapSideData(token: Token): SwapSide
function buildSwapSideData(token: Token, pool: Pool): Required<SwapSide>
function buildSwapSideData(
  token: Token,
  pool?: Pool,
): Required<SwapSide> | SwapSide {
  return {
    symbol: token.symbol,
    poolName: pool?.name,
    tokenIndex:
      pool?.underlyingPoolTokens?.findIndex((t) => t === token) ||
      pool?.poolTokens.findIndex((t) => t === token),
  }
}

function getTradingPairsForToken(
  tokensMap: TokensMap,
  poolsMap: PoolsMap,
  tokenToPoolsMap: TokenToPoolsMap,
  originToken: Token,
  chainId: number,
): SwapData[] {
  const allTokens = Object.values(tokensMap).filter(
    ({ isLPToken, addresses }) => !isLPToken && !!addresses[chainId as ChainId],
  )
  const originTokenPoolsSet = new Set(
    tokenToPoolsMap[originToken.symbol].map((poolName) => poolsMap[poolName]),
  )
  const tokenToSwapDataMap: { [symbol: string]: SwapData } = {} // object is used for deduping

  allTokens.forEach((token) => {
    // Base Case: Invalid trade, eg token with itself
    let swapData: SwapData = {
      from: buildSwapSideData(originToken),
      to: buildSwapSideData(token),
      type: SWAP_TYPES.INVALID,
      route: [],
    }
    const tokenPoolsSet = new Set(
      tokenToPoolsMap[token.symbol].map((poolName) => poolsMap[poolName]),
    )
    const sharedPoolsSet = intersection(originTokenPoolsSet, tokenPoolsSet)

    // Case 1: TokenA <> TokenA
    if (originToken === token) {
      // fall through to default "invalid" swapData
    }
    // Case 2: poolA(TokenA) <> poolA(TokenB)
    else if (sharedPoolsSet.size > 0) {
      const tradePool = [...sharedPoolsSet][0]
      swapData = {
        type: SWAP_TYPES.DIRECT,
        from: buildSwapSideData(originToken, tradePool),
        to: buildSwapSideData(token, tradePool),
        route: [originToken.symbol, token.symbol],
      }
    }

    // Case 3: poolA(TokenA) <> poolB(TokenB) (temp workaround for tokens from diff pools)
    else if (sharedPoolsSet.size === 0) {
      const originPool = [...originTokenPoolsSet].find(
        ({ isOutdated }) => !isOutdated,
      )
      const destinationPool = [...tokenPoolsSet].find(
        ({ isOutdated }) => !isOutdated,
      )
      const metaSwapPool = originPool?.metaSwapAddresses
        ? originPool
        : destinationPool

      // true if we swap meta<->meta (through stables)
      // i.e. both origin and destination are metapools
      const thruStables = !!(
        originPool?.metaSwapAddresses && destinationPool?.metaSwapAddresses
      )

      // swap data is built from either meta<->meta or stables<->meta when
      // shared pool size is 0.
      swapData = {
        type: thruStables
          ? SWAP_TYPES.META_TO_META
          : SWAP_TYPES.STABLES_TO_META,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        from: buildSwapSideData(originToken, metaSwapPool!),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        to: buildSwapSideData(token, metaSwapPool!),
        route: [originToken.symbol, token.symbol],
      }
    }

    // use this swap only if we haven't already calculated a better swap for the pair
    const existingTokenSwapData: SwapData | undefined =
      tokenToSwapDataMap[token.symbol]
    const existingSwapIdx = SWAP_TYPES_ORDERED_ASC.indexOf(
      existingTokenSwapData?.type,
    )
    const newSwapIdx = SWAP_TYPES_ORDERED_ASC.indexOf(swapData.type)
    if (!existingTokenSwapData || newSwapIdx > existingSwapIdx) {
      tokenToSwapDataMap[token.symbol] = swapData
    }
  })

  return Object.values(tokenToSwapDataMap)
}
