import {
  Box,
  Button,
  Flex,
  HStack,
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
  Tag,
  Tooltip,
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
import roseIcon from "../assets/icons/rose.svg"
import styles from "./FarmsOverview.module.scss"
import terraLunaIcon from "../assets/icons/terra-luna-logo.svg"
import useCalculateFarmDeposited from "../hooks/useCalculateFarmDeposited"
import useFarmData from "../hooks/useFarmData"

interface Props {
  farmRoute: string
  farmName: string
  poolName: string
  lpTokenName: string
  lpTokenIcon: string
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
    lpTokenIcon,
    isRose,
    farmStats,
  } = props
  const { t } = useTranslation()
  const formattedTvl = farmStats?.tvl
    ? `$${formatBNToShortString(BigNumber.from(farmStats.tvl), 18)}`
    : "-"
  const formattedApr = farmStats?.apr || "-"
  const dualRewardApr = farmStats?.dualReward.apr
  const dualRewardTokenName = farmStats?.dualReward.token
  const farmData = useFarmData(farmName as FarmName)
  const deposited = useCalculateFarmDeposited(
    farmData?.lpTokenBalance,
    farmName as FarmName,
  )
  const iconWidth = /rose-/.exec(lpTokenIcon) ? "70px" : "30px"

  return (
    <div className={styles.farmsOverview}>
      <div className={styles.container}>
        <div className={styles.row}>
          <div className={styles.titleBox}>
            <Box width={iconWidth} marginRight="5px">
              <img alt="icon" src={lpTokenIcon} width="100%" />
            </Box>
            {dualRewardApr && dualRewardTokenName ? (
              <Tooltip
                bgColor="#cc3a59"
                closeOnClick={false}
                label={`Dual Rewards Farms payout rewards in multiple tokens. This farm pays out rewards in ROSE and ${dualRewardTokenName}.`}
              >
                <h4 className={classNames(styles.title, styles.underline)}>
                  {farmName}
                </h4>
              </Tooltip>
            ) : (
              <h4 className={styles.title}>{farmName}</h4>
            )}
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
                      fontSize="15px"
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
                      fontSize="15px"
                      fontWeight="400"
                    >{`${formatBNToShortString(deposited, 18)}`}</StatNumber>
                  </Stat>
                )}
                <Stat ml={3}>
                  <StatLabel>
                    <span className={styles.label}>TVL</span>
                  </StatLabel>
                  <StatNumber fontSize="15px" fontWeight="400">
                    {formattedTvl}
                  </StatNumber>
                </Stat>
                <Stat ml={3}>
                  <StatLabel>
                    {dualRewardApr && dualRewardTokenName ? (
                      <Tooltip
                        bgColor="#cc3a59"
                        closeOnClick={false}
                        label={
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
                                {formattedApr}
                              </StatNumber>
                            </Stat>
                            <Stat ml={3}>
                              <StatLabel whiteSpace="nowrap">
                                <span className={styles.label}>
                                  {dualRewardTokenName} APR
                                </span>
                              </StatLabel>
                              <StatNumber fontSize="15px" fontWeight="400">
                                {dualRewardApr}
                              </StatNumber>
                            </Stat>
                          </StatGroup>
                        }
                      >
                        <span
                          className={classNames(styles.label, styles.underline)}
                        >
                          APR
                        </span>
                      </Tooltip>
                    ) : (
                      <span className={styles.label}>APR</span>
                    )}
                  </StatLabel>
                  <StatNumber fontSize="15px" fontWeight="400">
                    {farmStats?.apr
                      ? `${(
                          +formattedApr.slice(0, -1) +
                          +(dualRewardApr?.slice(0, -1) || 0)
                        ).toString()}%`
                      : "-"}
                  </StatNumber>
                </Stat>
              </StatGroup>
            </div>
          </div>
        </div>
        <HStack
          mt="10px"
          mb="5px"
          spacing="20px"
          justifyContent={{ base: "center", md: "start" }}
        >
          <Box
            color="var(--text-lighter)"
            fontSize={{ base: "13px", md: "16px" }}
          >
            {dualRewardTokenName ? "Dual Rewards" : "Rewards"}:
          </Box>
          <Tag
            size="md"
            borderRadius="full"
            variant="outline"
            color="var(--text)"
            boxShadow="inset 0 0 0px 1px #cc3a59"
            p="7px"
          >
            <Flex alignItems="center">
              <Box width="20px" mr="5px" ml="8px">
                <img alt="icon" src={roseIcon} width="100%" />
              </Box>
              <span style={{ fontSize: "12px", marginRight: "8px" }}>ROSE</span>
            </Flex>
          </Tag>
          {dualRewardTokenName ? (
            <Tag
              size="md"
              borderRadius="full"
              variant="outline"
              color="var(--text)"
              boxShadow="inset 0 0 0px 1px #cc3a59"
              p="8px"
            >
              <Flex alignItems="center" mr="5x">
                <Box width="20px" mr="5px" ml="8px">
                  <img alt="icon" src={terraLunaIcon} width="100%" />
                </Box>
                <span style={{ fontSize: "12px", marginRight: "8px" }}>
                  {dualRewardTokenName}
                </span>
              </Flex>
            </Tag>
          ) : null}
        </HStack>
        <div className={styles.farmDescription}>
          <p>
            {isRose ? (
              <Trans t={t} i18nKey="farmDescription">
                {{ tokenName: lpTokenName }}
                <a
                  href={poolUrl}
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
                  <sup>{{ externalUrlArrow: "↗" }}</sup>
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
