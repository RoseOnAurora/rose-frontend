import {
  Collapse,
  IconButton,
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react"
import React, { ReactElement, ReactNode } from "react"
import { BsChevronExpand } from "react-icons/bs"
import styles from "./StakeDetails.module.scss"

interface StakeStatLabel {
  statLabel: string
  statTooltip?: string
  statPopOver?: ReactNode
  onClick?: () => void
}
interface StakeStats {
  statLabel: string
  statValue: string
  statTooltip?: string
  statPopOver?: ReactNode
}
interface StakedDetailsView {
  items: {
    tokenName: string
    amount: string
    icon: string
  }[]
  title?: string
}
interface Props {
  balanceView: StakedDetailsView
  stakedView: StakedDetailsView
  extraStakeDetailChild?: ReactNode
  stats?: StakeStats[]
}
const StakeStat = (props: StakeStatLabel): ReactElement => {
  const { statLabel, statTooltip, statPopOver, onClick } = props
  if (statTooltip) {
    return (
      <Tooltip bgColor="#cc3a59" closeOnClick={false} label={statTooltip}>
        <div className={styles.statLabel}>
          <div className={styles.underline}>{statLabel}</div>
        </div>
      </Tooltip>
    )
  } else if (statPopOver) {
    return (
      <div className={styles.statLabel}>
        {statLabel}
        <IconButton
          onClick={onClick}
          aria-label="Expand"
          variant="outline"
          size="xs"
          marginLeft="5px"
          icon={<BsChevronExpand />}
          title="Expand"
        />
      </div>
    )
  } else {
    return <div className={styles.statLabel}>{statLabel}</div>
  }
}
const StakeDetails = (props: Props): ReactElement => {
  const { balanceView, stakedView, stats, extraStakeDetailChild } = props
  const { isOpen, onToggle } = useDisclosure()
  return (
    <>
      {extraStakeDetailChild && (
        <div className={styles.stakeDetails}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {extraStakeDetailChild}
          </div>
        </div>
      )}
      <div className={styles.stakeDetails}>
        <div className={styles.row}>
          <h3 className={styles.title}>{balanceView.title}</h3>
        </div>
        {balanceView.items.map(({ icon, tokenName, amount }, index) => {
          const iconStyle = /rose-/.exec(icon)
            ? { width: "70px", marginRight: "10px" }
            : { width: "40px", marginRight: "10px" }
          return (
            <div className={styles.row} key={index}>
              <div style={iconStyle}>
                <img src={icon} alt="tokenIcon" width="100%" />
              </div>
              <div className={styles.balanceDetails}>
                <StatGroup>
                  <Stat>
                    <StatLabel>{tokenName}</StatLabel>
                    <StatNumber fontSize="18px">{amount}</StatNumber>
                  </Stat>
                </StatGroup>
              </div>
            </div>
          )
        })}
      </div>
      <div className={styles.stakeDetails}>
        <div className={styles.row}>
          <h3 className={styles.title}>{stakedView.title}</h3>
        </div>
        {stakedView.items.map(({ icon, tokenName, amount }, index) => {
          const iconStyle = /rose-/.exec(icon)
            ? { width: "70px", marginRight: "10px" }
            : { width: "40px", marginRight: "10px" }
          return (
            <div className={styles.row} key={index}>
              <div style={iconStyle}>
                <img src={icon} alt="tokenIcon" width="100%" />
              </div>
              <div className={styles.balanceDetails}>
                <StatGroup>
                  <Stat>
                    <StatLabel>{tokenName}</StatLabel>
                    <StatNumber fontSize="18px">{amount}</StatNumber>
                  </Stat>
                </StatGroup>
              </div>
            </div>
          )
        })}
      </div>
      {stats && (
        <div className={styles.statsDetails}>
          {stats.map(
            ({ statLabel, statValue, statTooltip, statPopOver }, index) => {
              return (
                <div key={index}>
                  <div className={styles.statRow}>
                    <StakeStat
                      statLabel={statLabel}
                      statTooltip={statTooltip}
                      statPopOver={statPopOver}
                      onClick={onToggle}
                    />
                    <div className={styles.statValue}>{statValue}</div>
                  </div>
                  {statPopOver && (
                    <Collapse in={isOpen} animateOpacity>
                      {statPopOver}
                    </Collapse>
                  )}
                </div>
              )
            },
          )}
        </div>
      )}
    </>
  )
}

export default StakeDetails
