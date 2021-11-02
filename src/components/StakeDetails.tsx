import React, { ReactElement } from "react"
import { Spinner } from "@chakra-ui/react"
import styles from "./StakeDetails.module.scss"
import { useTranslation } from "react-i18next"

interface Props {
  balanceView: string
  stakedView: string
  loading: boolean
}
const StakeDetails = (props: Props): ReactElement => {
  const { t } = useTranslation()
  const { balanceView, stakedView, loading } = props
  return (
    <div className={styles.stakeDetailsContainer}>
      <div className={styles.stakeDetails}>
        <div className={styles.row}>
          <h3 className={styles.title}>{t("balance")}</h3>
        </div>
        <div className={styles.row}>
          <div className={styles.icon}>🌹</div>
          <div className={styles.balanceDetails}>
            {loading ? (
              <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="red.700"
                size="lg"
              />
            ) : (
              <span className={styles.balance}>{balanceView}</span>
            )}
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
            {loading ? (
              <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="red.700"
                size="lg"
              />
            ) : (
              <span className={styles.balance}>{stakedView}</span>
            )}
            <span className={styles.token}>stROSE</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StakeDetails
