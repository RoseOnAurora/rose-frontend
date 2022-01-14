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
          </div>
          <div className={styles.stats}>
            <div className={styles.row}>
              <StatGroup
                display="flex"
                flexWrap="nowrap"
                justifyContent="space-between"
                minWidth="115px"
              >
                {farmData?.lpTokenBalance && farmData?.lpTokenBalance.gt(Zero) && (
                  <Stat>
                    <StatLabel>
                      <span className={styles.label}>Balance</span>
                    </StatLabel>
                    <StatNumber
                      fontSize="16px"
                      fontWeight="400"
                    >{`${formatBNToShortString(
                      farmData?.lpTokenBalance || Zero,
                      18,
                    )}`}</StatNumber>
                  </Stat>
                )}
                {deposited && deposited.gt(Zero) && (
                  <Stat ml={3}>
                    <StatLabel>
                      <span className={styles.label}>Deposited</span>
                    </StatLabel>
                    <StatNumber
                      fontSize="16px"
                      fontWeight="400"
                    >{`${formatBNToShortString(deposited, 18)}`}</StatNumber>
                  </Stat>
                )}
                <Stat ml={3}>
                  <StatLabel>
                    <span className={styles.label}>TVL</span>
                  </StatLabel>
                  <StatNumber fontSize="16px" fontWeight="400">
                    {formattedTvl}
                  </StatNumber>
                </Stat>
                <Stat ml={3}>
                  <StatLabel>
                    <span className={styles.label}>APR</span>
                  </StatLabel>
                  <StatNumber fontSize="16px" fontWeight="400">
                    {formattedApr}
                  </StatNumber>
                </Stat>
              </StatGroup>
            </div>
          </div>
        </div>
        <div className={styles.farmDescription}>
          <p>
            {isRose ? (
              <Trans t={t} i18nKey="farmDescription">
                {{ tokenName: lpTokenName }}
                <a
                  href={`../#/pools/${farmRoute}/deposit`}
                  className={classNames(styles.tag, { [styles.rose]: isRose })}
                >
                  <FarmTag isRose={true}>{{ poolName: poolName }}</FarmTag>
                </a>
              </Trans>
            ) : (
              <Trans t={t} i18nKey="farmDescription">
                {{ tokenName: lpTokenName }}
                <a
                  href={poolUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={classNames(styles.tag, { [styles.rose]: isRose })}
                >
                  {{ poolName: poolName }}
                  <span>
                    {/* TODO: fix superscript */}
                    <sup>{{ externalUrlArrow: "↗" }}</sup>
                  </span>
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
