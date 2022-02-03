import {
  Box,
  Flex,
  HStack,
  Stack,
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
  Tag,
  Text,
} from "@chakra-ui/react"
import React, { memo } from "react"
import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import ComponentCard from "./ComponentCard"
import { Zero } from "@ethersproject/constants"
import { formatBNToShortString } from "../utils"
import { motion } from "framer-motion"
import roseIcon from "../assets/icons/rose.svg"
import styles from "./FarmsOverview.module.scss"
import terraLunaIcon from "../assets/icons/terra-luna-logo.svg"
import { useSelector } from "react-redux"

interface FarmOverviewData {
  farmName: string
  farmRoute: string
  lpTokenIcon: string
  balance: BigNumber
  deposited: BigNumber
  tvl: string | undefined
  apr: RewardsApr
}

interface RewardsApr {
  roseApr: string | undefined
  dualRewardApr?: string
  dualRewardTokenName?: string
}

const FarmsOverview = memo(
  (props: FarmOverviewData) => {
    const MotionBox = motion(Box)
    const {
      farmName,
      lpTokenIcon,
      farmRoute,
      balance,
      deposited,
      tvl,
      apr,
    } = props
    const { roseApr, dualRewardApr, dualRewardTokenName } = apr
    const formattedApr = roseApr
      ? `${(
          +roseApr.slice(0, -1) + +(dualRewardApr?.slice(0, -1) || 0)
        ).toString()}%`
      : "-"
    const formattedDeposited = deposited?.gt(Zero)
      ? formatBNToShortString(deposited, 18)
      : "-"
    const formattedBalance = balance?.gt(Zero)
      ? formatBNToShortString(balance || Zero, 18)
      : "-"
    const formattedTvl = tvl
      ? `$${formatBNToShortString(BigNumber.from(tvl), 18)}`
      : "-"

    const { farmPreferences } = useSelector(
      (state: AppState) => state.user,
      (l, r) => l.farmPreferences.showRewards === r.farmPreferences.showRewards,
    )

    const aprTooltip =
      dualRewardApr && dualRewardTokenName ? (
        <StatGroup
          display="flex"
          flexWrap="nowrap"
          justifyContent="space-between"
          minWidth="115px"
        >
          <Stat ml={3}>
            <StatLabel whiteSpace="nowrap">
              <span className={styles.label}>ROSE APR</span>
            </StatLabel>
            <StatNumber fontSize="15px" fontWeight="400">
              {roseApr}
            </StatNumber>
          </Stat>
          <Stat ml={3}>
            <StatLabel whiteSpace="nowrap">
              <span className={styles.label}>{dualRewardTokenName} APR</span>
            </StatLabel>
            <StatNumber fontSize="15px" fontWeight="400">
              {dualRewardApr}
            </StatNumber>
          </Stat>
        </StatGroup>
      ) : null

    const rewardsField = (
      <Stack>
        <Text
          color="var(--text-lighter)"
          fontSize={{ base: "8px", sm: "10px", md: "13px" }}
        >
          {dualRewardTokenName ? "Dual Rewards" : "Rewards"}
        </Text>
        <HStack spacing="10px">
          <Tag
            size="md"
            borderRadius="full"
            variant="outline"
            color="var(--text)"
            boxShadow="inset 0 0 0px 1px var(--text-primary)"
            p="7px"
          >
            <Flex alignItems="center">
              <Box width="10px" mr="5px" ml="8px">
                <img alt="icon" src={roseIcon} width="100%" />
              </Box>
              <span style={{ fontSize: "10px", marginRight: "8px" }}>ROSE</span>
            </Flex>
          </Tag>
          {dualRewardTokenName ? (
            <Tag
              size="md"
              borderRadius="full"
              variant="outline"
              color="var(--text)"
              boxShadow="inset 0 0 0px 1px var(--text-primary)"
              p="8px"
            >
              <Flex alignItems="center" mr="5x">
                <Box width="10px" mr="5px" ml="8px">
                  <img alt="icon" src={terraLunaIcon} width="100%" />
                </Box>
                <span style={{ fontSize: "10px", marginRight: "8px" }}>
                  {dualRewardTokenName}
                </span>
              </Flex>
            </Tag>
          ) : null}
        </HStack>
      </Stack>
    )

    return (
      <MotionBox
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        exit={{ opacity: 0, scale: 1 }}
        layout
      >
        <ComponentCard
          componentName={farmName.replace(/ Farm/, "")}
          componentIcon={lpTokenIcon}
          componentTooltipLabel={
            dualRewardTokenName && dualRewardApr
              ? `Dual Rewards Farms payout rewards in multiple tokens. This farm pays out rewards in ROSE and ${dualRewardTokenName}.`
              : undefined
          }
          fields={[
            { value: formattedBalance, label: "Balance" },
            { value: formattedDeposited, label: "Deposited" },
            { value: formattedTvl, label: "TVL" },
            { value: formattedApr, tooltip: aprTooltip, label: "APR" },
          ]}
          extraComponentChild={
            farmPreferences.showRewards > 0 ? rewardsField : null
          }
          route={`farms/${farmRoute}`}
          borderRadius="10px"
          fontSize={{ base: "10px", sm: "12px", md: "16px" }}
          p="15px"
          background="var(--background-element)"
          boxShadow="var(--shadow)"
          _hover={{ bg: "var(--background-element-hover)" }}
        />
      </MotionBox>
    )
  },
  (next, prev) =>
    next.farmName === prev.farmName &&
    next.balance.eq(prev.balance) &&
    next.deposited.eq(prev.deposited) &&
    next.tvl === prev.tvl,
)

FarmsOverview.displayName = "Farm Overview"

export default FarmsOverview
