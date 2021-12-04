/** es-lint: disable */
import {
  Button,
  Stat,
  // StatArrow,
  StatGroup,
  // StatHelpText,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react"
import React, { ReactElement } from "react"
import { Trans, useTranslation } from "react-i18next"
import { FarmStats } from "../hooks/useFarmStats"
import { Link } from "react-router-dom"
import classNames from "classnames"
import styles from "./FarmsOverview.module.scss"

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
  const { farmRoute, farmName, poolName, poolUrl, lpTokenName, isRose } = props
  const { t } = useTranslation()
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
            minWidth="100px"
          >
            <Stat>
              <StatLabel>TVL</StatLabel>
              <StatNumber fontSize="13px">{"-"}</StatNumber>
              {/* <StatHelpText>
                <StatArrow type="increase" />
                23.36%
              </StatHelpText> */}
            </Stat>
            <Stat>
              <StatLabel>APR</StatLabel>
              <StatNumber fontSize="13px">{"-"}</StatNumber>
              {/* <StatHelpText>
                <StatArrow type="increase" />
                23.36%
              </StatHelpText> */}
            </Stat>
          </StatGroup>
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