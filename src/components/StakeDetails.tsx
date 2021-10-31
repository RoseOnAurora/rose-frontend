import React, { ReactElement } from "react"
import { BalanceDetails } from "../pages/Stake"
import { Zero } from "@ethersproject/constants"
import { commify } from "@ethersproject/units"
import { formatBNToString } from "../utils"
import styles from "./StakeDetails.module.scss"
import { useTranslation } from "react-i18next"

interface Props {
  tokenBalanceDetails: {
    balance: BalanceDetails
    staked?: BalanceDetails // TO-DO: make required once stRose is created
  }
}
const StakeDetails = (props: Props): ReactElement => {
  const { t } = useTranslation()
  const { tokenBalanceDetails } = props
  const formattedBalance = commify(
    formatBNToString(
      tokenBalanceDetails.balance.amount || Zero,
      tokenBalanceDetails.balance.decimals || 0,
      6,
    ),
  )
  return (
    <div className={styles.stakeDetailsContainer}>
      <div className={styles.stakeDetails}>
        <div className={styles.row}>
          <h3 className={styles.title}>{t("balance")}</h3>
        </div>
        <div className={styles.row}>
          <div className={styles.icon}>🌹</div>
          <div className={styles.balanceDetails}>
            <span className={styles.balance}>{formattedBalance}</span>
            <span className={styles.token}>ROSE</span>
          </div>
        </div>
      </div>
      <div className={styles.stakeDetails}>
        <div className={styles.row}>
          <h3 className={styles.title}>{t("Staked")}</h3>
        </div>
        <div className={styles.row}>
          <div className={styles.icon}>🌷</div>
          <div className={styles.balanceDetails}>
            <span className={styles.balance}>0</span>
            <span className={styles.token}>stROSE</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StakeDetails
