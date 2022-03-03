import AnimatedComponentCard, { Field } from "./ComponentCard"
import React, { ReactElement, useMemo } from "react"
import { formatBNToPercentString, formatBNToShortString } from "../utils"
import { AppState } from "../state"
import { BORROW_SORT_FIELDS_TO_LABEL } from "../constants/index"
import { BigNumber } from "@ethersproject/bignumber"
import { BorrowSortFields } from "../state/user"
import FormattedComponentName from "./FormattedComponentName"
import { Zero } from "@ethersproject/constants"
import { useSelector } from "react-redux"

export interface BorrowMarketsOverviewData {
  marketName: string
  borrowRoute: string
  tokenIcon: string
  borrowed: BigNumber
  position: BigNumber
  rusdLeftToBorrow: BigNumber
  tvl: BigNumber
  interest: BigNumber
  fee: BigNumber
}

function BorrowMarketsOverview(props: BorrowMarketsOverviewData): ReactElement {
  const {
    marketName,
    borrowRoute,
    tokenIcon,
    rusdLeftToBorrow,
    borrowed,
    position,
    tvl,
    interest,
    fee,
  } = props

  const formattedData: { [field in BorrowSortFields]: Field } = useMemo(() => {
    return {
      name: {
        label: BORROW_SORT_FIELDS_TO_LABEL[BorrowSortFields.NAME],
        valueRaw: marketName,
        valueComponent: (
          <FormattedComponentName name={marketName} icon={tokenIcon} />
        ),
      },
      borrow: {
        label: BORROW_SORT_FIELDS_TO_LABEL[BorrowSortFields.BORROW],
        valueRaw: borrowed.gt(Zero) ? formatBNToShortString(borrowed, 18) : "-",
      },
      collateral: {
        label: BORROW_SORT_FIELDS_TO_LABEL[BorrowSortFields.COLLATERAL],
        valueRaw: position.gt(Zero)
          ? `$${formatBNToShortString(position, 18)}`
          : "-",
      },
      tvl: {
        label: BORROW_SORT_FIELDS_TO_LABEL[BorrowSortFields.TVL],
        valueRaw: tvl.gt(Zero) ? `$${formatBNToShortString(tvl, 18)}` : "-",
      },
      supply: {
        label: BORROW_SORT_FIELDS_TO_LABEL[BorrowSortFields.SUPPLY],
        valueRaw: formatBNToShortString(rusdLeftToBorrow, 18),
      },

      interest: {
        label: BORROW_SORT_FIELDS_TO_LABEL[BorrowSortFields.INTEREST],
        valueRaw: formatBNToPercentString(interest, 18, 1),
      },
      liquidationFee: {
        label: BORROW_SORT_FIELDS_TO_LABEL[BorrowSortFields.LIQUIDATION_FEE],
        valueRaw: formatBNToPercentString(fee, 18, 1),
      },
    }
  }, [
    marketName,
    tokenIcon,
    rusdLeftToBorrow,
    borrowed,
    position,
    tvl,
    interest,
    fee,
  ])

  const { borrowPreferences } = useSelector(
    (state: AppState) => state.user,
    (l, r) =>
      l.borrowPreferences.visibleFields === r.borrowPreferences.visibleFields,
  )

  const fields: Field[] = Object.values(BorrowSortFields)
    .filter((field) => {
      return borrowPreferences.visibleFields[field] > 0
    })
    .map((field) => {
      return formattedData[field]
    })

  return (
    <AnimatedComponentCard
      name={marketName}
      fields={fields}
      route={`borrow/${borrowRoute}`}
      borderRadius="10px"
      p="15px"
      background="var(--background-element)"
      boxShadow="var(--shadow)"
      _hover={{ bg: "var(--background-element-hover)" }}
    />
  )
}

export default BorrowMarketsOverview
