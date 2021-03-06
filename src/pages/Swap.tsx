/* eslint @typescript-eslint/no-unsafe-assignment: 0 */
/* eslint @typescript-eslint/no-unsafe-call: 0 */
import {
  IS_VIRTUAL_SWAP_ACTIVE,
  POOLS_MAP,
  PoolName,
  RUSD,
  SWAP_TYPES,
  TOKENS_MAP,
} from "../constants"
import React, {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  SwapData,
  SwapSide,
  useCalculateSwapPairs,
} from "../hooks/useCalculateSwapPairs"
import {
  calculateExchangeRate,
  calculatePrice,
  formatBNToString,
  shiftBNDecimals,
} from "../utils"
import { formatUnits, parseUnits } from "@ethersproject/units"
import {
  useBridgeContract,
  usePoolContract,
  useSwapComposerContract,
  useSynthetixExchangeRatesContract,
} from "../hooks/useContract"

import { AppState } from "../state/index"
import { BigNumber } from "@ethersproject/bignumber"
import { ContractReceipt } from "@ethersproject/contracts"
import SwapPage from "../components/SwapPage"
import { Zero } from "@ethersproject/constants"
import { calculateGasEstimate } from "../utils/gasEstimate"
import { calculatePriceImpact } from "../utils/priceImpact"
import { debounce } from "lodash"
import { useActiveWeb3React } from "../hooks"
import { useApproveAndSwap } from "../hooks/useApproveAndSwap"
import { usePoolTokenBalances } from "../state/wallet/hooks"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"
import { utils } from "ethers"

type FormState = {
  error: null | string
  from: {
    value: string
    valueUSD: BigNumber
  } & SwapSide
  to: {
    value: BigNumber
    valueUSD: BigNumber
    valueSynth: BigNumber
  } & SwapSide
  priceImpact: BigNumber
  exchangeRate: BigNumber
  route: string[]
  swapType: SWAP_TYPES
  currentSwapPairs: SwapData[]
}
export interface TokenOption {
  symbol: string
  name: string
  valueUSD: BigNumber
  amount: BigNumber
  icon: string
  decimals: number
  swapType: SWAP_TYPES | null
  isAvailable: boolean
}

const EMPTY_FORM_STATE = {
  error: null,
  from: {
    symbol: "",
    value: "0.0",
    valueUSD: Zero,
  },
  to: {
    symbol: "",
    value: Zero,
    valueUSD: Zero,
    valueSynth: Zero,
  },
  priceImpact: Zero,
  exchangeRate: Zero,
  route: [],
  swapType: SWAP_TYPES.INVALID,
  currentSwapPairs: [],
}

function Swap(): ReactElement {
  const { t } = useTranslation()
  const { chainId } = useActiveWeb3React()
  const approveAndSwap = useApproveAndSwap()
  const tokenBalances = usePoolTokenBalances()
  const bridgeContract = useBridgeContract()
  const snxEchangeRatesContract = useSynthetixExchangeRatesContract()
  const calculateSwapPairs = useCalculateSwapPairs()
  const { tokenPricesUSD } = useSelector((state: AppState) => state.application)

  const [formState, setFormState] = useState<FormState>(EMPTY_FORM_STATE)
  const [prevFormState, setPrevFormState] =
    useState<FormState>(EMPTY_FORM_STATE)

  const swapContract = usePoolContract(
    formState.to.poolName as PoolName | undefined,
  )
  // meta<->meta swaps thru stables
  const swapComposerContract = useSwapComposerContract()

  // build a representation of pool tokens for the UI
  const tokenOptions = useMemo(() => {
    const allTokens = Object.values(TOKENS_MAP)
      .filter(({ isLPToken }) => !isLPToken)
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
      formState.currentSwapPairs.length > 0
        ? formState.currentSwapPairs
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
                isAvailable: IS_VIRTUAL_SWAP_ACTIVE
                  ? swapType !== SWAP_TYPES.INVALID
                  : swapType === SWAP_TYPES.DIRECT ||
                    swapType === SWAP_TYPES.META_TO_META ||
                    swapType === SWAP_TYPES.STABLES_TO_META,
              }
            })
            .sort(sortTokenOptions)
        : allTokens
    // from: all tokens always available. to: limited by selected "from" token.
    return {
      from: allTokens,
      to: toTokens,
    }
  }, [tokenPricesUSD, tokenBalances, formState.currentSwapPairs])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const calculateSwapAmount = useCallback(
    debounce(async (formStateArg: FormState) => {
      if (formStateArg.swapType === SWAP_TYPES.INVALID) return
      if (tokenBalances === null || chainId == null)
        // || bridgeContract == null
        return
      if (
        formStateArg.from.tokenIndex === undefined ||
        formStateArg.from.poolName === undefined ||
        formStateArg.to.tokenIndex === undefined ||
        formStateArg.to.poolName === undefined
      )
        return
      const cleanedFormFromValue = formStateArg.from.value.replace(/[$,]/g, "")
      if (
        cleanedFormFromValue === "" ||
        isNaN(+cleanedFormFromValue) ||
        formStateArg.to.symbol === ""
      ) {
        setFormState((prevState) => ({
          ...prevState,
          to: {
            ...prevState.to,
            value: Zero,
          },
          priceImpact: Zero,
        }))
        return
      }
      const amountToGive = parseUnits(
        cleanedFormFromValue,
        TOKENS_MAP[formStateArg.from.symbol].decimals,
      )
      const tokenFrom = TOKENS_MAP[formStateArg.from.symbol]
      const tokenTo = TOKENS_MAP[formStateArg.to.symbol]
      let error: string | null = null
      let amountToReceive = Zero
      let amountMediumSynth = Zero
      if (amountToGive.gt(tokenBalances[formStateArg.from.symbol] || Zero)) {
        error = t("insufficientBalance")
      }
      if (amountToGive.isZero()) {
        amountToReceive = Zero
      } else if (
        formStateArg.swapType === SWAP_TYPES.TOKEN_TO_TOKEN &&
        bridgeContract != null
      ) {
        const originPool = POOLS_MAP[formStateArg.from.poolName]
        const destinationPool = POOLS_MAP[formStateArg.to.poolName]
        const [amountOutSynth, amountOutToken] =
          await bridgeContract.calcTokenToToken(
            [originPool.addresses[chainId], destinationPool.addresses[chainId]],
            formStateArg.from.tokenIndex,
            formStateArg.to.tokenIndex,
            amountToGive,
          )
        amountToReceive = amountOutToken
        amountMediumSynth = amountOutSynth
      } else if (
        formStateArg.swapType === SWAP_TYPES.SYNTH_TO_TOKEN &&
        bridgeContract != null
      ) {
        const destinationPool = POOLS_MAP[formStateArg.to.poolName]
        const [amountOutSynth, amountOutToken] =
          await bridgeContract.calcSynthToToken(
            destinationPool.addresses[chainId],
            utils.formatBytes32String(formStateArg.from.symbol),
            formStateArg.to.tokenIndex,
            amountToGive,
          )
        amountToReceive = amountOutToken
        amountMediumSynth = amountOutSynth
      } else if (
        formStateArg.swapType === SWAP_TYPES.TOKEN_TO_SYNTH &&
        bridgeContract != null
      ) {
        const originPool = POOLS_MAP[formStateArg.from.poolName]
        amountToReceive = await bridgeContract.calcTokenToSynth(
          originPool.addresses[chainId],
          formStateArg.from.tokenIndex,
          utils.formatBytes32String(formStateArg.to.symbol),
          amountToGive,
        )
        // We use direct swap for stable<->stable (basic swap)
      } else if (
        formStateArg.swapType === SWAP_TYPES.DIRECT &&
        swapContract != null
      ) {
        amountToReceive = await swapContract.get_dy(
          formStateArg.from.tokenIndex,
          formStateArg.to.tokenIndex,
          amountToGive,
        )
      } // meta<->meta
      else if (
        formStateArg.swapType === SWAP_TYPES.META_TO_META &&
        swapComposerContract != null
      ) {
        amountToReceive = await swapComposerContract.get_dy_thru_stables(
          tokenFrom.addresses[chainId],
          tokenTo.addresses[chainId],
          amountToGive,
        )
        // stable<->meta
      } else if (
        formStateArg.swapType === SWAP_TYPES.STABLES_TO_META &&
        swapContract != null
      ) {
        amountToReceive = await swapContract.get_dy_underlying(
          formStateArg.from.tokenIndex,
          formStateArg.to.tokenIndex,
          amountToGive,
        )
        // 3. stable<->stable
      } else if (
        formStateArg.swapType === SWAP_TYPES.SYNTH_TO_SYNTH &&
        snxEchangeRatesContract != null
      ) {
        amountToReceive = await snxEchangeRatesContract.effectiveValue(
          utils.formatBytes32String(formStateArg.from.symbol),
          amountToGive,
          utils.formatBytes32String(formStateArg.to.symbol),
        )
      }
      const toValueUSD = calculatePrice(
        amountToReceive,
        tokenPricesUSD?.[tokenTo.symbol],
        tokenTo.decimals,
      )
      const priceImpact = calculatePriceImpact(
        formStateArg.from.valueUSD,
        toValueUSD,
      )
      setFormState((prevState) => {
        const newState = {
          ...prevState,
          error,
          to: {
            ...prevState.to,
            value: amountToReceive,
            valueUSD: toValueUSD,
            valueSynth: amountMediumSynth,
          },
          priceImpact,
          exchangeRate: calculateExchangeRate(
            amountToGive,
            tokenFrom.decimals,
            amountToReceive,
            tokenTo.decimals,
          ),
        }
        setPrevFormState(newState)
        return newState
      })
    }, 250),
    [tokenBalances, swapContract, bridgeContract, chainId, tokenPricesUSD],
  )

  useEffect(() => {
    // watch user input fields and calculate other fields if necessary
    if (
      prevFormState.from.symbol !== formState.from.symbol ||
      prevFormState.from.value !== formState.from.value ||
      prevFormState.to.symbol !== formState.to.symbol
    ) {
      void calculateSwapAmount(formState)
    }
  }, [prevFormState, formState, calculateSwapAmount])

  function handleUpdateAmountFrom(value: string): void {
    setFormState((prevState) => {
      const nextState = {
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
      return nextState
    })
  }
  function handleReverseExchangeDirection(): void {
    setFormState((prevState) => {
      const swapPairs = calculateSwapPairs(TOKENS_MAP[prevState.to.symbol])
      const activeSwapPair = swapPairs.find(
        (pair) => pair.to.symbol === prevState.from.symbol,
      )
      const nextState = {
        error: null,
        from: {
          symbol: prevState.to.symbol,
          value: formatBNToString(
            prevState.to.value,
            TOKENS_MAP[prevState.to.symbol].decimals,
            TOKENS_MAP[prevState.to.symbol].decimals,
          ),
          valueUSD: calculatePrice(
            prevState.from.value,
            tokenPricesUSD?.[prevState.to.symbol],
          ),
          poolName: activeSwapPair?.from.poolName,
          tokenIndex: activeSwapPair?.from.tokenIndex,
        },
        to: {
          symbol: prevState.from.symbol,
          value: Zero,
          valueUSD: Zero,
          valueSynth: Zero,
          poolName: activeSwapPair?.to.poolName,
          tokenIndex: activeSwapPair?.to.tokenIndex,
        },
        priceImpact: Zero,
        exchangeRate: Zero,
        route: activeSwapPair?.route || [],
        currentSwapPairs: swapPairs,
        swapType: activeSwapPair?.type || SWAP_TYPES.INVALID,
      }
      return nextState
    })
  }
  function handleUpdateTokenFrom(symbol: string): void {
    if (symbol === formState.to.symbol) return handleReverseExchangeDirection()
    setFormState((prevState) => {
      const swapPairs = calculateSwapPairs(TOKENS_MAP[symbol])
      const activeSwapPair = swapPairs.find(
        (pair) => pair.to.symbol === prevState.to.symbol,
      )
      const isValidSwap =
        IS_VIRTUAL_SWAP_ACTIVE && activeSwapPair
          ? activeSwapPair.type !== SWAP_TYPES.INVALID
          : activeSwapPair?.type === SWAP_TYPES.DIRECT ||
            activeSwapPair?.type === SWAP_TYPES.META_TO_META ||
            activeSwapPair?.type === SWAP_TYPES.STABLES_TO_META
      const fromDecimals = TOKENS_MAP[prevState.from.symbol]?.decimals || 0
      const toDecimals = TOKENS_MAP[symbol]?.decimals || 0
      const nextState = {
        ...prevState,
        error: null,
        from: {
          ...prevState.from,
          symbol,
          value:
            fromDecimals > toDecimals
              ? (+prevState.from.value).toFixed(toDecimals)
              : prevState.from.value,
          valueUSD: calculatePrice(
            prevState.from.value,
            tokenPricesUSD?.[prevState.from.symbol],
          ),
          poolName: activeSwapPair?.from.poolName,
          tokenIndex: activeSwapPair?.from.tokenIndex,
        },
        to: {
          ...prevState.to,
          value: Zero,
          valueSynth: Zero,
          valueUSD: Zero,
          symbol: isValidSwap ? prevState.to.symbol : "",
          poolName: isValidSwap ? activeSwapPair?.to.poolName : undefined,
          tokenIndex: isValidSwap ? activeSwapPair?.to.tokenIndex : undefined,
        },
        priceImpact: Zero,
        exchangeRate: Zero,
        route: activeSwapPair?.route || [],
        currentSwapPairs: swapPairs,
        swapType: activeSwapPair?.type || SWAP_TYPES.INVALID,
      }
      return nextState
    })
  }

  function handleUpdateTokenTo(symbol: string): void {
    if (symbol === formState.from.symbol)
      return handleReverseExchangeDirection()
    setFormState((prevState) => {
      const activeSwapPair = prevState.currentSwapPairs.find(
        (pair) => pair.to.symbol === symbol,
      )
      const nextState = {
        ...prevState,
        from: {
          ...prevState.from,
          ...(activeSwapPair?.from || {}),
        },
        error: null,
        to: {
          ...prevState.to,
          value: Zero,
          valueSynth: Zero,
          symbol,
          valueUSD: Zero,
          poolName: activeSwapPair?.to.poolName,
          tokenIndex: activeSwapPair?.to.tokenIndex,
        },
        priceImpact: Zero,
        exchangeRate: Zero,
        route: activeSwapPair?.route || [],
        swapType: activeSwapPair?.type || SWAP_TYPES.INVALID,
      }
      return nextState
    })
  }

  async function handleConfirmTransaction(): Promise<ContractReceipt | void> {
    const fromToken = TOKENS_MAP[formState.from.symbol]
    if (
      formState.swapType === SWAP_TYPES.INVALID ||
      formState.from.tokenIndex === undefined ||
      formState.from.poolName === undefined ||
      formState.to.tokenIndex === undefined ||
      formState.to.poolName === undefined
    ) {
      console.debug("Invalid transaction", formState)
      setFormState((prevState) => ({
        ...EMPTY_FORM_STATE,
        error: "Invalid Transaction",
        from: {
          ...prevState.from,
          value: "0.0",
          valueUSD: Zero,
        },
      }))
      return
    }
    const receipt = await approveAndSwap({
      bridgeContract: bridgeContract,
      poolContract: swapContract,
      swapComposerContract: swapComposerContract,
      from: {
        amount: parseUnits(formState.from.value, fromToken.decimals),
        symbol: formState.from.symbol,
        poolName: formState.from.poolName,
        tokenIndex: formState.from.tokenIndex,
      },
      to: {
        amount: formState.to.value,
        symbol: formState.to.symbol,
        poolName: formState.to.poolName,
        tokenIndex: formState.to.tokenIndex,
        amountMediumSynth: formState.to.valueSynth,
      },
      swapType: formState.swapType,
    })
    // Clear input after deposit
    setFormState((prevState) => ({
      error: null,
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
      route: prevState.route,
      currentSwapPairs: prevState.currentSwapPairs,
      swapType: prevState.swapType,
    }))
    return receipt
  }

  const gasPrice = Zero
  const gasAmount = calculateGasEstimate(formState.swapType).mul(gasPrice) // units of gas * GWEI/Unit of gas

  const txnGasCost = {
    amount: gasAmount,
    valueUSD: tokenPricesUSD?.ETH
      ? parseUnits(tokenPricesUSD.ETH.toFixed(2), 18) // USD / ETH  * 10^18
          .mul(gasAmount) // GWEI
          .div(BigNumber.from(10).pow(25)) // USD / ETH * GWEI * ETH / GWEI = USD
      : null,
  }

  return (
    <SwapPage
      tokenOptions={tokenOptions}
      exchangeRateInfo={{
        pair: `${formState.from.symbol}/${formState.to.symbol}`,
        exchangeRate: formState.exchangeRate,
        priceImpact: formState.priceImpact,
        route: formState.route,
      }}
      txnGasCost={txnGasCost}
      fromState={formState.from}
      toState={{
        ...formState.to,
        value:
          formState.to.symbol === ""
            ? "0"
            : formatUnits(
                formState.to.value,
                TOKENS_MAP[formState.to.symbol].decimals,
              ),
      }}
      swapType={formState.swapType}
      onChangeFromAmount={handleUpdateAmountFrom}
      onChangeFromToken={handleUpdateTokenFrom}
      onChangeToToken={handleUpdateTokenTo}
      error={formState.error}
      onConfirmTransaction={handleConfirmTransaction}
      onClickReverseExchangeDirection={handleReverseExchangeDirection}
    />
  )
}

export default Swap

const sortTokenOptions = (a: TokenOption, b: TokenOption) => {
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
