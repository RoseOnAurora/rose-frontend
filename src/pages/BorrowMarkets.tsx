import { AppDispatch, AppState } from "../state"
import {
  BORROW_FILTER_FIELDS_TO_LABEL,
  BORROW_MARKET_MAP,
  BORROW_SORT_FIELDS_TO_LABEL,
  BorrowMarket,
  BorrowMarketName,
  DashboardItems,
  NEAR_MARKET_NAME,
  STROSE_MARKET_NAME,
  UST_MARKET_NAME,
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
  DrawerOverlay,
  Flex,
  Grid,
  GridItem,
  Progress,
  Skeleton,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
  useTimeout,
} from "@chakra-ui/react"
import {
  FaFilter,
  FaHandHoldingUsd,
  FaLayerGroup,
  FaSortAmountUp,
} from "react-icons/fa"
import React, { ReactElement, useMemo, useState } from "react"
import useBorrowData, { BorrowDataType } from "../hooks/useBorrowData"
import { useDispatch, useSelector } from "react-redux"
import { AnimatePresence } from "framer-motion"
import AnimatingNumber from "../components/AnimateNumber"
import BorrowMarketsOverview from "../components/BorrowMarketsOverview"
import { BsSliders } from "react-icons/bs"
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
import { formatBNToString } from "../utils"

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

  useTimeout(() => setTimout(true), 5000)

  const onIconButtonClick = (isInfo: boolean): void => {
    onOpen()
    setIsInfo(isInfo)
  }

  const [nearMarketData, loading1] = useBorrowData(NEAR_MARKET_NAME)
  const [stRoseMarketData, loading2] = useBorrowData(STROSE_MARKET_NAME)
  const [ustMarketData, loading3] = useBorrowData(UST_MARKET_NAME)

  const loading = loading1 && loading2 && loading3

  const marketsData = useMemo(() => {
    return {
      [NEAR_MARKET_NAME]: nearMarketData,
      [STROSE_MARKET_NAME]: stRoseMarketData,
      [UST_MARKET_NAME]: ustMarketData,
    }
  }, [nearMarketData, stRoseMarketData, ustMarketData])

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
    // fix tvl
    tvl: (a: BorrowMarket, b: BorrowMarket) =>
      marketsData[a.name].borrowed.gt(marketsData[b.name].borrowed),
    interest: (a: BorrowMarket, b: BorrowMarket) =>
      marketsData[a.name].interest.gt(marketsData[b.name].interest),
    liquidationFee: (a: BorrowMarket, b: BorrowMarket) =>
      marketsData[a.name].liquidationFee.gt(marketsData[b.name].liquidationFee),
    collateral: (a: BorrowMarket, b: BorrowMarket) =>
      marketsData[a.name].collateralDepositedUSDPrice.gt(
        marketsData[b.name].collateralDepositedUSDPrice,
      ),
  }

  return (
    <PageWrapper activeTab="borrow" maxW="1550px">
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
                    items: [],
                  },
                ]}
              />
            ) : (
              <BorrowDashboard
                totalRUSDBorrowed={totalRUSDBorrowed}
                marketsData={marketsData}
                rusdBorrowedFormatted={rusdBorrowedFormatted}
                collateralDepositedUSD={collateralDepositedUSD}
                loading={loading}
                timeout={timeout}
              />
            )}
          </DrawerBody>
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
            marketsData={marketsData}
            rusdBorrowedFormatted={rusdBorrowedFormatted}
            collateralDepositedUSD={collateralDepositedUSD}
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
  marketsData: { [borrowMarket in BorrowMarketName]: BorrowDataType }
  rusdBorrowedFormatted: DashboardItems[]
  collateralDepositedUSD: DashboardItems[]
  loading: boolean
  timeout: boolean
}

const BorrowDashboard = (props: BorrowDashboardProps): ReactElement => {
  const {
    totalRUSDBorrowed,
    marketsData,
    rusdBorrowedFormatted,
    collateralDepositedUSD,
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
            <Flex justifyContent="space-between" alignItems="center">
              <FaHandHoldingUsd
                color="#cc3a59"
                size="35px"
                title="Total RUSD Borrowed"
              />
              <AnimatingNumber
                value={totalRUSDBorrowed}
                precision={totalRUSDBorrowed > 0 ? 3 : 1}
              />
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
                          a.positionHealth.gt(b.positionHealth) ? 1 : -1,
                        )
                        .map((marketData, index) => {
                          const positionHealth =
                            +formatBNToString(marketData.positionHealth, 18) *
                            100
                          const positionHealthFormatted = `${positionHealth.toFixed(
                            0,
                          )}%`
                          const colorScheme =
                            positionHealth <= 15
                              ? {
                                  bar: "red",
                                  text: positionTextColorHigh,
                                }
                              : positionHealth > 50
                              ? {
                                  bar: "green",
                                  text: positionTextColorSafe,
                                }
                              : {
                                  bar: "orange",
                                  text: positionTextColorMod,
                                }
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
                                  <Text color={colorScheme.text}>
                                    {positionHealthFormatted}
                                  </Text>
                                </Stack>
                                <Box width={150}>
                                  <Progress
                                    colorScheme={colorScheme.bar}
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
        />
      }
    />
  )
}

export default BorrowMarkets
