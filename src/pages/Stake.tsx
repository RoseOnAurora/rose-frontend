import React, { ReactElement, useEffect, useMemo, useState } from "react"
import { BigNumber } from "@ethersproject/bignumber"
import { ROSE_TOKENS_MAP } from "../constants"
import StakePage from "../components/StakePage"
import TopMenu from "../components/TopMenu"
import { Zero } from "@ethersproject/constants"
import styles from "./Stake.module.scss"
import { useApproveAndStake } from "../hooks/useApproveAndStake"
import { useApproveAndUnstake } from "../hooks/useApproveAndUnstake"
import useCountDown from "react-countdown-hook"
import useLastStakedTime from "../hooks/useLastStakedTime"
import { useRoseTokenBalances } from "../state/wallet/hooks"

export type BalanceDetails = {
  balance: TokenDetails
  staked: TokenDetails
}

export type TokenDetails = {
  amount: BigNumber
  decimals: number
}

const Stake = (): ReactElement => {
  const tokenBalances = useRoseTokenBalances()
  const stake = useApproveAndStake()
  const unstake = useApproveAndUnstake()

  const [diff, setDiff] = useState(0)
  const lastStaked = useLastStakedTime()
  useEffect(() => {
    const d = new Date(lastStaked ? +lastStaked * 1000 : 0)
    d.setDate(d.getDate() + 1)
    setDiff((Date.now() - d.getTime()) * -1)
  }, [lastStaked])

  const [timeLeft, actions] = useCountDown(diff, 1000)

  const tokenBalanceDetails = useMemo((): BalanceDetails => {
    const [roseToken, stRoseToken] = Object.values(ROSE_TOKENS_MAP).map(
      ({ symbol, decimals }) => {
        const amount = tokenBalances?.[symbol] || Zero
        return {
          decimals,
          amount,
        }
      },
    )
    return {
      balance: {
        amount: roseToken.amount,
        decimals: roseToken.decimals,
      },
      staked: {
        amount: stRoseToken.amount,
        decimals: stRoseToken.decimals,
      },
    }
  }, [tokenBalances])

  useEffect(() => {
    actions.start(diff)
  }, [actions, diff, lastStaked])

  return (
    <div className={styles.stake}>
      <TopMenu activeTab="stake" />
      <div className={styles.container}>
        <StakePage
          balance={tokenBalanceDetails.balance}
          staked={tokenBalanceDetails.staked}
          roseTokenIcon={ROSE_TOKENS_MAP.rose.icon}
          stRoseTokenIcon={ROSE_TOKENS_MAP.stRose.icon}
          timeLeft={timeLeft}
          approveStake={stake}
          approveUnstake={unstake}
        />
      </div>
    </div>
  )
}

export default Stake
