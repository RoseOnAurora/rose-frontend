import React, { ReactElement } from "react"
import styles from "./FarmDetails.module.scss"
import { useTranslation } from "react-i18next"

interface Props {
  lpTokenName: string
  lpTokenIcon: string
  balance: string
  deposited: string
}

const FarmDetails = (props: Props): ReactElement => {
  const { t } = useTranslation()
  const { lpTokenName, lpTokenIcon, balance, deposited } = props
  return (
    <div className={styles.farmDetailsContainer}>
      <div className={styles.stakeDetails}>
        <div className={styles.row}>
          <h3 className={styles.title}>{t("balance")}</h3>
        </div>
        <div className={styles.row}>
          <div className={styles.icon}>{lpTokenIcon}</div>
          <div className={styles.balanceDetails}>
            <span className={styles.balance}>{balance}</span>
            <span className={styles.token}>{lpTokenName}</span>
          </div>
        </div>
      </div>
      <div className={styles.stakeDetails}>
        <div className={styles.row}>
          <h3 className={styles.title}>{t("deposited")}</h3>
        </div>
        <div className={styles.row}>
          <div className={styles.icon}>{lpTokenIcon}</div>
          <div className={styles.balanceDetails}>
            <span className={styles.balance}>{deposited}</span>
            <span className={styles.token}>{lpTokenName}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FarmDetails
