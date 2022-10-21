import { AppDispatch, AppState } from "../state"
import {
  BORROW_FILTER_FIELDS_TO_LABEL,
  BORROW_MARKET_MAP,
  BORROW_SORT_FIELDS_TO_LABEL,
  BorrowMarket,
  BorrowMarketName,
  ChainId,
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
  Center,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerOverlay,
  Flex,
  Grid,
  GridItem,
  Image,
  Link,
  Progress,
  Skeleton,
  Stack,
  Text,
  useDisclosure,
  useTimeout,
} from "@chakra-ui/react"
import {
  BsChevronDown,
  BsChevronExpand,
  BsChevronUp,
  BsCurrencyDollar,
  BsSliders,
} from "react-icons/bs"
import {
  FaFilter,
  FaGlassWhiskey,
  FaHandHoldingMedical,
  FaHandHoldingUsd,
  FaLayerGroup,
  FaSortAmountUp,
  FaUserLock,
} from "react-icons/fa"
import React, { ReactElement, useMemo, useState } from "react"
import {
  calculatePositionHealthColor,
  formatBNToString,
  isAddress,
} from "../utils"
import useBorrowData, { BorrowDataType } from "../hooks/useBorrowData"
import { useDispatch, useSelector } from "react-redux"
import { AnimatePresence } from "framer-motion"
import AnimatingNumber from "../components/AnimateNumber"
import { BigNumber } from "@ethersproject/bignumber"
import BorrowMarketsOverview from "../components/BorrowMarketsOverview"
import FormattedComponentName from "../components/FormattedComponentName"
import OverviewInfo from "../components/OverviewInfo"
import OverviewInputFieldsWrapper from "../components/wrappers/OverviewInputFieldsWrapper"
import OverviewSettingsContent from "../components/OverviewSettingsContent"
import OverviewWrapper from "../components/wrappers/OverviewWrapper"
import PageWrapper from "../components/wrappers/PageWrapper"
import StakeDetails from "../components/stake/StakeDetails"
import { Zero } from "@ethersproject/constants"
import borrowedIcon from "../assets/borrowed.svg"
import chartGraph from "../assets/chart-graph.svg"
import { commify } from "@ethersproject/units"
import emptyListGraphic from "../assets/empty-list.svg"
import { useWeb3React } from "@web3-react/core"
import walletIcon from "../assets/wallet-icon.svg"

function BorrowMarkets(): ReactElement {
  const dispatch = useDispatch<AppDispatch>()
  const { borrowPreferences } = useSelector((state: AppState) => state.user)
  const { chainId } = useWeb3React()

  const [sortDirection, setSortDirection] = useState(1)
  const [sortByField, setSortByField] = useState(borrowPreferences.sortField)
  const [filterByField, setfilterByField] = useState(
    borrowPreferences.filterField,
  )
  const [timeout, setTimout] = useState(false)
  const [isInfo, setIsInfo] = useState(false)
  const [searchText, setSearchText] = useState<string>("")

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

  // borrow market fields
  const fields: BorrowSortFields[] = Object.values(BorrowSortFields)
    .filter((field) => {
      return borrowPreferences.visibleFields[field] > 0
    })
    .map((field) => {
      return field
    })

  return (
    <PageWrapper maxW="1650px">
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={resetDashboardView}
        size={isInfo ? "sm" : "md"}
      >
        <DrawerOverlay bg="blackAlpha.900" />
        <DrawerContent bg="gray.900" p="50px 10px" boxShadow="lg">
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
                        text: "Click on one of the borrow markets cards to add collateral to borrow RUSD. The name of the market indicates which token(s) are accepted as collateral.",
                      },
                    ],
                  },
                  {
                    title: "Dashboard",
                    items: [
                      {
                        icon: FaLayerGroup,
                        text: "View your total borrowed & collateralized positions across all markets all in one view!",
                      },
                    ],
                  },
                  {
                    title: "Preferences",
                    items: [
                      {
                        icon: FaSortAmountUp,
                        text: "Sort by any of the borrow market card fields like TVL, Interest & Name.",
                      },
                      {
                        icon: FaFilter,
                        text: "Filter by your Borrowed Balances and collateralized positions.",
                      },
                      {
                        icon: BsSliders,
                        text: "Configure your preferences on this page like default sorting behavior. We will save this info for you and apply it each time you visit the page!",
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
                Go to Full How-to Guide
              </Link>
              {/* <Box w="12px">
                <Image src={arrowUpRight} w="full" objectFit="cover" />
              </Box> */}
            </DrawerFooter>
          )}
        </DrawerContent>
      </Drawer>
      <OverviewWrapper
        templateColumns="36% 62%"
        left={
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
        right={
          <Stack spacing="15px" ml={2}>
            <Stack spacing="15px">
              <OverviewInputFieldsWrapper
                title="Markets"
                sortDirection={sortDirection}
                sortByField={sortByField}
                sortFieldLabelMap={BORROW_SORT_FIELDS_TO_LABEL}
                filterByField={filterByField}
                filterFieldLabelMap={BORROW_FILTER_FIELDS_TO_LABEL}
                searchText={searchText}
                handleSortDirection={setSortDirection}
                handleClearFilter={() => {
                  setfilterByField(BorrowFilterFields.NO_FILTER)
                  setSearchText("")
                }}
                handleUpdateSortField={(e) =>
                  setSortByField(e.target.value as BorrowSortFields)
                }
                handleUpdateFilterField={(e) =>
                  setfilterByField(e.target.value as BorrowFilterFields)
                }
                onUpdateFilterText={setSearchText}
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
              <Grid
                templateColumns={{
                  base: `repeat(${fields.length < 3 ? fields.length : 3}, 1fr)`,
                  md: `repeat(${fields.length}, 1fr)`,
                }}
                columnGap={6}
                alignItems="baseline"
                py="15px"
                px="10px"
                color="gray.300"
                display={{ base: "none", lg: "grid" }}
              >
                {fields.map((field, index) => (
                  <GridItem key={index}>
                    <Flex alignItems="center" gap="3px">
                      <Text fontSize="14px">
                        {BORROW_SORT_FIELDS_TO_LABEL[field]}
                      </Text>
                      {field === sortByField ? (
                        sortDirection > 0 ? (
                          <BsChevronUp
                            onClick={() => {
                              setSortByField(field)
                              setSortDirection((prev) => prev * -1)
                            }}
                            cursor="pointer"
                            color="#8B5CF6"
                          />
                        ) : (
                          <BsChevronDown
                            onClick={() => {
                              setSortByField(field)
                              setSortDirection((prev) => prev * -1)
                            }}
                            cursor="pointer"
                            color="#8B5CF6"
                          />
                        )
                      ) : (
                        <BsChevronExpand
                          onClick={() => {
                            setSortByField(field)
                            setSortDirection((prev) => prev * -1)
                          }}
                          cursor="pointer"
                          color="#6B7280"
                        />
                      )}
                    </Flex>
                  </GridItem>
                ))}
              </Grid>
            </Stack>
            <Stack spacing={6} maxH="600px" overflowY="auto">
              <AnimatePresence initial={false}>
                {Object.values(BORROW_MARKET_MAP)
                  .filter((borrowMarket) =>
                    FILTER_FUNCTIONS[filterByField](borrowMarket),
                  )
                  .filter(({ name, gardenAddresses }) => {
                    const target = searchText.toLowerCase()
                    if (isAddress(target) && chainId) {
                      return (
                        gardenAddresses[chainId as ChainId].toLowerCase() ===
                        target
                      )
                    }
                    return name.toLowerCase().includes(target)
                  })
                  .sort((a, b) => {
                    return SORT_FUNCTIONS[sortByField](a, b)
                      ? sortDirection * -1
                      : sortDirection
                  })
                  .map((borrowMarket) => (
                    <Skeleton
                      key={borrowMarket.name}
                      borderRadius="10px"
                      fadeDuration={1}
                      isLoaded={timeout || !loading}
                    >
                      <BorrowMarketsOverview
                        marketName={borrowMarket.name}
                        borrowRoute={borrowMarket.route}
                        tokenIcon={borrowMarket.collateralToken.icon}
                        borrowed={
                          marketsData[borrowMarket.name].borrowed || Zero
                        }
                        position={
                          marketsData[borrowMarket.name]
                            .collateralDepositedUSDPrice || Zero
                        }
                        rusdLeftToBorrow={
                          marketsData[borrowMarket.name]
                            .totalRUSDLeftToBorrow || Zero
                        }
                        tvl={marketsData[borrowMarket.name].tvl || Zero}
                        interest={
                          marketsData[borrowMarket.name].interest || Zero
                        }
                        fee={
                          marketsData[borrowMarket.name].liquidationFee || Zero
                        }
                      />
                    </Skeleton>
                  ))}
              </AnimatePresence>
            </Stack>
          </Stack>
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

  return (
    <StakeDetails
      extraStakeDetailChild={
        <Stack spacing={4}>
          <Flex
            justifyContent="space-between"
            alignItems="center"
            gap="15px"
            py="5px"
            px="15px"
          >
            <Text
              fontWeight={700}
              fontSize="30px"
              color="#FCFCFD"
              lineHeight="39px"
            >
              Dashboard
            </Text>
            <Box boxSize="30px">
              <Image src={chartGraph} objectFit="cover" w="full" />
            </Box>
          </Flex>
          <Stack
            spacing="10px"
            alignItems="center"
            direction={{ base: "column", md: "row" }}
          >
            <Box
              bg="bgDark"
              borderRadius="8px"
              py="5px"
              px="20px"
              w="full"
              h="115px"
            >
              <Stack pt={{ base: "15px", md: 0 }}>
                <Text
                  fontWeight={700}
                  fontSize="15px"
                  color="gray.200"
                  lineHeight={{ base: "25px", md: "39px" }}
                  textAlign="left"
                >
                  Total RUSD Borrowed
                </Text>

                <Flex gap="10px" alignItems="center">
                  <Box boxSize="25px">
                    <Image src={borrowedIcon} w="full" objectFit="cover" />
                  </Box>
                  <Box justifySelf="center" alignSelf="center">
                    <AnimatingNumber
                      value={totalRUSDBorrowed}
                      precision={totalRUSDBorrowed > 0 ? 2 : 1}
                    />
                  </Box>
                </Flex>
              </Stack>
            </Box>
            <Box
              bg="bgDark"
              borderRadius="8px"
              py="5px"
              px="20px"
              w="full"
              h="115px"
            >
              <Stack pt={{ base: "15px", md: 0 }}>
                <Text
                  fontWeight={700}
                  fontSize="15px"
                  color="gray.200"
                  lineHeight={{ base: "25px", md: "39px" }}
                  textAlign="left"
                >
                  Total RUSD Balance
                </Text>

                <Flex gap="10px" alignItems="center">
                  <Box boxSize="25px">
                    <Image src={walletIcon} w="full" objectFit="cover" />
                  </Box>
                  <Box justifySelf="center" alignSelf="center">
                    <AnimatingNumber
                      value={+commify(formatBNToString(rusdBalance, 18, 2))}
                      precision={
                        +commify(formatBNToString(rusdBalance, 18, 2)) > 0
                          ? 2
                          : 1
                      }
                    />
                  </Box>
                </Flex>
              </Stack>
            </Box>
          </Stack>
          <Box bg="bgDark" borderRadius="8px" p="24px">
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
                              ? "red.400"
                              : barColor === "green"
                              ? "green.400"
                              : "orange.400"

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
                  <Center w="full" isolation="isolate" pos="relative">
                    <Text
                      zIndex={2}
                      color="gray.200"
                      fontWeight={500}
                      fontSize="16px"
                      lineHeight="16px"
                      textAlign="center"
                      pt="28px"
                      pb="14px"
                    >
                      Your position health will appear here.
                    </Text>
                    <Box pos="absolute" top="0px" opacity={0.6}>
                      <Image src={emptyListGraphic} />
                    </Box>
                  </Center>
                )}
              </GridItem>
            </Grid>
          </Box>
        </Stack>
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
  )
}

export default BorrowMarkets
