import {
  Box,
  Flex,
  Grid,
  GridItem,
  HStack,
  Image,
  Stack,
  Text,
} from "@chakra-ui/react"
import {
  POOLS_MAP,
  POOL_FEE_PRECISION,
  PoolName,
  TOKENS_MAP,
} from "../constants"
import React, { ReactElement } from "react"
import {
  commify,
  formatBNToPercentString,
  formatBNToShortString,
  formatBNToString,
} from "../utils"
import useChakraToast, { TransactionType } from "../hooks/useChakraToast"
import { AppState } from "../state"
import BackButton from "../components/button/BackButton"
import { BigNumber } from "@ethersproject/bignumber"
import ComponentWrapper from "../components/wrappers/ComponentWrapper"
import Deposit from "../components/Deposit"
import { FaChartPie } from "react-icons/fa"
import Farm from "../components/Farm"
import PageWrapper from "../components/wrappers/PageWrapper"
import StakeDetails from "../components/stake/StakeDetails"
import TabsWrapper from "../components/wrappers/TabsWrapper"
import Withdraw from "../components/Withdraw"
import { Zero } from "@ethersproject/constants"
import useHandlePostSubmit from "../hooks/useHandlePostSubmit"
import usePoolData from "../hooks/usePoolData"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

interface Props {
  poolName: PoolName
}

const Pool = ({ poolName }: Props): ReactElement => {
  const { t } = useTranslation()
  const toast = useChakraToast()
  const handlePostSubmit = useHandlePostSubmit()
  const [poolData, userShareData] = usePoolData(poolName)

  // farm
  const farmName = POOLS_MAP[poolName].farmName

  const lpTokenBalance = userShareData?.lpTokenBalance
  const { farmStats } = useSelector((state: AppState) => state.application)
  const farmTvl = farmStats?.[farmName]?.tvl
  const formattedFarmTvl = farmTvl
    ? `$${formatBNToShortString(BigNumber.from(farmTvl), 18)}`
    : "-"
  const apr = farmStats?.[farmName]?.apr || "-"
  const dualRewardApr = farmStats?.[farmName]?.dualReward.apr

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
        value: commify(formatBNToString(coin.value, 18, 3)),
      }
    }) || []

  const preTransaction = (txnType: TransactionType) =>
    toast.transactionPending({
      txnType,
    })

  return (
    <PageWrapper maxW="1300px">
      <ComponentWrapper
        left={
          <StakeDetails
            extraStakeDetailChild={
              <Stack spacing={4}>
                <Flex justifyContent="space-between" alignItems="center">
                  <HStack spacing="10px">
                    <BackButton
                      route="/pools"
                      title="Go back to pools"
                      aria-label="Go back to pools"
                      borderRadius="12px"
                      color="gray.200"
                      fontSize="30px"
                    />
                    <Text
                      color="#FCFCFD"
                      fontSize={{ base: "21px", md: "27px" }}
                      fontWeight={700}
                      lineHeight="39px"
                    >
                      Pool Share
                    </Text>
                  </HStack>
                  <HStack spacing="10px">
                    <FaChartPie color="#EF4444" fontSize="25px" />
                    <Text as="span" fontSize="25px" fontWeight={700}>
                      {formatBNToPercentString(
                        userShareData?.share || Zero,
                        18,
                        2,
                      )}
                    </Text>
                  </HStack>
                </Flex>
                <Farm farmName={farmName} />
              </Stack>
            }
            balanceView={{
              title: "LP Token Balance",
              items: [
                {
                  tokenName: poolData?.lpToken ?? "-",
                  icon: POOLS_MAP[poolData?.name || ""]?.lpToken.icon || "-",
                  amount: commify(
                    formatBNToString(lpTokenBalance || Zero, 18, 5),
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
                  <Box className="tokenList" bg="gray.900" borderRadius="12px">
                    <Grid
                      gridTemplateColumns={{
                        base: "repeat(1, 1fr)",
                        md: "repeat(2, 1fr)",
                      }}
                      gridTemplateRows="auto"
                      gap={5}
                      mt={2}
                      p="15px"
                    >
                      {formattedPoolDataTokens.map((token, index) => (
                        <GridItem
                          key={index}
                          colSpan={{
                            base: 1,
                            md:
                              index === formattedPoolDataTokens.length - 1 &&
                              formattedPoolDataTokens.length === 3
                                ? 2
                                : 1,
                          }}
                        >
                          <Flex
                            alignItems={{ base: "start", md: "center" }}
                            gap={3}
                            justifyContent={{ base: "start", md: "center" }}
                          >
                            <HStack alignItems="center" spacing={2}>
                              <Box boxSize="24px">
                                <Image
                                  alt="icon"
                                  src={token.icon}
                                  w="full"
                                  objectFit="cover"
                                />
                              </Box>
                              <Text
                                as="span"
                                fontSize="11px"
                                fontWeight={400}
                                color="gray.300"
                              >
                                {token.symbol}
                              </Text>
                            </HStack>
                            <Stack spacing={0}>
                              <Text
                                as="span"
                                fontSize="12px"
                                fontWeight={700}
                                color="gray.50"
                              >
                                {token.value}
                              </Text>
                              <Text
                                as="span"
                                fontSize="12px"
                                fontWeight={500}
                                color="gray.200"
                              >
                                {token.percent}
                              </Text>
                            </Stack>
                          </Flex>
                        </GridItem>
                      ))}
                    </Grid>
                  </Box>
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
              {
                statLabel: "Farm TVL",
                statValue: formattedFarmTvl,
              },
              {
                statLabel: "APR",
                statValue: farmStats?.[farmName]?.apr
                  ? farmStats?.[farmName]?.apr === "∞%"
                    ? "∞%"
                    : `${(
                        +apr.slice(0, -1) + +(dualRewardApr?.slice(0, -1) || 0)
                      ).toString()}%`
                  : "-",
              },
            ]}
          />
        }
        right={
          <TabsWrapper
            tabsProps={{ variant: "primary" }}
            tab1={{
              name: t("addLiquidity"),
              content: (
                <Deposit
                  poolName={poolName}
                  handlePreSubmit={preTransaction}
                  handlePostSubmit={handlePostSubmit}
                />
              ),
            }}
            tab2={{
              name: t("removeLiquidity"),
              content: (
                <Withdraw
                  poolName={poolName}
                  handlePreSubmit={preTransaction}
                  handlePostSubmit={handlePostSubmit}
                />
              ),
            }}
          />
        }
      />
    </PageWrapper>
  )
}

export default Pool
