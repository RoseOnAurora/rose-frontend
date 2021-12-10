import {
  Divider,
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react"
import React, { ReactElement } from "react"
import styles from "./StakeDetails.module.scss"
import { useTranslation } from "react-i18next"

interface Props {
  balanceView: string
  stakedView: string
  tvl: string
  totalStaked: string
  priceOfRose: string
}
const StakeDetails = (props: Props): ReactElement => {
  const { t } = useTranslation()
  const { balanceView, stakedView, tvl, totalStaked, priceOfRose } = props
  return (
    <div className={styles.stakeDetailsContainer}>
      <div className={styles.stakeDetails}>
        <div className={styles.row}>
          <h3 className={styles.title}>{t("balance")}</h3>
        </div>
        <div className={styles.row}>
          <div className={styles.icon}>🌹</div>
          <div className={styles.balanceDetails}>
            <StatGroup>
              <Stat>
                <StatLabel>ROSE</StatLabel>
                <StatNumber fontSize="18px">{balanceView}</StatNumber>
              </Stat>
            </StatGroup>
          </div>
        </div>
      </div>
      <Divider />
      <div className={styles.stakeDetails}>
        <div className={styles.row}>
          <h3 className={styles.title}>{t("Staked")}</h3>
        </div>
        <div className={styles.row}>
          <div className={styles.icon}>🌷</div>
          <div className={styles.balanceDetails}>
            <StatGroup>
              <Stat>
                <StatLabel>stROSE</StatLabel>
                <StatNumber fontSize="18px">{stakedView}</StatNumber>
              </Stat>
            </StatGroup>
          </div>
        </div>
      </div>
      <Divider />
      <div className={styles.statsDetails}>
        <div className={styles.statRow}>
          <div className={styles.statLabel}>Total ROSE Staked</div>
          <div className={styles.statValue}>{totalStaked}</div>
        </div>
        <div className={styles.statRow}>
          <div className={styles.statLabel}>Price of ROSE</div>
          <div className={styles.statValue}>{priceOfRose}</div>
        </div>
        <div className={styles.statRow}>
          <div className={styles.statLabel}>TVL</div>
          <div className={styles.statValue}>{tvl}</div>
        </div>
      </div>
    </div>
  )
}

export default StakeDetails
