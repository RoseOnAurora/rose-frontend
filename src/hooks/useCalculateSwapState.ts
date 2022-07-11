import { DebouncedFunc, debounce } from "lodash"
import { PoolName, SWAP_TYPES, TOKENS_MAP } from "../constants"
import {
  calculateExchangeRate,
  calculatePrice,
  countDecimalPlaces,
  formatBNToString,
} from "../utils"
import { useCallback, useState } from "react"
import { usePoolContract, useSwapComposerContract } from "./useContract"
import { AppState } from "../state"
import { ContractReceipt } from "@ethersproject/contracts"
import { SwapState } from "../types/swap"
import { Zero } from "@ethersproject/constants"
import { calculatePriceImpact } from "../utils/priceImpact"
import { parseUnits } from "@ethersproject/units"
import { useActiveWeb3React } from "."
import { useApproveAndSwap } from "./useApproveAndSwap"
import { useCalculateSwapPairs } from "./useCalculateSwapPairs"
import { usePoolTokenBalances } from "../state/wallet/hooks"
import { useSelector } from "react-redux"

const EMPTY_SWAP_STATE: SwapState = {
  from: {
    symbol: "",
    value: "0.0",
    valueUSD: Zero,
  },
  to: {
    symbol: "",
    value: Zero,
    valueUSD: Zero,
  },
  priceImpact: Zero,
  exchangeRate: Zero,
  swapType: SWAP_TYPES.INVALID,
  currentSwapPairs: [],
}

const useCalculateSwapState = (): [
  SwapState,
  DebouncedFunc<(fromAmount: string) => Promise<void>>,
  () => void,
  (fromSymbol: string | undefined) => void,
  (toSymbol: string | undefined) => void,
  (value: string) => void,
  () => Promise<ContractReceipt>,
] => {
  // state
  const [swapState, setSwapState] = useState<SwapState>(EMPTY_SWAP_STATE)

  // hooks
  const { chainId } = useActiveWeb3React()
  const approveAndSwap = useApproveAndSwap()
  const tokenBalances = usePoolTokenBalances()
  const calculateSwapPairs = useCalculateSwapPairs()
  const { tokenPricesUSD } = useSelector((state: AppState) => state.application)
  const swapComposerContract = useSwapComposerContract()
  const swapContract = usePoolContract(
    swapState.to.poolName as PoolName | undefined,
  )

  // handler for calculating swap amount for given from input
  const calculateSwapAmount = useCallback(
    debounce(async (fromAmount: string): Promise<void> => {
      // error checks -- TO-DO: add UI feedback
      if (swapState.swapType === SWAP_TYPES.INVALID) return
      if (tokenBalances === null || chainId == null) return
      if (
        swapState.from.tokenIndex === undefined ||
        swapState.from.poolName === undefined ||
        swapState.to.tokenIndex === undefined ||
        swapState.to.poolName === undefined
      )
        return

      // setup some local data
      const amountToGive = parseUnits(
        fromAmount,
        TOKENS_MAP[swapState.from.symbol].decimals,
      )
      const tokenFrom = TOKENS_MAP[swapState.from.symbol]
      const tokenTo = TOKENS_MAP[swapState.to.symbol]
      let amountToReceive = Zero

      // delegate to current contract call to calculate swap amount
      if (amountToGive.isZero()) {
        amountToReceive = Zero
      } else if (
        // We use direct swap for stable<->stable (basic swap)
        swapState.swapType === SWAP_TYPES.DIRECT &&
        swapContract != null
      ) {
        amountToReceive = await swapContract.get_dy(
          swapState.from.tokenIndex,
          swapState.to.tokenIndex,
          amountToGive,
        )
      } // meta<->meta
      else if (
        swapState.swapType === SWAP_TYPES.META_TO_META &&
        swapComposerContract != null
      ) {
        amountToReceive = await swapComposerContract.get_dy_thru_stables(
          tokenFrom.addresses[chainId],
          tokenTo.addresses[chainId],
          amountToGive,
        )
        // stable<->meta
      } else if (
        swapState.swapType === SWAP_TYPES.STABLES_TO_META &&
        swapContract != null
      ) {
        amountToReceive = await swapContract.get_dy_underlying(
          swapState.from.tokenIndex,
          swapState.to.tokenIndex,
          amountToGive,
        )
      }

      // calculate USD price
      const toValueUSD = calculatePrice(
        amountToReceive,
        tokenPricesUSD?.[tokenTo.symbol],
        tokenTo.decimals,
      )

      const fromValueUsd = calculatePrice(
        amountToGive,
        tokenPricesUSD?.[tokenFrom.symbol],
        tokenFrom.decimals,
      )

      // calculate price impact
      const priceImpact = calculatePriceImpact(fromValueUsd, toValueUSD)

      // update state
      setSwapState((prevState) => {
        const newState = {
          ...prevState,
          from: {
            ...prevState.from,
            valueUSD: fromValueUsd,
          },
          to: {
            ...prevState.to,
            value: amountToReceive,
            valueUSD: toValueUSD,
          },
          priceImpact,
          exchangeRate: calculateExchangeRate(
            amountToGive,
            tokenFrom.decimals,
            amountToReceive,
            tokenTo.decimals,
          ),
        }
        return newState
      })
    }, 250),
    [tokenBalances, swapState, swapContract, chainId, tokenPricesUSD],
  )

  const handleUpdateAmountFrom = (value: string): void => {
    setSwapState((prevState) => {
      return {
        ...prevState,
        from: {
          ...prevState.from,
          value,
          valueUSD: calculatePrice(
            value,
            tokenPricesUSD?.[prevState.from.symbol],
          ),
        },
      }
    })
  }

  // handler for updating from/to on reversing the exchange direction
  const handleReverseExchangeDirection = (): void => {
    setSwapState((prevState) => {
      const swapPairs = calculateSwapPairs(TOKENS_MAP[prevState.to.symbol])
      const activeSwapPair = swapPairs.find(
        (pair) => pair.to.symbol === prevState.from.symbol,
      )
      const fromDecimals = TOKENS_MAP[prevState.from.symbol]?.decimals || 0
      const toDecimals = TOKENS_MAP[prevState.to.symbol]?.decimals || 0
      const updatedFromVal =
        fromDecimals <= toDecimals ||
        countDecimalPlaces(prevState.from.value) <= toDecimals
          ? prevState.from.value
          : (+prevState.from.value).toFixed(toDecimals)
      return {
        from: {
          symbol: prevState.to.symbol,
          valueUSD: calculatePrice(
            prevState.from.value,
            tokenPricesUSD?.[prevState.from.symbol],
          ),
          value: updatedFromVal,
          poolName: activeSwapPair?.from.poolName,
          tokenIndex: activeSwapPair?.from.tokenIndex,
        },
        to: {
          symbol: prevState.from.symbol,
          value: Zero,
          valueUSD: Zero,
          poolName: activeSwapPair?.to.poolName,
          tokenIndex: activeSwapPair?.to.tokenIndex,
        },
        priceImpact: Zero,
        exchangeRate: Zero,
        currentSwapPairs: swapPairs,
        swapType: activeSwapPair?.type || SWAP_TYPES.INVALID,
      }
    })
  }

  const handleUpdateTokenFrom = (symbol: string | undefined): void => {
    if (!symbol) return
    if (symbol === swapState.to.symbol) return handleReverseExchangeDirection()
    setSwapState((prevState) => {
      const swapPairs = calculateSwapPairs(TOKENS_MAP[symbol])
      const activeSwapPair = swapPairs.find(
        (pair) => pair.to.symbol === prevState.to.symbol,
      )
      const isValidSwap = activeSwapPair?.type !== SWAP_TYPES.INVALID
      const fromDecimals = TOKENS_MAP[prevState.from.symbol]?.decimals || 0
      const toDecimals = TOKENS_MAP[symbol]?.decimals || 0
      const updatedFromVal =
        fromDecimals <= toDecimals ||
        countDecimalPlaces(prevState.from.value) <= toDecimals
          ? prevState.from.value
          : (+prevState.from.value).toFixed(toDecimals)
      return {
        from: {
          symbol,
          value: updatedFromVal,
          valueUSD: calculatePrice(
            prevState.from.value,
            tokenPricesUSD?.[prevState.from.symbol],
          ),
          poolName: activeSwapPair?.from.poolName,
          tokenIndex: activeSwapPair?.from.tokenIndex,
        },
        to: {
          value: Zero,
          valueUSD: Zero,
          symbol: isValidSwap ? prevState.to.symbol : "",
          poolName: isValidSwap ? activeSwapPair?.to.poolName : undefined,
          tokenIndex: isValidSwap ? activeSwapPair?.to.tokenIndex : undefined,
        },
        priceImpact: Zero,
        exchangeRate: Zero,
        currentSwapPairs: swapPairs,
        swapType: activeSwapPair?.type || SWAP_TYPES.INVALID,
      }
    })
  }

  const handleUpdateTokenTo = (symbol: string | undefined): void => {
    if (!symbol) return
    if (symbol === swapState.from.symbol)
      return handleReverseExchangeDirection()
    setSwapState((prevState) => {
      const activeSwapPair = prevState.currentSwapPairs.find(
        (pair) => pair.to.symbol === symbol,
      )
      return {
        ...prevState,
        from: {
          ...prevState.from,
          ...(activeSwapPair?.from || {}),
        },
        to: {
          value: Zero,
          symbol,
          valueUSD: Zero,
          poolName: activeSwapPair?.to.poolName,
          tokenIndex: activeSwapPair?.to.tokenIndex,
        },
        priceImpact: Zero,
        exchangeRate: Zero,
        swapType: activeSwapPair?.type || SWAP_TYPES.INVALID,
      }
    })
  }

  const handleConfirmTransaction = async (): Promise<ContractReceipt> => {
    const fromToken = TOKENS_MAP[swapState.from.symbol]
    const toToken = TOKENS_MAP[swapState.to.symbol]
    if (
      swapState.swapType === SWAP_TYPES.INVALID ||
      swapState.from.tokenIndex === undefined ||
      swapState.from.poolName === undefined ||
      swapState.to.tokenIndex === undefined ||
      swapState.to.poolName === undefined
    ) {
      setSwapState((prevState) => ({
        ...EMPTY_SWAP_STATE,
        from: {
          ...prevState.from,
          value: "0.0",
          valueUSD: Zero,
        },
      }))
      throw Error("Unable to perform swap at this time!")
    }

    console.log(
      swapState,
      swapState.from.value,
      formatBNToString(swapState.to.value, toToken.decimals, toToken.decimals),
    )

    // perform swap
    const receipt = await approveAndSwap({
      poolContract: swapContract,
      swapComposerContract: swapComposerContract,
      from: {
        amount: parseUnits(swapState.from.value, fromToken.decimals),
        symbol: swapState.from.symbol,
        poolName: swapState.from.poolName,
        tokenIndex: swapState.from.tokenIndex,
      },
      to: {
        amount: swapState.to.value,
        symbol: swapState.to.symbol,
        poolName: swapState.to.poolName,
        tokenIndex: swapState.to.tokenIndex,
      },
      swapType: swapState.swapType,
    })

    // Clear input after deposit
    setSwapState((prevState) => ({
      from: {
        ...prevState.from,
        value: "0.0",
        valueUSD: Zero,
      },
      to: {
        ...prevState.to,
        value: Zero,
        valueUSD: Zero,
      },
      priceImpact: Zero,
      exchangeRate: Zero,
      currentSwapPairs: prevState.currentSwapPairs,
      swapType: prevState.swapType,
    }))
    return receipt
  }

  return [
    swapState,
    calculateSwapAmount,
    handleReverseExchangeDirection,
    handleUpdateTokenFrom,
    handleUpdateTokenTo,
    handleUpdateAmountFrom,
    handleConfirmTransaction,
  ]
}

export default useCalculateSwapState
