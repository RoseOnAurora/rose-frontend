import React, { ReactElement, useMemo } from "react"
import { BigNumber } from "@ethersproject/bignumber"
import { ROSE_TOKENS_MAP } from "../constants"
import StakeDetails from "../components/StakeDetails"
import StakeForm from "../components/StakeForm"
import TopMenu from "../components/TopMenu"
import { Zero } from "@ethersproject/constants"
import styles from "./Stake.module.scss"
import { useRoseTokenBalances } from "../state/wallet/hooks"

export type BalanceDetails = {
  decimals: number
  amount: BigNumber
}

const Stake = (): ReactElement => {
  const tokenBalances = useRoseTokenBalances()
  const tokenBalanceDetails = useMemo(() => {
    const [roseToken] = Object.values(ROSE_TOKENS_MAP).map(
      ({ symbol, decimals }) => {
        const amount = tokenBalances?.[symbol] || Zero
        return {
          decimals,
          amount,
        }
      },
    )
    return {
      balance: roseToken,
      // add staked here!
    }
  }, [tokenBalances])
  return (
    <div className={styles.stakePage}>
      <TopMenu activeTab="stake" />
      <div className={styles.container}>
        <div className={styles.content}>
          <StakeForm />
          <StakeDetails tokenBalanceDetails={tokenBalanceDetails} />
        </div>
      </div>
    </div>
  )
}

export default Stake
