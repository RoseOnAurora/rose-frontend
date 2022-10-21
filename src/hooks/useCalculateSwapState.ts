import { ChainId, PoolName, SWAP_TYPES, TOKENS_MAP } from "../constants"
import { DebouncedFunc, debounce } from "lodash"
import { calculateExchangeRate, calculatePrice } from "../utils"
import { useCallback, useState } from "react"
import useChakraToast, { TransactionType } from "./useChakraToast"
import { usePoolContract, useSwapComposerContract } from "./useContract"
import { AppState } from "../state"
import { ContractReceipt } from "@ethersproject/contracts"
import { SwapState } from "../types/swap"
import { Zero } from "@ethersproject/constants"
import { calculatePriceImpact } from "../utils/priceImpact"
import parseStringToBigNumber from "../utils/parseStringToBigNumber"
import { parseUnits } from "@ethersproject/units"
import { useApproveAndSwap } from "./useApproveAndSwap"
import { useCalculateSwapPairs } from "./useCalculateSwapPairs"
import { usePoolTokenBalances } from "./useTokenBalances"
import { useSelector } from "react-redux"
import { useWeb3React } from "@web3-react/core"

const EMPTY_SWAP_STATE: SwapState = {
  from: {
    symbol: "",
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
  (fromAmount: string) => Promise<ContractReceipt>,
] => {
  // state
  const [swapState, setSwapState] = useState<SwapState>(EMPTY_SWAP_STATE)

  // hooks
  const { chainId } = useWeb3React()
  const approveAndSwap = useApproveAndSwap()
  const tokenBalances = usePoolTokenBalances()
  const toast = useChakraToast()
  const calculateSwapPairs = useCalculateSwapPairs()
  const { tokenPricesUSD } = useSelector((state: AppState) => state.application)
  const swapComposerContract = useSwapComposerContract()
  const swapContract = usePoolContract(
    swapState.to.poolName as PoolName | undefined,
  )

  // handler for calculating swap amount for given from input
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const calculateSwapAmount = useCallback(
    debounce(async (fromAmount: string): Promise<void> => {
      if (swapState.swapType === SWAP_TYPES.INVALID) return
      if (
        swapState.from.tokenIndex === undefined ||
        swapState.from.poolName === undefined ||
        swapState.to.tokenIndex === undefined ||
        swapState.to.poolName === undefined
      ) {
        toast.transactionError({
          txnType: TransactionType.SWAP,
          description: "Swap type is invalid.",
        })
        return
      }
      if (
        tokenBalances === null ||
        chainId == null ||
        !swapComposerContract ||
        !swapContract
      ) {
        toast.transactionError({
          txnType: TransactionType.SWAP,
          description: "Network is temporarily down. Please try again.",
        })
        return
      }

      // setup some local data
      const amountToGive = parseUnits(
        fromAmount || "0",
        TOKENS_MAP[swapState.from.symbol].decimals,
      )
      const tokenFrom = TOKENS_MAP[swapState.from.symbol]
      const tokenTo = TOKENS_MAP[swapState.to.symbol]
      let amountToReceive = Zero

      if (fromAmount && +fromAmount !== 0) {
        switch (swapState.swapType) {
          case SWAP_TYPES.DIRECT:
            amountToReceive = await swapContract.get_dy(
              swapState.from.tokenIndex,
              swapState.to.tokenIndex,
              amountToGive,
            )
            break
          case SWAP_TYPES.META_TO_META:
            amountToReceive = await swapComposerContract.get_dy_thru_stables(
              tokenFrom.addresses[chainId as ChainId],
              tokenTo.addresses[chainId as ChainId],
              amountToGive,
            )
            break
          case SWAP_TYPES.STABLES_TO_META:
            amountToReceive = await swapContract.get_dy_underlying(
              swapState.from.tokenIndex,
              swapState.to.tokenIndex,
              amountToGive,
            )
        }
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
        return {
          ...prevState,
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
      })
    }, 250),
    [tokenBalances, swapState, swapContract, chainId, tokenPricesUSD],
  )

  // handler for updating from/to on reversing the exchange direction
  const handleReverseExchangeDirection = (): void => {
    setSwapState((prevState) => {
      const swapPairs = calculateSwapPairs(TOKENS_MAP[prevState.to.symbol])
      const activeSwapPair = swapPairs.find(
        (pair) => pair.to.symbol === prevState.from.symbol,
      )
      return {
        from: {
          symbol: prevState.to.symbol,
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
      return {
        from: {
          symbol,
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

  const handleConfirmTransaction = async (
    fromAmount: string,
  ): Promise<ContractReceipt> => {
    if (
      swapState.swapType === SWAP_TYPES.INVALID ||
      swapState.from.tokenIndex === undefined ||
      swapState.from.poolName === undefined ||
      swapState.to.tokenIndex === undefined ||
      swapState.to.poolName === undefined
    ) {
      throw Error("Unable to perform swap at this time!")
    }

    // get the token info
    const fromToken = TOKENS_MAP[swapState.from.symbol]

    // safely parse the amount to swap
    const { value, isFallback } = parseStringToBigNumber(
      fromAmount,
      fromToken.decimals,
    )

    if (isFallback) throw new Error("Swap failed. Please try again.")

    // perform swap
    const receipt = await approveAndSwap({
      poolContract: swapContract,
      swapComposerContract: swapComposerContract,
      from: {
        amount: value,
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
    setSwapState(() => EMPTY_SWAP_STATE)
    return receipt
  }

  return [
    swapState,
    calculateSwapAmount,
    handleReverseExchangeDirection,
    handleUpdateTokenFrom,
    handleUpdateTokenTo,
    handleConfirmTransaction,
  ]
}

export default useCalculateSwapState
