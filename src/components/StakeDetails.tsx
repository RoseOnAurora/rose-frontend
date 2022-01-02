import {
  Divider,
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
  Tooltip,
} from "@chakra-ui/react"
import React, { ReactElement } from "react"
import styles from "./StakeDetails.module.scss"

interface StakeStatLabel {
  statLabel: string
  statTooltip?: string
}
interface StakeStats {
  statLabel: string
  statValue: string
  statTooltip?: string
}
interface StakedDetailsView {
  tokenName: string
  amount: string
  icon: string
  title?: string
}
interface Props {
  balanceView: StakedDetailsView
  stakedView: StakedDetailsView
  stats?: StakeStats[]
}
const StakeStat = (props: StakeStatLabel): ReactElement => {
  const { statLabel, statTooltip } = props
  if (statTooltip) {
    return (
      <Tooltip bgColor="#cc3a59" closeOnClick={false} label={statTooltip}>
        <div className={styles.statLabel}>
          <div className={styles.underline}>{statLabel}</div>
        </div>
      </Tooltip>
    )
  } else {
    return <div className={styles.statLabel}>{statLabel}</div>
  }
}
const StakeDetails = (props: Props): ReactElement => {
  const { balanceView, stakedView, stats } = props
  return (
    <div className={styles.stakeDetailsContainer}>
      <div className={styles.stakeDetails}>
        <div className={styles.row}>
          <h3 className={styles.title}>{balanceView.title}</h3>
        </div>
        <div className={styles.row}>
          <div className={styles.icon}>
            <img src={balanceView.icon} alt="tokenIcon" />
          </div>
          <div className={styles.balanceDetails}>
            <StatGroup>
              <Stat>
                <StatLabel>{balanceView.tokenName}</StatLabel>
                <StatNumber fontSize="18px">{balanceView.amount}</StatNumber>
              </Stat>
            </StatGroup>
          </div>
        </div>
      </div>
      <Divider />
      <div className={styles.stakeDetails}>
        <div className={styles.row}>
          <h3 className={styles.title}>{stakedView.title}</h3>
        </div>
        <div className={styles.row}>
          <div className={styles.icon}>
            <img src={stakedView.icon} alt="tokenIcon" />
          </div>
          <div className={styles.balanceDetails}>
            <StatGroup>
              <Stat>
                <StatLabel>{stakedView.tokenName}</StatLabel>
                <StatNumber fontSize="18px">{stakedView.amount}</StatNumber>
              </Stat>
            </StatGroup>
          </div>
        </div>
      </div>
      {stats && (
        <>
          <Divider />
          <div className={styles.statsDetails}>
            {stats.map(({ statLabel, statValue, statTooltip }, index) => {
              return (
                <div className={styles.statRow} key={index}>
                  <StakeStat statLabel={statLabel} statTooltip={statTooltip} />
                  <div className={styles.statValue}>{statValue}</div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default StakeDetails
