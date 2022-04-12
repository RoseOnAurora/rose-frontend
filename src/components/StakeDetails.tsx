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

interface StakeStatLabel {
  statLabel: ReactNode
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
    collapseContent?: ReactNode
  }[]
  title?: string
}
interface Props {
  balanceView: StakedDetailsView
  stakedView: StakedDetailsView
  extraStakeDetailChild?: ReactNode
  bottom?: ReactNode
  stats?: StakeStats[]
  loading?: boolean
}

const StakeBalanceView = ({
  items,
  title,
}: StakedDetailsView): ReactElement => {
  const { isOpen, onToggle } = useDisclosure()
  return (
    <Box
      bg="var(--secondary-background)"
      p="15px"
      border="1px solid var(--outline)"
      borderRadius="10px"
    >
      <Flex justifyContent="space-between" alignItems="center" m="8px 0">
        <Text fontSize="25px" fontWeight={700} lineHeight="30px">
          {title}
        </Text>
      </Flex>
      {items.length ? (
        <Grid
          autoFlow={{ base: "none", lg: "row" }}
          templateColumns={{ base: "repeat(1, 1fr)", lg: "repeat(2, 1fr)" }}
          rowGap="15px"
          m="15px 0"
          alignItems="center"
        >
          {items.map(({ icon, tokenName, amount, collapseContent }, index) => {
            return (
              <GridItem key={index}>
                <Grid
                  gridTemplateColumns="70px auto"
                  gridTemplateRows="auto"
                  alignItems="center"
                  columnGap="5px"
                >
                  <GridItem>
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
                  </GridItem>
                  <GridItem key={`${tokenName}-${index}`}>
                    <Box>
                      <StatGroup>
                        <Stat>
                          <Flex alignItems="center">
                            <StatLabel
                              fontSize={{
                                base: "12px",
                                lg: "13px",
                              }}
                              color="var(--text-lighter)"
                            >
                              {tokenName}
                            </StatLabel>
                            {collapseContent && (
                              <IconButton
                                onClick={onToggle}
                                aria-label="Expand"
                                variant="outline"
                                size="xs"
                                marginLeft="5px"
                                icon={<BsChevronExpand />}
                                title="Expand"
                              />
                            )}
                          </Flex>
                          <Collapse in={isOpen} animateOpacity>
                            {collapseContent}
                          </Collapse>
                          <StatNumber
                            fontSize={{
                              base: "14px",
                              lg: "15px",
                              xl: "16px",
                            }}
                          >
                            {amount}
                          </StatNumber>
                        </Stat>
                      </StatGroup>
                    </Box>
                  </GridItem>
                </Grid>
              </GridItem>
            )
          })}
        </Grid>
      ) : (
        <Box p="20px">
          <Text textAlign="center" color="var(--text-lighter)">
            {`${title || "Your Balances"} will appear here.`}
          </Text>
        </Box>
      )}
    </Box>
  )
}

const StakeStatLabel = (props: StakeStatLabel): ReactElement => {
  const { statLabel, statTooltip, statPopOver, onClick } = props
  if (statTooltip) {
    return (
      <Tooltip bgColor="#cc3a59" closeOnClick={false} label={statTooltip}>
        <Text
          fontSize={{
            base: "14px",
            lg: "15px",
            xl: "16px",
          }}
          cursor="help"
          borderBottom="1px dotted var(--text)"
        >
          {statLabel}
        </Text>
      </Tooltip>
    )
  } else if (statPopOver) {
    return (
      <Flex alignItems="center">
        <Text
          fontSize={{
            base: "14px",
            lg: "15px",
            xl: "16px",
          }}
        >
          {statLabel}
        </Text>
        <IconButton
          onClick={onClick}
          aria-label="Expand"
          variant="outline"
          size="xs"
          marginLeft="5px"
          icon={<BsChevronExpand />}
          title="Expand"
        />
      </Flex>
    )
  } else {
    return (
      <Text
        fontSize={{
          base: "14px",
          lg: "15px",
          xl: "16px",
        }}
      >
        {statLabel}
      </Text>
    )
  }
}
const StakeDetails = (props: Props): ReactElement => {
  const {
    balanceView,
    stakedView,
    stats,
    extraStakeDetailChild,
    bottom,
    loading,
  } = props
  const { isOpen, onToggle } = useDisclosure()
  return (
    <Grid rowGap="10px" templateColumns="repeat(1, 100%)">
      {extraStakeDetailChild && (
        <GridItem>
          {loading === true ? (
            <Skeleton minH="80px" height="100%" borderRadius="10px" />
          ) : (
            <Box
              bg="var(--secondary-background)"
              p="15px"
              border="1px solid var(--outline)"
              borderRadius="10px"
            >
              {extraStakeDetailChild}
            </Box>
          )}
        </GridItem>
      )}
      <GridItem>
        {loading === true ? (
          <Skeleton minH="80px" height="100%" borderRadius="10px" />
        ) : (
          <StakeBalanceView
            items={balanceView.items}
            title={balanceView.title}
          />
        )}
      </GridItem>
      <GridItem>
        {loading === true ? (
          <Skeleton minH="80px" height="100%" borderRadius="10px" />
        ) : (
          <StakeBalanceView items={stakedView.items} title={stakedView.title} />
        )}
      </GridItem>
      {stats && (
        <GridItem>
          {loading === true ? (
            <Skeleton minH="80px" height="100%" borderRadius="10px" />
          ) : (
            <Box
              borderRadius="10px"
              border="1px solid var(--outline)"
              p="15px"
              bg="var(--secondary-background)"
            >
              <Grid rowGap="15px" gridTemplateRows="auto">
                {stats.map(
                  (
                    { statLabel, statValue, statTooltip, statPopOver },
                    index,
                  ) => {
                    return (
                      <GridItem key={index}>
                        <Flex
                          fontSize="18px"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <StakeStatLabel
                            statLabel={statLabel}
                            statTooltip={statTooltip}
                            statPopOver={statPopOver}
                            onClick={onToggle}
                          />
                          <Text
                            fontSize={{
                              base: "15px",
                              lg: "16px",
                              xl: "17px",
                            }}
                            fontWeight="600"
                          >
                            {statValue}
                          </Text>
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
          )}
        </GridItem>
      )}
      {bottom && (
        <GridItem>
          {loading === true ? (
            <Skeleton minH="80px" height="100%" borderRadius="10px" />
          ) : (
            <Box
              bg="var(--secondary-background)"
              p="15px"
              border="1px solid var(--outline)"
              borderRadius="10px"
            >
              {bottom}
            </Box>
          )}
        </GridItem>
      )}
    </Grid>
  )
}

export default StakeDetails
