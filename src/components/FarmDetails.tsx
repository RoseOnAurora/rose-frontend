import {
  Divider,
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react"
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
          <div className={styles.icon}>
            <img alt="icon" src={lpTokenIcon} />
          </div>
          <div className={styles.balanceDetails}>
            <StatGroup>
              <Stat>
                <StatLabel>{lpTokenName}</StatLabel>
                <StatNumber fontSize="18px">{balance}</StatNumber>
              </Stat>
            </StatGroup>
          </div>
        </div>
      </div>
      <Divider />
      <div className={styles.stakeDetails}>
        <div className={styles.row}>
          <h3 className={styles.title}>{t("deposited")}</h3>
        </div>
        <div className={styles.row}>
          <div className={styles.icon}>
            <img alt="icon" src={lpTokenIcon} />
          </div>
          <div className={styles.balanceDetails}>
            <StatGroup>
              <Stat>
                <StatLabel>{lpTokenName}</StatLabel>
                <StatNumber fontSize="18px">{deposited}</StatNumber>
              </Stat>
            </StatGroup>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FarmDetails
