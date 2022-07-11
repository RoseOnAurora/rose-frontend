import {
  POOLS_MAP,
  POOL_FEE_PRECISION,
  PoolName,
  TOKENS_MAP,
} from "../constants"
import React, { ReactElement } from "react"
import { commify, formatBNToPercentString, formatBNToString } from "../utils"
import useChakraToast, { TransactionType } from "../hooks/useChakraToast"
import BackButton from "../components/BackButton"
import BlockExplorerLink from "../components/BlockExplorerLink"
import ComponentWrapper from "../components/wrappers/ComponentWrapper"
import { ContractReceipt } from "@ethersproject/contracts"
import Deposit from "../components/Deposit"
import { FaChartPie } from "react-icons/fa"
import { Flex } from "@chakra-ui/react"
import PageWrapper from "../components/wrappers/PageWrapper"
import StakeDetails from "../components/StakeDetails"
import TabsWrapper from "../components/wrappers/TabsWrapper"
import Withdraw from "../components/Withdraw"
import { Zero } from "@ethersproject/constants"
import { useActiveWeb3React } from "../hooks"
import usePoolData from "../hooks/usePoolData"
import { useTranslation } from "react-i18next"

interface Props {
  poolName: PoolName
}

const Pool = ({ poolName }: Props): ReactElement => {
  const { t } = useTranslation()
  const toast = useChakraToast()
  const { chainId } = useActiveWeb3React()
  const [poolData, userShareData] = usePoolData(poolName)

  const formattedShareTokens =
    userShareData?.tokens.map((coin) => {
      const token = TOKENS_MAP[coin.symbol]
      return {
        tokenName: token.name,
        icon: token.icon,
        amount: commify(formatBNToString(coin.value, 18, 5)),
      }
    }) || []
  const formattedPoolDataTokens =
    poolData?.tokens.map((coin) => {
      const token = TOKENS_MAP[coin.symbol]
      return {
        symbol: token.symbol,
        name: token.name,
        icon: token.icon,
        percent: coin.percent,
        value: commify(formatBNToString(coin.value, 18, 5)),
      }
    }) || []

  const postTransaction = (
    receipt: ContractReceipt | null,
    transactionType: TransactionType,
    error?: { code: number; message: string },
  ): void => {
    const description = receipt?.transactionHash ? (
      <BlockExplorerLink
        txnType={transactionType}
        txnHash={receipt?.transactionHash}
        status={receipt?.status ? "Succeeded" : "Failed"}
        chainId={chainId}
      />
    ) : null
    if (receipt?.status) {
      toast.transactionSuccess({
        txnType: transactionType,
        description: description,
      })
    } else {
      toast.transactionFailed({
        txnType: transactionType,
        error,
        description: description,
      })
    }
  }

  const preTransaction = (txnType: TransactionType) =>
    toast.transactionPending({
      txnType,
    })

  return (
    <PageWrapper>
      <ComponentWrapper
        top={<BackButton route="/pools" buttonText="Go back to pools" />}
        left={
          <TabsWrapper
            tabsProps={{ variant: "primary" }}
            tab1={{
              name: t("addLiquidity"),
              content: (
                <Deposit
                  poolName={poolName}
                  handlePreSubmit={preTransaction}
                  handlePostSubmit={postTransaction}
                />
              ),
            }}
            tab2={{
              name: t("removeLiquidity"),
              content: (
                <Withdraw
                  poolName={poolName}
                  handlePreSubmit={preTransaction}
                  handlePostSubmit={postTransaction}
                />
              ),
            }}
          />
        }
        right={
          <StakeDetails
            extraStakeDetailChild={
              <Flex justifyContent="space-between" alignItems="center">
                <FaChartPie
                  size="40px"
                  color="#cc3a59"
                  title="My Share of the Pool"
                />
                <span style={{ fontSize: "25px", fontWeight: 700 }}>
                  {formatBNToPercentString(userShareData?.share || Zero, 18, 5)}
                </span>
              </Flex>
            }
            balanceView={{
              title: "LP Token Balance",
              items: [
                {
                  tokenName: poolData?.lpToken ?? "-",
                  icon: POOLS_MAP[poolData?.name || ""]?.lpToken.icon || "-",
                  amount: commify(
                    formatBNToString(
                      userShareData?.lpTokenBalance || Zero,
                      18,
                      5,
                    ),
                  ),
                },
              ],
            }}
            stakedView={{
              title: t("deposited"),
              items: formattedShareTokens,
            }}
            stats={[
              {
                statLabel: "TVL",
                statValue: poolData?.reserve
                  ? `$${commify(formatBNToString(poolData.reserve, 18, 2))}`
                  : "-",
                statPopOver: (
                  <div className="tokenList">
                    {formattedPoolDataTokens.map((token, index) => (
                      <div className="token" key={index}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <img alt="icon" src={token.icon} />
                          <span className="bold">{`${token.symbol} ${token.percent}`}</span>
                        </div>
                        <span className="tokenValue">{token.value}</span>
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                statLabel: t("fee"),
                statValue: poolData?.swapFee
                  ? formatBNToPercentString(
                      poolData.swapFee,
                      POOL_FEE_PRECISION,
                    )
                  : "-",
              },
              {
                statLabel: t("virtualPrice"),
                statValue: poolData?.virtualPrice
                  ? commify(formatBNToString(poolData.virtualPrice, 18, 2))
                  : "-",
              },
              {
                statLabel: t("aParameter"),
                statValue: poolData?.aParameter
                  ? commify(formatBNToString(poolData.aParameter, 0, 0))
                  : "-",
                statTooltip: t("aParameterTooltip"),
              },
            ]}
          />
        }
      />
    </PageWrapper>
  )
}

export default Pool
