import React, { ReactElement } from "react"
import { BalanceDetails } from "../pages/Stake"
import styles from "./StakeDetails.module.scss"
import { useTranslation } from "react-i18next"

interface Props {
  tokenBalanceDetails: BalanceDetails
}
const StakeDetails = (props: Props): ReactElement => {
  const { t } = useTranslation()
  const { tokenBalanceDetails } = props
  return (
    <div className={styles.stakeDetailsContainer}>
      <div className={styles.stakeDetails}>
        <div className={styles.row}>
          <h3 className={styles.title}>{t("balance")}</h3>
        </div>
        <div className={styles.row}>
          <div className={styles.icon}>🌹</div>
          <div className={styles.balanceDetails}>
            <span className={styles.balance}>
              {tokenBalanceDetails.balance}
            </span>
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
            <span className={styles.balance}>{tokenBalanceDetails.staked}</span>
            <span className={styles.token}>stROSE</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StakeDetails
