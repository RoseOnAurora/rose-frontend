import "./PoolOverview.scss"

import { Button, Tooltip } from "@chakra-ui/react"
import { POOLS_MAP, PoolTypes, TOKENS_MAP, isMetaPool } from "../constants"
import { Partners, PoolDataType, UserShareType } from "../hooks/usePoolData"
import React, { ReactElement } from "react"
import {
  formatBNToPercentString,
  formatBNToShortString,
  formatBNToString,
} from "../utils"
import { Link } from "react-router-dom"
import ToolTip from "./ToolTip"
import { Zero } from "@ethersproject/constants"
import classNames from "classnames"
import { useTranslation } from "react-i18next"

interface Props {
  poolRoute: string
  poolData: PoolDataType
  userShareData: UserShareType | null
  onClickMigrate?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export default function PoolOverview({
  poolData,
  poolRoute,
  userShareData,
  onClickMigrate,
}: Props): ReactElement | null {
  const { t } = useTranslation()
  const { type: poolType, isOutdated } = POOLS_MAP[poolData.name]
  const formattedDecimals = poolType === PoolTypes.USD ? 2 : 4
  const shouldMigrate = !!onClickMigrate
  const formattedData = {
    name: poolData.name,
    reserve: poolData.reserve
      ? formatBNToShortString(poolData.reserve, 18)
      : "-",
    aprs: Object.keys(poolData.aprs).reduce((acc, key) => {
      const apr = poolData.aprs[key as Partners]?.apr
      return apr
        ? {
            ...acc,
            [key]: formatBNToPercentString(apr, 18),
          }
        : acc
    }, {} as Partial<Record<Partners, string>>),
    apy: poolData.apy ? `${formatBNToPercentString(poolData.apy, 18, 2)}` : "-",
    volume: poolData.volume
      ? `$${formatBNToShortString(poolData.volume, 18)}`
      : "-",
    userBalanceUSD: formatBNToShortString(
      userShareData?.usdBalance || Zero,
      18,
    ),
    tokens: poolData.tokens.map((coin) => {
      const token = TOKENS_MAP[coin.symbol]
      return {
        symbol: token.symbol,
        name: token.name,
        icon: token.icon,
        value: formatBNToString(coin.value, token.decimals, formattedDecimals),
      }
    }),
  }
  const hasShare = !!userShareData?.usdBalance.gt("0")
  const isMetapool = isMetaPool(formattedData.name)

  return (
    <div className="poolWrapper">
      <div
        className={classNames("poolOverview", {
          outdated: isOutdated || shouldMigrate,
        })}
      >
        <div className="left">
          <div className="titleAndTag">
            {isMetapool ? (
              <Tooltip bgColor="#cc3a59" label={t("metapool")} gutter={33}>
                <div style={{ display: "inline-block" }}>
                  <h4 className="title underline">{formattedData.name}</h4>
                </div>
              </Tooltip>
            ) : (
              <h4 className="title">{formattedData.name}</h4>
            )}
            {(shouldMigrate || isOutdated) && (
              <Tag kind="warning">OUTDATED</Tag>
            )}
            {poolData.isPaused && <Tag kind="error">PAUSED</Tag>}
          </div>
          <div className="tokens">
            {formattedData.tokens.map(({ symbol, icon }) => (
              <div className="token" key={symbol}>
                <img alt="icon" src={icon} />
                <span>{symbol}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="right">
          <div className="poolInfo">
            {/* {formattedData.apy && (
            <div className="margin">
              <span className="label">{`${t("apy")}`}</span>
              <span>{formattedData.apy}</span>
            </div>
          )} */}
            {Object.keys(poolData.aprs).map((key) => {
              const symbol = poolData.aprs[key as Partners]?.symbol as string
              return poolData.aprs[key as Partners]?.apr.gt(Zero) ? (
                <div className="margin Apr" key={symbol}>
                  {symbol.includes("/") ? (
                    <span className="label underline">
                      <ToolTip content={symbol.replaceAll("/", "\n")}>
                        Reward APR
                      </ToolTip>
                    </span>
                  ) : (
                    <span className="label">{symbol} APR</span>
                  )}
                  <span className="plus">
                    {formattedData.aprs[key as Partners] as string}
                  </span>
                </div>
              ) : null
            })}
            {hasShare && (
              <div className="margin">
                <span className="label">Balance</span>
                <span>{`$${formattedData.userBalanceUSD}`}</span>
              </div>
            )}
            <div className="margin">
              <span className="label">TVL</span>
              <span>{`$${formattedData.reserve}`}</span>
            </div>
            {formattedData.volume && (
              <div>
                <span className="label">{`${t("24HrVolume")}`}</span>
                <span>{formattedData.volume}</span>
              </div>
            )}
          </div>
          <div className="buttons">
            <Link to={`${poolRoute}/withdraw`}>
              <Button variant="outline">{t("removeLiquidity")}</Button>
            </Link>
            {shouldMigrate ? (
              <Button
                variant="temporary"
                onClick={onClickMigrate}
                disabled={!hasShare}
              >
                {t("migrate")}
              </Button>
            ) : (
              <Link to={`${poolRoute}/deposit`}>
                <Button
                  variant="primary"
                  padding="15px"
                  width="175px"
                  size="md"
                  disabled={poolData?.isPaused || isOutdated}
                >
                  {t("addLiquidity")}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Tag(props: {
  children?: React.ReactNode
  kind?: "warning" | "error"
}) {
  const { kind = "warning", ...tagProps } = props
  return <span className={classNames("tag", kind)} {...tagProps} />
}
