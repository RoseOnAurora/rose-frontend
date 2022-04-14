import { AppDispatch, AppState } from "../state"
import {
  BORROW_FILTER_FIELDS_TO_LABEL,
  BORROW_MARKET_MAP,
  BORROW_SORT_FIELDS_TO_LABEL,
  BorrowMarket,
  BorrowMarketName,
  DashboardItems,
  NEAR_MARKET_NAME,
  USDC_MARKET_NAME,
  USDT_MARKET_NAME,
  UST_MARKET_NAME,
  wBTC_MARKET_NAME,
  wETH_MARKET_NAME,
} from "../constants"
import {
  BorrowFilterFields,
  BorrowSortFields,
  updateBorrowFilterPreferences,
  updateBorrowSortPreferences,
  updateBorrowVisibleFieldPreferences,
} from "../state/user"
import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerOverlay,
  Flex,
  Grid,
  GridItem,
  Link,
  Progress,
  Skeleton,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
  useTimeout,
} from "@chakra-ui/react"
import { BsCurrencyDollar, BsSliders } from "react-icons/bs"
import {
  FaFilter,
  FaGlassWhiskey,
  FaHandHoldingMedical,
  FaHandHoldingUsd,
  FaLayerGroup,
  FaSortAmountUp,
  FaUserLock,
  FaWallet,
} from "react-icons/fa"
import React, { ReactElement, useMemo, useState } from "react"
import { calculatePositionHealthColor, formatBNToString } from "../utils"
import useBorrowData, { BorrowDataType } from "../hooks/useBorrowData"
import { useDispatch, useSelector } from "react-redux"
import { AnimatePresence } from "framer-motion"
import AnimatingNumber from "../components/AnimateNumber"
import { BigNumber } from "@ethersproject/bignumber"
import BorrowMarketsOverview from "../components/BorrowMarketsOverview"
import Dashboard from "../components/Dashboard"
import FormattedComponentName from "../components/FormattedComponentName"
import OverviewInfo from "../components/OverviewInfo"
import OverviewInputFieldsWrapper from "../components/wrappers/OverviewInputFieldsWrapper"
import OverviewSettingsContent from "../components/OverviewSettingsContent"
import OverviewWrapper from "../components/wrappers/OverviewWrapper"
import PageWrapper from "../components/wrappers/PageWrapper"
import StakeDetails from "../components/StakeDetails"
import { Zero } from "@ethersproject/constants"
import { commify } from "@ethersproject/units"

function BorrowMarkets(): ReactElement {
  const dispatch = useDispatch<AppDispatch>()

  const { borrowPreferences } = useSelector((state: AppState) => state.user)

  const [sortDirection, setSortDirection] = useState(1)
  const [sortByField, setSortByField] = useState(borrowPreferences.sortField)
  const [filterByField, setfilterByField] = useState(
    borrowPreferences.filterField,
  )
  const [timeout, setTimout] = useState(false)
  const [isInfo, setIsInfo] = useState(false)

  const { isOpen, onOpen, onClose } = useDisclosure()
  const resetDashboardView = () => {
    onClose()
    setIsInfo(false)
  }

  useTimeout(() => setTimout(true), 10000)

  const onIconButtonClick = (isInfo: boolean): void => {
    onOpen()
    setIsInfo(isInfo)
  }

  const [nearMarketData, loading1] = useBorrowData(NEAR_MARKET_NAME)
  const [usdcMarketData, loading2] = useBorrowData(USDC_MARKET_NAME)
  const [ustMarketData, loading3] = useBorrowData(UST_MARKET_NAME)
  const [usdtMarketData, loading4] = useBorrowData(USDT_MARKET_NAME)
  const [wEthMarketData, loading5] = useBorrowData(wETH_MARKET_NAME)
  const [wBtcMarketData, loading6] = useBorrowData(wBTC_MARKET_NAME)

  const loading =
    loading1 || loading2 || loading3 || loading4 || loading5 || loading6

  const marketsData = useMemo(() => {
    return {
      [NEAR_MARKET_NAME]: nearMarketData,
      [USDC_MARKET_NAME]: usdcMarketData,
      [UST_MARKET_NAME]: ustMarketData,
      [USDT_MARKET_NAME]: usdtMarketData,
      [wETH_MARKET_NAME]: wEthMarketData,
      [wBTC_MARKET_NAME]: wBtcMarketData,
    }
  }, [
    nearMarketData,
    usdcMarketData,
    ustMarketData,
    usdtMarketData,
    wEthMarketData,
    wBtcMarketData,
  ])

  const totalRUSDBorrowed = useMemo(() => {
    return +formatBNToString(
      Object.values(marketsData).reduce((sum, { borrowed }) => {
        return sum.add(borrowed)
      }, Zero),
      18,
    )
  }, [marketsData])

  const rusdBorrowedFormatted = useMemo(() => {
    return Object.values(marketsData)
      .filter((marketData) => {
        return !marketData.borrowed.isZero()
      })
      .map((marketData) => {
        const marketName = marketData.marketName
        return {
          tokenName: `${marketName} Market`,
          icon: BORROW_MARKET_MAP[marketName].borrowToken.icon,
          amount: commify(formatBNToString(marketData.borrowed, 18, 5)),
        }
      })
  }, [marketsData])

  const collateralDepositedUSD = useMemo(() => {
    return Object.values(marketsData)
      .filter((marketData) => {
        return !marketData.collateralDepositedUSDPrice.isZero()
      })
      .map((marketData) => {
        const marketName = marketData.marketName
        return {
          tokenName: `${marketName} Market`,
          icon: BORROW_MARKET_MAP[marketName].collateralToken.icon,
          amount: `$${commify(
            formatBNToString(marketData.collateralDepositedUSDPrice, 18, 2),
          )}`,
        }
      })
  }, [marketsData])

  const totalTvl = useMemo(() => {
    return Object.values(marketsData)
      ?.map(({ tvl }) => {
        return tvl
      })
      .reduce((sum, tvl) => {
        return sum.add(tvl)
      }, Zero)
  }, [marketsData])

  const FILTER_FUNCTIONS: {
    [filterField in BorrowFilterFields]: (a: BorrowMarket) => boolean
  } = {
    borrow: (a: BorrowMarket) => !marketsData[a.name].borrowed.isZero(),
    supply: (a: BorrowMarket) =>
      !marketsData[a.name].totalRUSDLeftToBorrow.isZero(),
    collateral: (a: BorrowMarket) =>
      !marketsData[a.name].collateralDepositedUSDPrice.isZero(),
    noFilter: (a: BorrowMarket) => a === a,
  }

  const SORT_FUNCTIONS: {
    [sortField in BorrowSortFields]: (
      a: BorrowMarket,
      b: BorrowMarket,
    ) => boolean
  } = {
    borrow: (a: BorrowMarket, b: BorrowMarket) =>
      marketsData[a.name].borrowed.gt(marketsData[b.name].borrowed),
    supply: (a: BorrowMarket, b: BorrowMarket) =>
      marketsData[a.name].totalRUSDLeftToBorrow.gt(
        marketsData[b.name].totalRUSDLeftToBorrow,
      ),
    name: (a: BorrowMarket, b: BorrowMarket) =>
      a.name.localeCompare(b.name) > 1,
    tvl: (a: BorrowMarket, b: BorrowMarket) =>
      marketsData[a.name].tvl.gt(marketsData[b.name].tvl),
    interest: (a: BorrowMarket, b: BorrowMarket) =>
      marketsData[a.name].interest.gt(marketsData[b.name].interest),
    liquidationFee: (a: BorrowMarket, b: BorrowMarket) =>
      marketsData[a.name].liquidationFee.gt(marketsData[b.name].liquidationFee),
    collateral: (a: BorrowMarket, b: BorrowMarket) =>
      marketsData[a.name].collateralDepositedUSDPrice.gt(
        marketsData[b.name].collateralDepositedUSDPrice,
      ),
  }

  const GlossaryItem = ({ title, text }: { title: string; text: string }) => {
    return (
      <>
        <b>{title}</b>: {text}
      </>
    )
  }

  return (
    <PageWrapper activeTab="borrow" maxW="1650px">
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={resetDashboardView}
        size={isInfo ? "sm" : "md"}
      >
        <DrawerOverlay />
        <DrawerContent
          bg={useColorModeValue(
            "linear-gradient(to bottom, #f7819a, #ebd9c2, #e9e0d9)",
            "linear-gradient(to right, #141414, #200122, #791038)",
          )}
          p="50px 10px"
        >
          <DrawerCloseButton />
          <DrawerBody p="5px">
            {isInfo ? (
              <OverviewInfo
                infoType="Borrow"
                sections={[
                  {
                    title: "How to Borrow",
                    items: [
                      {
                        icon: FaHandHoldingUsd,
                        text:
                          "Click on one of the borrow markets cards to add collateral to borrow RUSD. The name of the market indicates which token(s) are accepted as collateral.",
                      },
                    ],
                  },
                  {
                    title: "Dashboard",
                    items: [
                      {
                        icon: FaLayerGroup,
                        text:
                          "View your total borrowed & collateralized positions across all markets all in one view!",
                      },
                    ],
                  },
                  {
                    title: "Preferences",
                    items: [
                      {
                        icon: FaSortAmountUp,
                        text:
                          "Sort by any of the borrow market card fields like TVL, Interest & Name.",
                      },
                      {
                        icon: FaFilter,
                        text:
                          "Filter by your Borrowed Balances and collateralized positions.",
                      },
                      {
                        icon: BsSliders,
                        text:
                          "Configure your preferences on this page like default sorting behavior. We will save this info for you and apply it each time you visit the page!",
                      },
                    ],
                  },
                  {
                    title: "Glossary",
                    items: [
                      {
                        icon: FaUserLock,
                        text: (
                          <GlossaryItem
                            title="TVL"
                            text="The dollar value of total collateral deposited in this market."
                          />
                        ),
                      },
                      {
                        icon: FaGlassWhiskey,
                        text: (
                          <GlossaryItem
                            title="RUSD Left to Borrow"
                            text="total RUSD left in this market for users to borrow."
                          />
                        ),
                      },
                      {
                        icon: BsCurrencyDollar,
                        text: (
                          <GlossaryItem
                            title="Interest"
                            text="interest rate per year (APR)."
                          />
                        ),
                      },
                      {
                        icon: BsCurrencyDollar,
                        text: (
                          <GlossaryItem
                            title="Liquidation Fee"
                            text="This is the discount a liquidator gets when buying collateral flagged for liquidation."
                          />
                        ),
                      },
                      {
                        icon: FaHandHoldingUsd,
                        text: (
                          <GlossaryItem
                            title="Your RUSD Borrowed"
                            text="The amount of RUSD you are borrowing per market."
                          />
                        ),
                      },
                      {
                        icon: BsCurrencyDollar,
                        text: (
                          <GlossaryItem
                            title="Your Collateral Deposited"
                            text="The dollar value of collateral you have deposited per market."
                          />
                        ),
                      },
                      {
                        icon: FaHandHoldingMedical,
                        text: (
                          <GlossaryItem
                            title="Your Position Health"
                            text="Your position health is represented as a percentage proportional to the maximum debt ratio. Typically, 80-90% and higher is at risk for liquidation and 0% is the healthiest your position can be."
                          />
                        ),
                      },
                    ],
                  },
                ]}
              />
            ) : (
              <BorrowDashboard
                totalRUSDBorrowed={totalRUSDBorrowed}
                rusdBalance={nearMarketData.rusdUserBalance}
                marketsData={marketsData}
                rusdBorrowedFormatted={rusdBorrowedFormatted}
                collateralDepositedUSD={collateralDepositedUSD}
                totalTvl={totalTvl}
                loading={loading}
                timeout={timeout}
              />
            )}
          </DrawerBody>
          {isInfo && (
            <DrawerFooter>
              <Link
                href="https://medium.com/@RoseOnAurora/rose-borrow-testnet-launch-a66f3f1de949"
                target="_blank"
                rel="noreferrer"
              >
                Go to Full How-to Guide<sup>↗</sup>
              </Link>
            </DrawerFooter>
          )}
        </DrawerContent>
      </Drawer>
      <OverviewWrapper
        top={
          <OverviewInputFieldsWrapper
            sortDirection={sortDirection}
            sortByField={sortByField}
            sortFieldLabelMap={BORROW_SORT_FIELDS_TO_LABEL}
            filterByField={filterByField}
            filterFieldLabelMap={BORROW_FILTER_FIELDS_TO_LABEL}
            handleSortDirection={setSortDirection}
            handleClearFilter={() =>
              setfilterByField(BorrowFilterFields.NO_FILTER)
            }
            handleUpdateSortField={(e) =>
              setSortByField(e.target.value as BorrowSortFields)
            }
            handleUpdateFilterField={(e) =>
              setfilterByField(e.target.value as BorrowFilterFields)
            }
            popOverContent={
              <OverviewSettingsContent
                sortFieldLabelMap={BORROW_SORT_FIELDS_TO_LABEL}
                filterFieldLabelMap={BORROW_FILTER_FIELDS_TO_LABEL}
                preferences={borrowPreferences}
                updateVisibleFields={(e, field: string) =>
                  dispatch(
                    updateBorrowVisibleFieldPreferences({
                      field: field as BorrowSortFields,
                      value: +e.target.value * -1,
                    }),
                  )
                }
                updateFilterPreferences={(e) =>
                  dispatch(
                    updateBorrowFilterPreferences(
                      e.target.value as BorrowFilterFields,
                    ),
                  )
                }
                updateSortPreferences={(e) =>
                  dispatch(
                    updateBorrowSortPreferences(
                      e.target.value as BorrowSortFields,
                    ),
                  )
                }
              />
            }
            onIconClick={onIconButtonClick}
          />
        }
        left={
          <AnimatePresence>
            {Object.values(BORROW_MARKET_MAP)
              .filter((borrowMarket) =>
                FILTER_FUNCTIONS[filterByField](borrowMarket),
              )
              .sort((a, b) => {
                return SORT_FUNCTIONS[sortByField](a, b)
                  ? sortDirection * -1
                  : sortDirection
              })
              .map((borrowMarket, index) => {
                return timeout || !loading ? (
                  <BorrowMarketsOverview
                    key={borrowMarket.name}
                    marketName={borrowMarket.name}
                    borrowRoute={borrowMarket.route}
                    tokenIcon={borrowMarket.collateralToken.icon}
                    borrowed={marketsData[borrowMarket.name].borrowed || Zero}
                    position={
                      marketsData[borrowMarket.name]
                        .collateralDepositedUSDPrice || Zero
                    }
                    rusdLeftToBorrow={
                      marketsData[borrowMarket.name].totalRUSDLeftToBorrow ||
                      Zero
                    }
                    tvl={marketsData[borrowMarket.name].tvl || Zero}
                    interest={marketsData[borrowMarket.name].interest || Zero}
                    fee={marketsData[borrowMarket.name].liquidationFee || Zero}
                  />
                ) : (
                  <Skeleton key={index} height="100px" borderRadius="10px" />
                )
              })}
          </AnimatePresence>
        }
        right={
          <BorrowDashboard
            totalRUSDBorrowed={totalRUSDBorrowed}
            rusdBalance={nearMarketData.rusdUserBalance}
            marketsData={marketsData}
            rusdBorrowedFormatted={rusdBorrowedFormatted}
            collateralDepositedUSD={collateralDepositedUSD}
            totalTvl={totalTvl}
            loading={loading}
            timeout={timeout}
          />
        }
      />
    </PageWrapper>
  )
}

interface BorrowDashboardProps {
  totalRUSDBorrowed: number
  rusdBalance: BigNumber
  marketsData: { [borrowMarket in BorrowMarketName]: BorrowDataType }
  rusdBorrowedFormatted: DashboardItems[]
  collateralDepositedUSD: DashboardItems[]
  totalTvl: BigNumber
  loading: boolean
  timeout: boolean
}

const BorrowDashboard = (props: BorrowDashboardProps): ReactElement => {
  const {
    totalRUSDBorrowed,
    rusdBalance,
    marketsData,
    rusdBorrowedFormatted,
    collateralDepositedUSD,
    totalTvl,
    loading,
    timeout,
  } = props
  const positionTextColorSafe = useColorModeValue("green.500", "green.200")
  const positionTextColorMod = useColorModeValue("orange.500", "orange.200")
  const positionTextColorHigh = useColorModeValue("red.500", "red.200")
  return (
    <Dashboard
      dashboardName="Borrow Markets"
      dashboardContent={
        <StakeDetails
          extraStakeDetailChild={
            <Flex
              justifyContent="space-between"
              alignItems="baseline"
              gridGap="15px"
              flexDirection={{ base: "column", xl: "row" }}
            >
              <Stack
                spacing="30px"
                w="100%"
                alignItems="center"
                bg="var(--secondary-background)"
                justifyContent="baseline"
                p="20px"
                borderRadius="15px"
                boxShadow="0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
              >
                <Stack spacing="10px" alignItems="center">
                  <Text
                    textAlign="center"
                    fontSize="16px"
                    as="h3"
                    color="var(--text-lighter)"
                    fontWeight={600}
                  >
                    Your Total RUSD Borrowed
                  </Text>
                  <FaHandHoldingUsd
                    color="#cc3a59"
                    size="40px"
                    title="Total RUSD Borrowed"
                  />
                </Stack>
                <Box justifySelf="center" alignSelf="center">
                  <AnimatingNumber
                    value={totalRUSDBorrowed}
                    precision={totalRUSDBorrowed > 0 ? 3 : 1}
                  />
                </Box>
              </Stack>
              <Stack
                spacing="30px"
                alignItems="center"
                w="100%"
                bg="var(--secondary-background)"
                justifyContent="baseline"
                p="20px"
                borderRadius="15px"
                boxShadow="0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
              >
                <Stack spacing="10px" alignItems="center">
                  <Text
                    textAlign="center"
                    fontSize="16px"
                    as="h3"
                    color="var(--text-lighter)"
                    fontWeight={600}
                  >
                    Your Total RUSD Balance
                  </Text>
                  <FaWallet
                    color="#cc3a59"
                    size="40px"
                    title="RUSD Balance in your Wallet"
                  />
                </Stack>
                <Box justifySelf="center" alignSelf="center">
                  <AnimatingNumber
                    value={+commify(formatBNToString(rusdBalance, 18, 2))}
                    precision={
                      +commify(formatBNToString(rusdBalance, 18, 2)) > 0 ? 3 : 1
                    }
                  />
                </Box>
              </Stack>
            </Flex>
          }
          bottom={
            <Grid gridTemplateRows="auto" rowGap="25px">
              <GridItem>
                <Text fontWeight={700} lineHeight="30px" fontSize="25px">
                  Your Position Health
                </Text>
              </GridItem>
              <GridItem>
                {totalRUSDBorrowed > 0 ? (
                  <Grid gridTemplateRows="auto" rowGap="10px">
                    {!loading &&
                      Object.values(marketsData)
                        .filter(
                          (a) =>
                            a.borrowed.gt(Zero) ||
                            a.collateralDeposited.gt(Zero),
                        )
                        .sort((a, b) =>
                          a.positionHealth.gt(b.positionHealth) ? -1 : 1,
                        )
                        .map((marketData, index) => {
                          // calculate position health, format it and add colors
                          const positionHealth =
                            +formatBNToString(marketData.positionHealth, 18) *
                            100
                          const positionHealthFormatted = `${positionHealth.toFixed(
                            0,
                          )}%`
                          const barColor = calculatePositionHealthColor(
                            positionHealth,
                            BORROW_MARKET_MAP[marketData.marketName].isStable,
                          )
                          const textColor =
                            barColor === "red"
                              ? positionTextColorHigh
                              : barColor === "green"
                              ? positionTextColorSafe
                              : positionTextColorMod

                          // return sorted grid items
                          return (
                            <GridItem key={index}>
                              <Flex
                                justifyContent="space-between"
                                alignItems="center"
                              >
                                <Stack spacing="5px">
                                  <FormattedComponentName
                                    name={
                                      BORROW_MARKET_MAP[marketData.marketName]
                                        .name
                                    }
                                    icon={
                                      BORROW_MARKET_MAP[marketData.marketName]
                                        .collateralToken.icon
                                    }
                                  />
                                  <Text color={textColor}>
                                    {positionHealthFormatted}
                                  </Text>
                                </Stack>
                                <Box width={150}>
                                  <Progress
                                    colorScheme={barColor}
                                    title={positionHealthFormatted}
                                    height="30px"
                                    value={positionHealth}
                                  />
                                </Box>
                              </Flex>
                            </GridItem>
                          )
                        })}
                  </Grid>
                ) : (
                  <Text textAlign="center" color="var(--text-lighter)">
                    Your position health will appear here.
                  </Text>
                )}
              </GridItem>
            </Grid>
          }
          loading={!timeout && loading}
          balanceView={{
            title: "Your RUSD Borrowed",
            items: rusdBorrowedFormatted,
          }}
          stakedView={{
            title: "Your Collateral Deposited",
            items: collateralDepositedUSD,
          }}
          stats={[
            {
              statLabel: "Total Borrow TVL",
              statValue: `$${commify(formatBNToString(totalTvl, 18, 2))}`,
            },
          ]}
        />
      }
    />
  )
}

export default BorrowMarkets
