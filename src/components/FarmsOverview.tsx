import {
  Button,
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react"
import React, { ReactElement } from "react"
import { Trans, useTranslation } from "react-i18next"
import { BigNumber } from "@ethersproject/bignumber"
import { FarmName } from "../constants"
import { FarmStats } from "../utils/fetchFarmStats"
import { Link } from "react-router-dom"
import { Zero } from "@ethersproject/constants"
import classNames from "classnames"
import { formatBNToShortString } from "../utils"
import styles from "./FarmsOverview.module.scss"
import useCalculateFarmDeposited from "../hooks/useCalculateFarmDeposited"
import useFarmData from "../hooks/useFarmData"

interface Props {
  farmRoute: string
  farmName: string
  poolName: string
  lpTokenName: string
  isRose: boolean
  farmStats?: FarmStats
  poolUrl?: string
}

function FarmsOverview(props: Props): ReactElement {
  const {
    farmRoute,
    farmName,
    poolName,
    poolUrl,
    lpTokenName,
    isRose,
    farmStats,
  } = props
  const { t } = useTranslation()
  const formattedTvl = farmStats?.tvl
    ? `$${formatBNToShortString(BigNumber.from(farmStats.tvl), 18)}`
    : "-"
  const formattedApr = farmStats?.apr || "-"

  const farmData = useFarmData(farmName as FarmName)
  const deposited = useCalculateFarmDeposited(
    farmData?.lpTokenBalance,
    farmName as FarmName,
  )

  return (
    <div className={styles.farmsOverview}>
      <div className={styles.container}>
        <div className={styles.row}>
          <div className={styles.titleBox}>
            <h4 className={styles.title}>{farmName}</h4>
            <a href={poolUrl} target={isRose ? "" : "_blank"} rel="noreferrer">
              <FarmTag isRose={isRose}>
                {poolName}
                {isRose ? null : <sup>↗</sup>}
              </FarmTag>
            </a>
          </div>
          <StatGroup
            display="flex"
            flexWrap="nowrap"
            justifyContent="space-between"
            minWidth="115px"
          >
            <Stat mr={2}>
              <StatLabel>TVL</StatLabel>
              <StatNumber fontSize="13px">{formattedTvl}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>APR</StatLabel>
              <StatNumber fontSize="13px">{formattedApr}</StatNumber>
            </Stat>
          </StatGroup>
        </div>
        <div className={styles.balanceInfo}>
          <div style={{ display: "flex", gap: "5px" }}>
            <div className={styles.tokenBalanceText}>LP Token Balance:</div>
            <div className={styles.tokenBalanceValue}>{`${formatBNToShortString(
              farmData?.lpTokenBalance || Zero,
              18,
            )}`}</div>
          </div>
          <div style={{ display: "flex", gap: "5px" }}>
            <div className={styles.tokenBalanceText}>Deposited:</div>
            <div className={styles.tokenBalanceValue}>{`${formatBNToShortString(
              deposited,
              18,
            )}`}</div>
          </div>
        </div>
        <div className={styles.farmDescription}>
          <p>
            {isRose ? (
              <Trans t={t} i18nKey="farmDescription">
                {{ tokenName: lpTokenName }}
                <Link to={`pools/${farmRoute}/deposit`}>
                  {{ poolName: poolName }}
                </Link>
              </Trans>
            ) : (
              <Trans t={t} i18nKey="farmDescription">
                {{ tokenName: lpTokenName }}
                <a
                  className={styles.external}
                  href={poolUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {{ poolName: poolName }}
                </a>
              </Trans>
            )}
          </p>
          <div className={styles.farmButton}>
            <Link to={`farms/${farmRoute}`}>
              <Button variant="primary" disabled={false} width="100px">
                {t("Farm")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function FarmTag(props: { children?: React.ReactNode; isRose: boolean }) {
  const { isRose, ...tagProps } = props
  return (
    <span
      className={classNames(styles.tag, { [styles.rose]: isRose })}
      {...tagProps}
    />
  )
}

export default FarmsOverview
