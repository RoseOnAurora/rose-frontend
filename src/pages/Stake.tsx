import React, { ReactElement, useMemo, useState } from "react"
import { ROSE_TOKENS_MAP } from "../constants"
import StakeDetails from "../components/StakeDetails"
import StakeForm from "../components/StakeForm"
import TopMenu from "../components/TopMenu"
import { Zero } from "@ethersproject/constants"
import { commify } from "@ethersproject/units"
import { formatBNToString } from "../utils"
import styles from "./Stake.module.scss"
import { useRoseTokenBalances } from "../state/wallet/hooks"

export enum StakeAction {
  STAKE = 0,
  UNSTAKE = 1,
}
type FormState = {
  error: boolean
  action: StakeAction
  amount: string
} & BalanceDetails

const EMPTY_FORM_STATE: FormState = {
  error: false,
  action: StakeAction.STAKE,
  amount: "",
  balance: "",
  staked: "",
}

export type BalanceDetails = {
  balance: string
  staked: string
}

const Stake = (): ReactElement => {
  const tokenBalances = useRoseTokenBalances()

  // form state
  const [formState, setFormState] = useState<FormState>(EMPTY_FORM_STATE)
  console.log("FORM STATE: ", formState)
  const handleTabSwitch = (index: number) => {
    setFormState((prevState) => {
      return {
        ...prevState,
        action: index,
      }
    })
  }

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
    const formattedBalance = commify(
      formatBNToString(roseToken.amount || Zero, roseToken.decimals || 0, 6),
    )
    // to-do: update w/ stRose
    const formattedStaked = commify(formatBNToString(Zero, 1, 6))
    setFormState((prevState) => {
      return {
        ...prevState,
        balance: formattedBalance,
        staked: formattedStaked,
      }
    })
    return {
      balance: formattedBalance,
      staked: formattedStaked,
    }
  }, [tokenBalances])
  return (
    <div className={styles.stakePage}>
      <TopMenu activeTab="stake" />
      <div className={styles.container}>
        <div className={styles.content}>
          <StakeForm
            balance={formState.balance}
            staked={formState.staked}
            onTabSwitch={handleTabSwitch}
          />
          <StakeDetails tokenBalanceDetails={tokenBalanceDetails} />
        </div>
      </div>
    </div>
  )
}

export default Stake
