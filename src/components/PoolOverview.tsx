import {
  Flex,
  Image,
  Stack,
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
  Text,
} from "@chakra-ui/react"
import { POOL_SORT_FIELDS_TO_LABEL, isMetaPool } from "../constants"
import React, { ReactElement, useMemo } from "react"
import AnimatedComponentCard from "./ComponentCard"
import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import { Field } from "../types/table"
import FormattedComponentName from "./FormattedComponentName"
import { PoolSortFields } from "../state/user"
import { RewardsApr } from "../types/farm"
import { Zero } from "@ethersproject/constants"
import { formatBNToShortString } from "../utils"
import roseIcon from "../assets/icons/rose.svg"
import terraLunaIcon from "../assets/icons/terra-luna-logo.svg"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

interface Props {
  poolRoute: string
  poolName: string
  poolIcon: string
  balance: BigNumber
  tvl: BigNumber
  volume: BigNumber
  farmDeposit: BigNumber
  farmTvl: string | undefined
  rewards: {
    rose: BigNumber
    dual: BigNumber
  }
  apr: RewardsApr
}

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
      <Flex width="18px" mr="2px">
        <Image alt="icon" src={roseIcon} width="100%" objectFit="cover" />
      </Flex>
      <Text fontSize={{ base: "13px", md: "16px" }}>
        {formattedRoseRewards}
      </Text>
    </Flex>
    {dualRewardTokenName && formattedDualRewards && (
      <Flex alignItems="center">
        <Flex width="12px" mr="2px">
          <Image
            alt="icon"
            src={terraLunaIcon}
            width="100%"
            objectFit="cover"
          />
        </Flex>
        <Text fontSize={{ base: "13px", md: "16px" }}>
          {formattedDualRewards}
        </Text>
      </Flex>
    )}
  </Stack>
)

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
        <Text as="span" fontSize="12px" fontWeight={700} color="green.50">
          ROSE APR
        </Text>
      </StatLabel>
      <StatNumber fontSize="15px" fontWeight="400">
        {roseApr}
      </StatNumber>
    </Stat>
    <Stat ml={3}>
      <StatLabel whiteSpace="nowrap">
        <Text as="span" fontSize="12px" fontWeight={700} color="green.50">
          {dualRewardTokenName} APR
        </Text>
      </StatLabel>
      <StatNumber fontSize="15px" fontWeight="400">
        {dualRewardApr}
      </StatNumber>
    </Stat>
  </StatGroup>
)

const PoolOverview = (props: Props): ReactElement => {
  const {
    poolRoute,
    poolName,
    poolIcon,
    balance,
    tvl,
    volume,
    farmDeposit,
    apr,
    farmTvl,
    rewards,
  } = props
  const { roseApr, dualRewardApr, dualRewardTokenName } = apr
  const { t } = useTranslation()

  const isMetapool = isMetaPool(poolName)

  const formattedData: { [field in PoolSortFields]: Field } = useMemo(() => {
    return {
      name: {
        label: POOL_SORT_FIELDS_TO_LABEL[PoolSortFields.NAME],
        valueRaw: poolName.replace(/ Pool/, ""),
        tooltip: isMetapool ? t("metapool") : undefined,
        valueComponent: (
          <FormattedComponentName
            name={poolName.replace(/ Pool/, "")}
            icon={poolIcon}
          />
        ),
      },
      tvl: {
        label: POOL_SORT_FIELDS_TO_LABEL[PoolSortFields.TVL],
        valueRaw: tvl.gt(Zero) ? `$${formatBNToShortString(tvl, 18)}` : "-",
      },
      volume: {
        label: POOL_SORT_FIELDS_TO_LABEL[PoolSortFields.VOLUME],
        valueRaw: volume.gt(Zero)
          ? `$${formatBNToShortString(volume, 18)}`
          : "-",
      },
      balance: {
        label: POOL_SORT_FIELDS_TO_LABEL[PoolSortFields.BALANCE],
        valueRaw: balance.gt(Zero) ? formatBNToShortString(balance, 18) : "-",
      },
      farmDeposit: {
        label: POOL_SORT_FIELDS_TO_LABEL[PoolSortFields.FARM_DEPOSIT],
        valueRaw: farmDeposit.gt(Zero)
          ? formatBNToShortString(farmDeposit, 18)
          : "-",
      },
      apr: {
        label: POOL_SORT_FIELDS_TO_LABEL[PoolSortFields.APR],
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
      farmTvl: {
        label: POOL_SORT_FIELDS_TO_LABEL[PoolSortFields.FARM_TVL],
        valueRaw: farmTvl
          ? `$${formatBNToShortString(BigNumber.from(farmTvl), 18)}`
          : "-",
      },
      rewards: {
        label: POOL_SORT_FIELDS_TO_LABEL[PoolSortFields.REWARDS],
        valueRaw:
          (rewards.rose.gt(Zero)
            ? formatBNToShortString(rewards.rose, 18)
            : "-") +
          (rewards.dual.gt(Zero)
            ? formatBNToShortString(rewards.dual, 18)
            : "-"),
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
  }, [
    poolName,
    balance,
    farmDeposit,
    isMetapool,
    t,
    tvl,
    volume,
    poolIcon,
    dualRewardApr,
    dualRewardTokenName,
    farmTvl,
    rewards,
    roseApr,
  ])

  const { poolPreferences } = useSelector(
    (state: AppState) => state.user,
    (l, r) =>
      l.poolPreferences.visibleFields === r.poolPreferences.visibleFields,
  )

  const fields: Field[] = Object.values(PoolSortFields)
    .filter((field) => {
      return poolPreferences.visibleFields[field] > 0
    })
    .map((field) => {
      return formattedData[field]
    })

  return (
    <AnimatedComponentCard
      name={formattedData.name.valueRaw}
      fields={fields}
      route={poolRoute}
      borderRadius="10px"
      py={{ base: "20px", lg: "15px" }}
      px={{ base: "30px", lg: "10px" }}
      background="gray.900"
      _hover={{ bg: "gray.800" }}
    />
  )
}

export default PoolOverview
