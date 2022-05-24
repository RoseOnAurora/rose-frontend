import AnimatedComponentCard, { Field } from "./ComponentCard"
import React, { ReactElement, useMemo } from "react"
import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import FormattedComponentName from "./FormattedComponentName"
import { POOL_SORT_FIELDS_TO_LABEL } from "../constants"
import { PoolSortFields } from "../state/user"
import { Zero } from "@ethersproject/constants"
import { formatBNToShortString } from "../utils"
import { isMetaPool } from "../constants"
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
}

const PoolOverview = (props: Props): ReactElement => {
  const { poolRoute, poolName, poolIcon, balance, tvl, volume, farmDeposit } =
    props

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
    }
  }, [poolName, balance, farmDeposit, isMetapool, t, tvl, volume, poolIcon])

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
      p="15px"
      background="var(--background-element)"
      boxShadow="var(--shadow)"
      _hover={{ bg: "var(--background-element-hover)" }}
    />
  )
}

export default PoolOverview
