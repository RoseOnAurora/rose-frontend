import { AppDispatch, AppState } from "../state"
import {
  BUSD_METAPOOL_NAME,
  DashboardItems,
  FARMS_MAP,
  FRAX_METAPOOL_NAME,
  FRAX_STABLES_LP_POOL_NAME,
  FarmName,
  MAI_METAPOOL_NAME,
  POOLS_MAP,
  POOL_FILTER_FIELDS_TO_LABEL,
  POOL_SORT_FIELDS_TO_LABEL,
  Pool,
  PoolName,
  // RUSD_METAPOOL_NAME,
  STABLECOIN_POOL_V2_NAME,
  UST_METAPOOL_NAME,
} from "../constants"
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  Skeleton,
  Text,
  useColorModeValue,
  useDisclosure,
  useTimeout,
} from "@chakra-ui/react"
import {
  FaChartPie,
  FaFilter,
  FaGift,
  FaInfoCircle,
  FaLayerGroup,
  FaReceipt,
  FaSortAmountUp,
} from "react-icons/fa"
import {
  PoolFilterFields,
  PoolSortFields,
  updatePoolFilterPreferences,
  updatePoolSortPreferences,
  updatePoolVisibleFieldPreferences,
} from "../state/user"
import React, { ReactElement, useMemo, useState } from "react"
import {
  calculatePctOfTotalShare,
  formatBNToPercentString,
  formatBNToString,
} from "../utils"
import { useDispatch, useSelector } from "react-redux"
import usePoolData, { PoolDataType, UserShareType } from "../hooks/usePoolData"
import { AnimatePresence } from "framer-motion"
import { BigNumber } from "@ethersproject/bignumber"
import { BsSliders } from "react-icons/bs"
import Dashboard from "../components/Dashboard"
import { Link } from "react-router-dom"
import OverviewInfo from "../components/OverviewInfo"
import OverviewInputFieldsWrapper from "../components/wrappers/OverviewInputFieldsWrapper"
import OverviewSettingsContent from "../components/OverviewSettingsContent"
import OverviewWrapper from "../components/wrappers/OverviewWrapper"
import PageWrapper from "../components/wrappers/PageWrapper"
import PoolOverview from "../components/PoolOverview"
import StakeDetails from "../components/StakeDetails"
import { Zero } from "@ethersproject/constants"
import { commify } from "@ethersproject/units"
import stablesPoolIcon from "../assets/icons/dai-usdt-usdc.png"
import { useMultiCallFarmDeposits } from "../hooks/useMultiCallFarmDeposits"

function Pools(): ReactElement | null {
  const dispatch = useDispatch<AppDispatch>()
  const { poolPreferences } = useSelector((state: AppState) => state.user)
  const farmDeposits = useMultiCallFarmDeposits()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [usdPoolV2Data, usdV2UserShareData] = usePoolData(
    STABLECOIN_POOL_V2_NAME,
  )
  const [fraxStablesPoolData, fraxStablesUserShareData] = usePoolData(
    FRAX_STABLES_LP_POOL_NAME,
  )
  const [fraxMetaPoolData, fraxMetaPoolUserShareData] = usePoolData(
    FRAX_METAPOOL_NAME,
  )
  const [ustMetaPoolData, ustMetaPoolUserShareData] = usePoolData(
    UST_METAPOOL_NAME,
  )
  const [busdMetaPoolData, busdMetaPoolUserShareData] = usePoolData(
    BUSD_METAPOOL_NAME,
  )
  const [maiMetaPoolData, maiMetaPoolUserShareData] = usePoolData(
    MAI_METAPOOL_NAME,
  )
  // const [rusdMetaPoolData, rusdMetaPoolUserShareData] = usePoolData(
  //   RUSD_METAPOOL_NAME,
  // )

  const [sortDirection, setSortDirection] = useState(1)
  const [sortByField, setSortByField] = useState(poolPreferences.sortField)
  const [filterByField, setfilterByField] = useState(
    poolPreferences.filterField,
  )
  const [timeout, setTimout] = useState(false)
  const [isInfo, setIsInfo] = useState(false)

  useTimeout(() => setTimout(true), 5000)

  const SORT_FUNCTIONS: {
    [sortField in PoolSortFields]: (a: Pool, b: Pool) => boolean
  } = {
    name: (a: Pool, b: Pool) =>
      a.name.localeCompare(b.name) > 0 ? true : false,
    tvl: (a: Pool, b: Pool) =>
      getPoolData(a.name).tvl.gt(getPoolData(b.name).tvl),
    farmDeposit: (a: Pool, b: Pool) =>
      (farmDeposits?.[a.farmName || ""] || Zero).gt(
        farmDeposits?.[b.farmName || ""] || Zero,
      ),
    balance: (a: Pool, b: Pool) =>
      getPoolData(a.name).balance.gt(getPoolData(b.name).balance),
    volume: (a: Pool, b: Pool) =>
      getPoolData(a.name).volume.gt(getPoolData(b.name).volume),
  }

  const FILTER_FUNCTIONS: {
    [sortField in PoolFilterFields]: (a: Pool) => boolean
  } = {
    farmDeposit: (a: Pool) =>
      (farmDeposits?.[a.farmName || ""] || Zero).gt(Zero),
    balance: (a: Pool) => getPoolData(a.name).balance.gt(Zero),
    noFilter: (a: Pool) => (a ? true : false),
  }

  const onIconButtonClick = (isInfo: boolean): void => {
    onOpen()
    setIsInfo(isInfo)
  }

  const resetDashboardView = () => {
    onClose()
    setIsInfo(false)
  }

  const allPoolData: PoolDataType[] = [
    usdPoolV2Data,
    fraxStablesPoolData,
    fraxMetaPoolData,
    ustMetaPoolData,
    busdMetaPoolData,
    // rusdMetaPoolData,
  ]

  const allUserShareData: (UserShareType | null)[] = [
    usdV2UserShareData,
    fraxStablesUserShareData,
    fraxMetaPoolUserShareData,
    ustMetaPoolUserShareData,
    busdMetaPoolUserShareData,
    // rusdMetaPoolUserShareData,
  ]

  const formattedLpTokenBalances = allUserShareData
    .filter((data) => {
      return data?.lpTokenBalance.gt(Zero)
    })
    .map((data) => {
      return {
        tokenName: POOLS_MAP[data?.name || ""]?.lpToken.symbol,
        icon: POOLS_MAP[data?.name || ""]?.lpToken.icon,
        amount: commify(formatBNToString(data?.lpTokenBalance || Zero, 18, 5)),
      }
    })

  const farmDepositsFormatted = useMemo(() => {
    return Object.entries(farmDeposits || {})
      ?.filter((balance) => {
        return balance[1].gt(Zero)
      })
      .map(([symbol, value]) => {
        return {
          tokenName: symbol,
          icon: FARMS_MAP[symbol as FarmName].lpToken.icon,
          amount: commify(formatBNToString(value, 18, 5)),
        }
      })
  }, [farmDeposits])

  const totalShare = calculatePctOfTotalShare(
    allUserShareData.reduce((sum, data) => {
      return sum.add(data?.lpTokenBalance || Zero)
    }, Zero),
    allPoolData.reduce((sum, data) => {
      return sum.add(data.totalLocked)
    }, Zero),
  )

  const total24HrVolume = allPoolData.reduce((sum, data) => {
    return sum.add(data?.volume || Zero)
  }, Zero)

  const totalTvl = allPoolData
    ?.map((data) => {
      return BigNumber.from(data.reserve || Zero)
    })
    .reduce((sum, tvl) => {
      return sum.add(tvl)
    }, Zero)

  function getPoolData(poolName: PoolName) {
    switch (poolName) {
      case FRAX_STABLES_LP_POOL_NAME:
        return {
          balance: fraxStablesUserShareData?.lpTokenBalance || Zero,
          tvl: fraxStablesPoolData?.reserve || Zero,
          volume: fraxStablesPoolData?.volume || Zero,
        }
      case FRAX_METAPOOL_NAME:
        return {
          balance: fraxMetaPoolUserShareData?.lpTokenBalance || Zero,
          tvl: fraxMetaPoolData?.reserve || Zero,
          volume: fraxMetaPoolData?.volume || Zero,
        }
      case UST_METAPOOL_NAME:
        return {
          balance: ustMetaPoolUserShareData?.lpTokenBalance || Zero,
          tvl: ustMetaPoolData?.reserve || Zero,
          volume: ustMetaPoolData?.volume || Zero,
        }
      case BUSD_METAPOOL_NAME:
        return {
          balance: busdMetaPoolUserShareData?.lpTokenBalance || Zero,
          tvl: busdMetaPoolData?.reserve || Zero,
          volume: busdMetaPoolData?.volume || Zero,
        }
      case MAI_METAPOOL_NAME:
        return {
          balance: maiMetaPoolUserShareData?.lpTokenBalance || Zero,
          tvl: maiMetaPoolData?.reserve || Zero,
          volume: maiMetaPoolData?.volume || Zero,
        }
      // case RUSD_METAPOOL_NAME:
      //   return {
      //     balance: rusdMetaPoolUserShareData?.lpTokenBalance || Zero,
      //     tvl: rusdMetaPoolData?.reserve || Zero,
      //     volume: rusdMetaPoolData?.volume || Zero,
      //   }
      default:
        return {
          balance: usdV2UserShareData?.lpTokenBalance || Zero,
          tvl: usdPoolV2Data?.reserve || Zero,
          volume: usdPoolV2Data?.volume || Zero,
        }
    }
  }
  return (
    <PageWrapper activeTab="pools" maxW="1550px">
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
                infoType="Pool"
                sections={[
                  {
                    title: "How to provide liquidity",
                    items: [
                      {
                        icon: FaChartPie,
                        text:
                          "Add liquidity to one of our pools by clicking on one of the pool cards. Currently, we support StablePools and MetaPools.",
                      },
                      {
                        icon: FaReceipt,
                        text:
                          "Deposit one or more of the tokens that the pool accepts. For example, the Stables Pool accepts DAI, USDT, & USDC as liquidity.",
                      },
                      {
                        icon: FaGift,
                        text:
                          "You will earn trading fees proportional to your share of the pool, and can be claimed by withdrawing your liquidity.",
                      },
                    ],
                  },
                  {
                    title: "Dashboard",
                    items: [
                      {
                        icon: FaLayerGroup,
                        text:
                          "View your total share, LP token balances, & Farm Deposits across all pools all in one view!",
                      },
                      {
                        icon: FaInfoCircle,
                        text:
                          "Note that your pool deposit is represented by your current LP token balance. Farm deposits represent the LP tokens you have deposited on the pool's farm.",
                      },
                    ],
                  },
                  {
                    title: "Preferences",
                    items: [
                      {
                        icon: FaSortAmountUp,
                        text:
                          " Sort by any of the pool card fields like TVL, Volume, & Name.",
                      },
                      {
                        icon: FaFilter,
                        text:
                          "Filter by your LP Token Balances and pool deposits that you are farming.",
                      },
                      {
                        icon: BsSliders,
                        text:
                          "Configure your preferences on this page like default sorting behavior. We will save this info for you and apply it each time you visit the page!",
                      },
                    ],
                  },
                  {
                    title: "Farming",
                    items: [
                      {
                        icon: FaChartPie,
                        text:
                          "When you add liquidity, you will receive LP tokens in exchange. With these LP tokens, you can then deposit them into the pool's corresponding farm.",
                      },
                      {
                        icon: FaGift,
                        text:
                          "For example, after depositing liquidity into the Stables Pool, you can take those LP tokens and deposit them into the Stables Farm. By doing so, you can earn rewards in ROSE!",
                      },
                      {
                        icon: FaGift,
                        text: (
                          <>
                            All farms can be found on our{" "}
                            <Link
                              to="/farms"
                              style={{
                                textDecoration: "underline",
                                margin: 0,
                                fontWeight: "bold",
                              }}
                            >
                              farms page
                            </Link>
                            .
                          </>
                        ),
                      },
                    ],
                  },
                  {
                    title: "MetaPools",
                    items: [
                      {
                        icon: FaChartPie,
                        text:
                          "Metapools contain one token to trade with another underlying Base pool. Adding the single asset to the metapool does not dilute the liquidity of the underlying base pool.",
                      },
                    ],
                  },
                ]}
              />
            ) : (
              <PoolDashboard
                totalShare={totalShare}
                formattedBalances={formattedLpTokenBalances}
                formattedDeposits={farmDepositsFormatted}
                totalTvl={totalTvl}
                total24hVolume={total24HrVolume}
                loading={
                  allUserShareData.some((item) => item === null) && !timeout
                }
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
            sortFieldLabelMap={POOL_SORT_FIELDS_TO_LABEL}
            filterByField={filterByField}
            filterFieldLabelMap={POOL_FILTER_FIELDS_TO_LABEL}
            handleSortDirection={setSortDirection}
            handleClearFilter={() =>
              setfilterByField(PoolFilterFields.NO_FILTER)
            }
            handleUpdateSortField={(e) =>
              setSortByField(e.target.value as PoolSortFields)
            }
            handleUpdateFilterField={(e) =>
              setfilterByField(e.target.value as PoolFilterFields)
            }
            popOverContent={
              <OverviewSettingsContent
                sortFieldLabelMap={POOL_SORT_FIELDS_TO_LABEL}
                filterFieldLabelMap={POOL_FILTER_FIELDS_TO_LABEL}
                preferences={poolPreferences}
                updateVisibleFields={(e, field: string) =>
                  dispatch(
                    updatePoolVisibleFieldPreferences({
                      field: field as PoolSortFields,
                      value: +e.target.value * -1,
                    }),
                  )
                }
                updateFilterPreferences={(e) =>
                  dispatch(
                    updatePoolFilterPreferences(
                      e.target.value as PoolFilterFields,
                    ),
                  )
                }
                updateSortPreferences={(e) =>
                  dispatch(
                    updatePoolSortPreferences(e.target.value as PoolSortFields),
                  )
                }
              />
            }
            onIconClick={onIconButtonClick}
          />
        }
        left={
          <AnimatePresence>
            {allUserShareData.every((item) => item !== null) || timeout
              ? Object.values(POOLS_MAP)
                  // temporarily hide Frax pool while keeping its page enabled
                  .filter(({ name }) => name !== FRAX_STABLES_LP_POOL_NAME)
                  .filter((pool) => FILTER_FUNCTIONS[filterByField](pool))
                  .sort((a, b) =>
                    SORT_FUNCTIONS[sortByField](a, b)
                      ? sortDirection * -1
                      : sortDirection,
                  )
                  .map((pool) => (
                    <PoolOverview
                      key={pool.name}
                      poolName={pool.name}
                      poolRoute={pool.route}
                      poolIcon={
                        pool.name === STABLECOIN_POOL_V2_NAME
                          ? stablesPoolIcon
                          : pool.lpToken.icon
                      }
                      farmDeposit={farmDeposits?.[pool.farmName || ""] || Zero}
                      {...getPoolData(pool.name)}
                    />
                  ))
              : Object.keys(POOLS_MAP).map((key) => (
                  <Skeleton key={key} height="100px" borderRadius="10px" />
                ))}
          </AnimatePresence>
        }
        right={
          <PoolDashboard
            totalShare={totalShare}
            formattedBalances={formattedLpTokenBalances}
            formattedDeposits={farmDepositsFormatted}
            totalTvl={totalTvl}
            total24hVolume={total24HrVolume}
            loading={allUserShareData.some((item) => item === null) && !timeout}
          />
        }
      />
    </PageWrapper>
  )
}

interface PoolDashboardProps {
  totalShare: BigNumber
  formattedBalances: DashboardItems[]
  formattedDeposits: DashboardItems[]
  totalTvl: BigNumber
  total24hVolume: BigNumber
  loading: boolean
}

const PoolDashboard = ({
  totalShare,
  formattedBalances,
  formattedDeposits,
  totalTvl,
  total24hVolume,
  loading,
}: PoolDashboardProps): ReactElement => {
  return (
    <Dashboard
      dashboardName="Pools"
      dashboardContent={
        <StakeDetails
          extraStakeDetailChild={
            <Flex justifyContent="space-between" alignItems="center">
              <FaChartPie
                color="#cc3a59"
                size="35px"
                title="Total Share of Pools"
              />
              <Text
                as="span"
                fontSize={{ base: "24px", lg: "30px" }}
                fontWeight="700"
              >
                {formatBNToPercentString(totalShare, 18, 5)}
              </Text>
            </Flex>
          }
          loading={loading}
          balanceView={{
            title: "LP Token Balances",
            items: formattedBalances,
          }}
          stakedView={{
            title: "Farm Deposits",
            items: formattedDeposits,
          }}
          stats={[
            {
              statLabel: "Total Pool TVL",
              statValue: `$${commify(formatBNToString(totalTvl, 18, 2))}`,
            },
            {
              statLabel: "Total 24h Volume",
              statValue: `$${commify(formatBNToString(total24hVolume, 18, 2))}`,
            },
          ]}
        />
      }
    />
  )
}

export default Pools
