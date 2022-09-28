/* eslint-disable */
import {
  NumberInputState,
  numberInputStateCreator,
} from "../utils/numberInputState"
import { POOLS_MAP, PoolName } from "../constants"
import { useCallback, useMemo, useState } from "react"
import { BigNumber } from "@ethersproject/bignumber"
import { Contract } from "@ethersproject/contracts"
import { debounce } from "lodash"
import { parseUnits } from "@ethersproject/units"
import { useActiveWeb3React } from "."
import { usePoolContract } from "../hooks/useContract"
import usePoolData from "../hooks/usePoolData"
import { RoseStablesPool } from "../../types/ethers-contracts/RoseStablesPool"

interface ErrorState {
  field: string
  message: string
}
const IMBALANCE = "IMBALANCE"
const ALL = "ALL"

interface TokenInputs {
  [symbol: string]: NumberInputState
}
export interface WithdrawFormState {
  percentage: string | null
  withdrawType: string
  tokenInputs: TokenInputs
  lpTokenAmountToSpend: BigNumber
  error: ErrorState | null
}
type FormFields = Exclude<keyof WithdrawFormState, "error">
export type WithdrawFormAction = {
  fieldName: FormFields | "reset"
  tokenSymbol?: string
  value: string
}

export default function useWithdrawFormState(
  poolName: PoolName,
): [WithdrawFormState, (action: WithdrawFormAction) => void] {
  const POOL = POOLS_MAP[poolName]
  const poolContract = usePoolContract(poolName) as Contract
  const [, userShareData] = usePoolData(poolName)
  const { account } = useActiveWeb3React()
  const tokenInputStateCreators: {
    [tokenSymbol: string]: ReturnType<typeof numberInputStateCreator>
  } = useMemo(
    () =>
      POOL.poolTokens.reduce(
        (acc, { symbol, decimals }) => ({
          ...acc,
          [symbol]: numberInputStateCreator(decimals, BigNumber.from("0")),
        }),
        {},
      ),
    [POOL.poolTokens],
  )
  const tokenInputsEmptyState = useMemo(
    () =>
      POOL.poolTokens.reduce(
        (acc, { symbol }) => ({
          ...acc,
          [symbol]: tokenInputStateCreators[symbol](""),
        }),
        {},
      ),
    [POOL.poolTokens, tokenInputStateCreators],
  )
  const formEmptyState = useMemo(
    () => ({
      percentage: "",
      tokenInputs: tokenInputsEmptyState,
      withdrawType: ALL,
      error: null,
      lpTokenAmountToSpend: BigNumber.from("0"),
    }),
    [tokenInputsEmptyState],
  )
  const [formState, setFormState] = useState<WithdrawFormState>(formEmptyState)

  // TODO: resolve this, it's a little unsafe
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const calculateAndUpdateDynamicFields = useCallback(
    debounce(async (state: WithdrawFormState) => {
      if (userShareData == null || poolContract == null || account == null)
        return

      let percentageRaw
      if (state.percentage === "") {
        percentageRaw = "0"
      } else if (state.percentage === null) {
        percentageRaw = "100"
      } else {
        percentageRaw = state.percentage
      }

      // LP * % to be withdrawn
      const effectiveUserLPTokenBalance = userShareData.lpTokenBalance
        .mul(parseUnits(percentageRaw, 5)) // difference between numerator and denominator because we're going from 100 to 1.00
        .div(10 ** 7)

      const txnAmounts: string[] = POOL.poolTokens.map((poolToken) => {
        return state.tokenInputs[poolToken.symbol].valueSafe
      })

      // Use state.withdrawType to figure out which swap functions to use to calcuate next state
      let nextState: WithdrawFormState | Record<string, unknown>
      if (!state.percentage) {
        try {
          const inputCalculatedLPTokenAmount =
            await poolContract.calc_token_amount(txnAmounts, false)
          nextState = inputCalculatedLPTokenAmount.gt(
            effectiveUserLPTokenBalance,
          )
            ? {
                error: {
                  field: "tokenInputs",
                  message: "Insufficient balance.",
                },
                lpTokenAmountToSpend: BigNumber.from("0"),
              }
            : {
                error: null,
                lpTokenAmountToSpend: inputCalculatedLPTokenAmount,
              }
        } catch (e) {
          nextState = {
            error: {
              field: "tokenInputs",
              message: "Unable to calculate token amount at this moment.",
            },
            lpTokenAmountToSpend: BigNumber.from("0"),
          }
        }
      } else {
        try {
          const tokenIndex = POOL.poolTokens.findIndex(
            ({ symbol }) => symbol === state.withdrawType,
          )
          const tokenAmount = await poolContract.calc_withdraw_one_coin(
            effectiveUserLPTokenBalance, // lp token to be burnt
            tokenIndex,
          ) // actual coin amount to be returned
          nextState = {
            lpTokenAmountToSpend: effectiveUserLPTokenBalance,
            tokenInputs: POOL.poolTokens.reduce(
              (acc, { symbol }, i) => ({
                ...acc,
                [symbol]: tokenInputStateCreators[symbol](
                  i === tokenIndex ? tokenAmount : "0",
                ),
              }),
              {},
            ),
            error: null,
          }
        } catch (e) {
          nextState = {
            error: {
              field: "tokenInputs",
              message: "Unable to calculate token amount at this moment.",
            },
          }
        }
      }
      setFormState((prevState) => ({
        ...prevState,
        ...nextState,
      }))
    }, 250),
    [userShareData, poolContract, POOL.poolTokens, tokenInputStateCreators],
  )

  const handleUpdateForm = useCallback(
    (action: WithdrawFormAction): void => {
      // update the form with user input immediately
      // then call expensive debounced fn to update other fields
      setFormState((prevState) => {
        let nextState: WithdrawFormState | Record<string, unknown> = {}
        if (action.fieldName === "tokenInputs") {
          const { tokenSymbol: tokenSymbolInput = "", value: valueInput } =
            action
          const newTokenInputs = {
            ...prevState.tokenInputs,
            [tokenSymbolInput]:
              tokenInputStateCreators[tokenSymbolInput](valueInput),
          }
          const activeInputTokens = POOL.poolTokens.filter(
            ({ symbol }) => +newTokenInputs[symbol].valueRaw !== 0,
          )
          let withdrawType
          if (activeInputTokens.length === 0) {
            withdrawType = ALL
          } else if (activeInputTokens.length === 1) {
            withdrawType = activeInputTokens[0].symbol
          } else {
            withdrawType = IMBALANCE
          }
          nextState = {
            withdrawType,
            lpTokenAmountToSpend: BigNumber.from("0"),
            percentage: null,
            tokenInputs: newTokenInputs,
            error: null,
          }
        } else if (action.fieldName === "percentage") {
          const isInputInvalid =
            isNaN(+action.value) || +action.value < 0 || +action.value > 100
          nextState = isInputInvalid
            ? {
                percentage: action.value,
                lpTokenAmountToSpend: BigNumber.from("0"),
                error: { field: "percentage", message: "Invalid input" },
                tokenInputs: tokenInputsEmptyState,
              }
            : {
                withdrawType:
                  prevState.withdrawType === IMBALANCE
                    ? ALL
                    : prevState.withdrawType,
                percentage: action.value,
                error: null,
              }
        } else if (action.fieldName === "withdrawType") {
          nextState = {
            tokenInputs: tokenInputsEmptyState,
            percentage: prevState.percentage || "100",
            withdrawType: action.value,
            error: null,
          }
        } else if (action.fieldName === "reset") {
          nextState = formEmptyState
        }
        const finalState = {
          ...prevState,
          ...nextState,
        }
        const pendingTokenInput =
          action.fieldName === "tokenInputs" &&
          POOL.poolTokens.every(({ symbol }) => {
            const stateValue = finalState.tokenInputs[symbol].valueRaw
            return isNaN(+stateValue) || +stateValue === 0
          })
        if (!finalState.error && !pendingTokenInput) {
          void calculateAndUpdateDynamicFields(finalState)
        }
        return finalState
      })
    },
    [
      POOL.poolTokens,
      calculateAndUpdateDynamicFields,
      tokenInputStateCreators,
      tokenInputsEmptyState,
      formEmptyState,
    ],
  )

  return [formState, handleUpdateForm]
}
