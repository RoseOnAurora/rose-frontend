import {
  Box,
  Collapse,
  Flex,
  Grid,
  GridItem,
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
        <Text cursor="help" borderBottom="1px dotted var(--text)">
          {statLabel}
        </Text>
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
        <Skeleton minH="80px" height="100%" borderRadius="10px" />
      ) : (
        extraStakeDetailChild && (
          <div className={styles.stakeDetails}>{extraStakeDetailChild}</div>
        )
      )}
      {loading === true ? (
        <Skeleton minH="80px" height="100%" borderRadius="10px" />
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
        <Skeleton minH="80px" height="100%" borderRadius="10px" />
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
        <Skeleton minH="80px" height="100%" borderRadius="10px" />
      ) : (
        stats && (
          <Box
            borderRadius="10px"
            border="1px solid var(--outline)"
            p="15px"
            bg="var(--secondary-background)"
          >
            <Grid rowGap="15px" gridTemplateRows="auto">
              {stats.map(
                ({ statLabel, statValue, statTooltip, statPopOver }, index) => {
                  return (
                    <GridItem key={index}>
                      <Flex
                        fontSize="18px"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <StakeStat
                          statLabel={statLabel}
                          statTooltip={statTooltip}
                          statPopOver={statPopOver}
                          onClick={onToggle}
                        />
                        <Text fontWeight="600">{statValue}</Text>
                      </Flex>
                      {statPopOver && (
                        <Collapse in={isOpen} animateOpacity>
                          {statPopOver}
                        </Collapse>
                      )}
                    </GridItem>
                  )
                },
              )}
            </Grid>
          </Box>
        )
      )}
    </>
  )
}

export default StakeDetails
