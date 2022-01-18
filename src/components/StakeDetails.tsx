import {
  Box,
  Collapse,
  IconButton,
  Skeleton,
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
  Text,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react"
import React, { ReactElement, ReactNode } from "react"
import { BsChevronExpand } from "react-icons/bs"
import styles from "./StakeDetails.module.scss"

interface StakeStatLabel {
  statLabel: ReactNode
  statTooltip?: string
  statPopOver?: ReactNode
  onClick?: () => void
}
interface StakeStats {
  statLabel: ReactNode
  statValue: ReactNode
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
  loading?: boolean
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
  const {
    balanceView,
    stakedView,
    stats,
    extraStakeDetailChild,
    loading,
  } = props
  const { isOpen, onToggle } = useDisclosure()
  return (
    <>
      {loading === true ? (
        <Skeleton height="80px" borderRadius="10px" />
      ) : (
        extraStakeDetailChild && (
          <div className={styles.stakeDetails}>{extraStakeDetailChild}</div>
        )
      )}
      {loading === true ? (
        <Skeleton height="80px" borderRadius="10px" />
      ) : (
        <div className={styles.stakeDetails}>
          <div className={styles.row}>
            <h3 className={styles.title}>{balanceView.title}</h3>
          </div>
          {balanceView.items.length ? (
            balanceView.items.map(({ icon, tokenName, amount }, index) => {
              return (
                <div className={styles.detailsRow} key={index}>
                  <Box
                    width={
                      /rose-/.exec(icon)
                        ? "70px"
                        : /dai-usdt-usdc/.exec(icon)
                        ? "60px"
                        : "40px"
                    }
                  >
                    <img src={icon} alt="tokenIcon" width="100%" />
                  </Box>
                  <Box>
                    <StatGroup>
                      <Stat>
                        <StatLabel color="var(--text-lighter)">
                          {tokenName}
                        </StatLabel>
                        <StatNumber fontSize="18px">{amount}</StatNumber>
                      </Stat>
                    </StatGroup>
                  </Box>
                </div>
              )
            })
          ) : (
            <Box p="20px">
              <Text textAlign="center" color="var(--text-lighter)">
                {`${balanceView.title || "Your Balances"} will appear here.`}
              </Text>
            </Box>
          )}
        </div>
      )}
      {loading === true ? (
        <Skeleton height="80px" borderRadius="10px" />
      ) : (
        <div className={styles.stakeDetails}>
          <div className={styles.row}>
            <h3 className={styles.title}>{stakedView.title}</h3>
          </div>
          {stakedView.items.length ? (
            stakedView.items.map(({ icon, tokenName, amount }, index) => {
              return (
                <div className={styles.detailsRow} key={index}>
                  <Box
                    width={
                      /rose-/.exec(icon)
                        ? "70px"
                        : /dai-usdt-usdc/.exec(icon)
                        ? "60px"
                        : "40px"
                    }
                  >
                    <img src={icon} alt="tokenIcon" width="100%" />
                  </Box>
                  <Box>
                    <StatGroup>
                      <Stat>
                        <StatLabel color="var(--text-lighter)">
                          {tokenName}
                        </StatLabel>
                        <StatNumber fontSize="18px">{amount}</StatNumber>
                      </Stat>
                    </StatGroup>
                  </Box>
                </div>
              )
            })
          ) : (
            <Box p="20px">
              <Text textAlign="center" color="var(--text-lighter)">
                {`${
                  stakedView.title || "Your Staked/Deposits details"
                } will appear here.`}
              </Text>
            </Box>
          )}
        </div>
      )}
      {loading === true ? (
        <Skeleton height="80px" borderRadius="10px" />
      ) : (
        stats && (
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
        )
      )}
    </>
  )
}

export default StakeDetails
