import AnimatedComponentCard, { Field } from "./ComponentCard"
import {
  Box,
  Flex,
  Stack,
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
  Text,
} from "@chakra-ui/react"
import React, { ReactElement } from "react"
import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import { FARM_SORT_FIELDS_TO_LABEL } from "../constants/index"
import { FarmSortFields } from "../state/user"
import FormattedComponentName from "./FormattedComponentName"
import { Zero } from "@ethersproject/constants"
import { formatBNToShortString } from "../utils"
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
  rewards: {
    rose: BigNumber
    dual: BigNumber
  }
  tvl: string | undefined
  apr: RewardsApr
}

interface RewardsApr {
  roseApr: string | undefined
  dualRewardApr?: string
  dualRewardTokenName?: string
}

const AprTooltip = ({
  roseApr,
  dualRewardApr,
  dualRewardTokenName,
}: Required<RewardsApr>): ReactElement => (
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
)

const RewardsField = ({
  formattedRoseRewards,
  formattedDualRewards,
  dualRewardTokenName,
}: {
  formattedRoseRewards: string
  formattedDualRewards?: string
  dualRewardTokenName?: string
}): ReactElement => (
  <Stack mt="2px">
    <Flex alignItems="center">
      <Box width="12px" mr="2px">
        <img alt="icon" src={roseIcon} width="100%" />
      </Box>
      <Text fontSize={{ base: "13px", md: "16px" }}>
        {formattedRoseRewards}
      </Text>
    </Flex>
    {dualRewardTokenName && formattedDualRewards && (
      <Flex alignItems="center">
        <Box width="12px" mr="2px">
          <img alt="icon" src={terraLunaIcon} width="100%" />
        </Box>
        <Text fontSize={{ base: "13px", md: "16px" }}>
          {formattedDualRewards}
        </Text>
      </Flex>
    )}
  </Stack>
)

function FarmsOverview(props: FarmOverviewData): ReactElement {
  const {
    farmName,
    lpTokenIcon,
    farmRoute,
    balance,
    deposited,
    rewards,
    tvl,
    apr,
  } = props
  const { roseApr, dualRewardApr, dualRewardTokenName } = apr
  const formattedData: {
    [field in FarmSortFields]: Field
  } = {
    name: {
      label: FARM_SORT_FIELDS_TO_LABEL[FarmSortFields.NAME],
      valueRaw: farmName.replace(/ Farm/, ""),
      valueComponent: (
        <FormattedComponentName
          name={farmName.replace(/ Farm/, "")}
          icon={lpTokenIcon}
        />
      ),
      tooltip:
        dualRewardTokenName && dualRewardApr
          ? `Dual Rewards Farms payout rewards in multiple tokens. This farm pays out rewards in ROSE and ${dualRewardTokenName}.`
          : undefined,
    },
    apr: {
      label: FARM_SORT_FIELDS_TO_LABEL[FarmSortFields.APR],
      valueRaw: roseApr
        ? roseApr === "∞%"
          ? "∞%"
          : `${(
              +roseApr.slice(0, -1) + +(dualRewardApr?.slice(0, -1) || 0)
            ).toString()}%`
        : "-",
      tooltip:
        dualRewardTokenName && dualRewardApr ? (
          <AprTooltip
            dualRewardApr={dualRewardApr}
            dualRewardTokenName={dualRewardTokenName}
            roseApr={roseApr}
          />
        ) : null,
    },
    tvl: {
      label: FARM_SORT_FIELDS_TO_LABEL[FarmSortFields.TVL],
      valueRaw: tvl
        ? `$${formatBNToShortString(BigNumber.from(tvl), 18)}`
        : "-",
    },
    deposit: {
      label: FARM_SORT_FIELDS_TO_LABEL[FarmSortFields.DEPOSIT],
      valueRaw: deposited.gt(Zero) ? formatBNToShortString(deposited, 18) : "-",
    },
    balance: {
      label: FARM_SORT_FIELDS_TO_LABEL[FarmSortFields.BALANCE],
      valueRaw: balance.gt(Zero) ? formatBNToShortString(balance, 18) : "-",
    },
    rewards: {
      label: FARM_SORT_FIELDS_TO_LABEL[FarmSortFields.REWARD],
      valueRaw:
        (rewards.rose.gt(Zero)
          ? formatBNToShortString(rewards.rose, 18)
          : "-") +
        (rewards.dual.gt(Zero) ? formatBNToShortString(rewards.dual, 18) : "-"),
      valueComponent: (
        <RewardsField
          formattedRoseRewards={
            rewards.rose.gt(Zero)
              ? formatBNToShortString(rewards.rose, 18)
              : "-"
          }
          formattedDualRewards={
            rewards.dual.gt(Zero)
              ? formatBNToShortString(rewards.dual, 18)
              : "-"
          }
          dualRewardTokenName={dualRewardTokenName}
        />
      ),
    },
  }

  const { farmPreferences } = useSelector(
    (state: AppState) => state.user,
    (l, r) =>
      l.farmPreferences.visibleFields === r.farmPreferences.visibleFields,
  )

  const fields: Field[] = Object.values(FarmSortFields)
    .filter((field) => {
      return farmPreferences.visibleFields[field] > 0
    })
    .map((field) => {
      return formattedData[field]
    })

  return (
    <AnimatedComponentCard
      name={formattedData.name.valueRaw}
      fields={fields}
      route={`farms/${farmRoute}`}
      borderRadius="10px"
      p="15px"
      background="var(--background-element)"
      boxShadow="var(--shadow)"
      _hover={{ bg: "var(--background-element-hover)" }}
    />
  )
}

export default FarmsOverview
