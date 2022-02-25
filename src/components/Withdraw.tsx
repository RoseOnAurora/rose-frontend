/* eslint-disable */
import { POOLS_MAP, PoolName } from "../constants"
import React, { ReactElement, useEffect, useState } from "react"
import WithdrawPage, { ReviewWithdrawData } from "./WithdrawPage"
import { commify, formatUnits, parseUnits } from "@ethersproject/units"

import { ethers } from "ethers"
import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import { ContractReceipt } from "@ethersproject/contracts"
import { Zero } from "@ethersproject/constants"
import { calculateGasEstimate } from "../utils/gasEstimate"
import { calculatePriceImpact } from "../utils/priceImpact"
import { formatGasToString } from "../utils/gas"
import { formatBNToString } from "../utils"
import { formatSlippageToString } from "../utils/slippage"
import { useActiveWeb3React } from "../hooks"
import { useApproveAndWithdraw } from "../hooks/useApproveAndWithdraw"
import { usePoolContract } from "../hooks/useContract"
import usePoolData from "../hooks/usePoolData"
import { useSelector } from "react-redux"
import useWithdrawFormState from "../hooks/useWithdrawFormState"

interface Props {
  poolName: PoolName
}
function Withdraw({ poolName }: Props): ReactElement {
  const [poolData, userShareData] = usePoolData(poolName)
  const [withdrawFormState, updateWithdrawFormState] = useWithdrawFormState(
    poolName,
  )
  const { slippageCustom, slippageSelected, gasPriceSelected, gasCustom } = useSelector(
    (state: AppState) => state.user,
  )
  const { tokenPricesUSD, gasStandard, gasFast, gasInstant } = useSelector((state: AppState) => state.application)
  const approveAndWithdraw = useApproveAndWithdraw(poolName)
  const poolContract = usePoolContract(poolName)
  const { account } = useActiveWeb3React()
  const POOL = POOLS_MAP[poolName]

  const [estWithdrawBonus, setEstWithdrawBonus] = useState(Zero)
  useEffect(() => {
    // evaluate if a new withdraw will exceed the pool's per-user limit
    async function calculateWithdrawBonus(): Promise<void> {
      try {
        if (
          poolContract == null ||
          userShareData == null ||
          poolData == null ||
          account == null
        ) {
          return
        }
        const tokenInputSum = parseUnits(
          POOL.poolTokens
            .reduce(
              (sum, { symbol }) =>
                sum + (+withdrawFormState.tokenInputs[symbol].valueRaw || 0),
              0,
            )
            .toString(),
          18,
        )
        let withdrawLPTokenAmount
        if (poolData.totalLocked.gt(0) && tokenInputSum.gt(0)) {
          const txnAmounts: string[] = POOL.poolTokens.map((poolToken) => {
            return withdrawFormState.tokenInputs[poolToken.symbol].valueSafe
          })
          withdrawLPTokenAmount = await poolContract.calc_token_amount(
            txnAmounts,
            false,
          )
        } else {
          // when pool is empty, estimate the lptokens by just summing the input instead of calling contract
          withdrawLPTokenAmount = tokenInputSum
        }
        setEstWithdrawBonus(
          calculatePriceImpact(
            withdrawLPTokenAmount,
            tokenInputSum,
            poolData.virtualPrice,
            true,
          ),
        )
      } catch {
        // pass here for now - fix later with hook
      }
    }
    void calculateWithdrawBonus()
  }, [
    poolData,
    withdrawFormState,
    poolContract,
    userShareData,
    account,
    POOL.poolTokens,
  ])
  async function onConfirmTransaction(): Promise<ContractReceipt | void> {
    const {
      withdrawType,
      tokenInputs,
      lpTokenAmountToSpend,
    } = withdrawFormState
    const receipt = await approveAndWithdraw({
      tokenFormState: tokenInputs,
      withdrawType,
      lpTokenAmountToSpend,
    })
    updateWithdrawFormState({ fieldName: "reset", value: "reset" })

    return receipt
  }

  const tokensData = React.useMemo(
    () =>
      POOL.poolTokens.map(({ name, symbol, icon, decimals }) => ({
        name,
        symbol,
        icon,
        inputValue: withdrawFormState.tokenInputs[symbol].valueRaw,
        // TO-DO: all decimals have been casted to 18 - we need to change that
        // to generic behavior so we don't have to cast back
        max: formatBNToString(
          userShareData?.tokens
            .find((shareToken) => shareToken.symbol === symbol)
            ?.value.div(BigNumber.from(10).pow(18 - decimals)) || Zero,
          decimals,
        ),
      })),
    [withdrawFormState, POOL.poolTokens, userShareData?.tokens],
  )
  // const gasPrice = Zero
  const gasPrice = ethers.utils.parseUnits(
    formatGasToString(
      { gasStandard, gasFast, gasInstant },
      gasPriceSelected,
      gasCustom,
    ),
    "gwei"
  )
  const gasAmount = calculateGasEstimate("removeLiquidityImbalance").mul(
    gasPrice,
  ) // units of gas * GWEI/Unit of gas

  const txnGasCost = {
    amount: gasAmount,
    valueUSD: tokenPricesUSD?.ETH
      ? parseUnits(tokenPricesUSD.ETH.toFixed(2), 18) // USD / ETH  * 10^18
          .mul(gasAmount) // GWEI
          .div(BigNumber.from(10).pow(25)) // USD / ETH * GWEI * ETH / GWEI = USD
      : null,
  }

  const reviewWithdrawData: ReviewWithdrawData = {
    withdraw: [],
    rates: [],
    slippage: formatSlippageToString(slippageSelected, slippageCustom),
    priceImpact: estWithdrawBonus,
    txnGasCost: txnGasCost,
  }
  POOL.poolTokens.forEach(({ name, decimals, icon, symbol }) => {
    if (BigNumber.from(withdrawFormState.tokenInputs[symbol].valueSafe).gt(0)) {
      reviewWithdrawData.withdraw.push({
        name,
        value: commify(
          formatUnits(
            withdrawFormState.tokenInputs[symbol].valueSafe,
            decimals,
          ),
        ),
        icon,
      })
      if (tokenPricesUSD != null) {
        reviewWithdrawData.rates.push({
          name,
          value: formatUnits(
            withdrawFormState.tokenInputs[symbol].valueSafe,
            decimals,
          ),
          rate: commify(tokenPricesUSD[symbol]?.toFixed(2)),
        })
      }
    }
  })

  return (
    <WithdrawPage
      title={poolName}
      reviewData={reviewWithdrawData}
      tokensData={tokensData}
      poolData={poolData}
      myShareData={userShareData}
      formStateData={withdrawFormState}
      onConfirmTransaction={onConfirmTransaction}
      onFormChange={updateWithdrawFormState}
    />
  )
}

export default Withdraw
