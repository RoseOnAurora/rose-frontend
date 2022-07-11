import { AppDispatch, AppState } from "../state"
import {
  DashboardItems,
  FARMS_MAP,
  FARM_FILTER_FIELDS_TO_LABEL,
  FARM_SORT_FIELDS_TO_LABEL,
  Farm,
  FarmName,
  LP_TOKEN_MAP,
  UST_METAPOOL_FARM_NAME,
} from "../constants"
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  Skeleton,
  useColorModeValue,
  useDisclosure,
  useTimeout,
} from "@chakra-ui/react"
import {
  FaChartPie,
  FaFilter,
  FaGift,
  FaLayerGroup,
  FaReceipt,
  FaSortAmountUp,
} from "react-icons/fa"
import {
  FarmFilterFields,
  FarmSortFields,
  updateFarmFilterPreferences,
  updateFarmSortPreferences,
  updateFarmVisibleFieldPreferences,
} from "../state/user"
import React, { ReactElement, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { AnimatePresence } from "framer-motion"
import AnimatingNumber from "../components/AnimateNumber"
import { BigNumber } from "@ethersproject/bignumber"
import { BsSliders } from "react-icons/bs"
import Dashboard from "../components/Dashboard"
import { FarmStats } from "../utils/fetchFarmStats"
import FarmsOverview from "../components/FarmsOverview"
import { Link } from "react-router-dom"
import OverviewInfo from "../components/OverviewInfo"
import OverviewInputFieldsWrapper from "../components/wrappers/OverviewInputFieldsWrapper"
import OverviewSettingsContent from "../components/OverviewSettingsContent"
import OverviewWrapper from "../components/wrappers/OverviewWrapper"
import PageWrapper from "../components/wrappers/PageWrapper"
import StakeDetails from "../components/StakeDetails"
import { Zero } from "@ethersproject/constants"
import _ from "lodash"
import { commify } from "@ethersproject/units"
import { formatBNToString } from "../utils"
import { useFarmLPTokenBalances } from "../state/wallet/hooks"
import { useMultiCallEarnedRewards } from "../hooks/useMultiCallEarnedRewards"
import { useMultiCallFarmDeposits } from "../hooks/useMultiCallFarmDeposits"

function Farms(): ReactElement {
  const dispatch = useDispatch<AppDispatch>()

  const { farmPreferences } = useSelector((state: AppState) => state.user)
  const { farmStats } = useSelector((state: AppState) => state.application)

  const [sortDirection, setSortDirection] = useState(1)
  const [sortByField, setSortByField] = useState(farmPreferences.sortField)
  const [filterByField, setfilterByField] = useState(
    farmPreferences.filterField,
  )
  const [timeout, setTimout] = useState(false)
  const [isInfo, setIsInfo] = useState(false)

  const { isOpen, onOpen, onClose } = useDisclosure()
  useTimeout(() => setTimout(true), 5000)

  const onIconButtonClick = (isInfo: boolean): void => {
    onOpen()
    setIsInfo(isInfo)
  }
  const resetDashboardView = () => {
    onClose()
    setIsInfo(false)
  }

  const lpTokenBalances = useFarmLPTokenBalances()
  const farmDeposits = useMultiCallFarmDeposits()
  const allRewards = useMultiCallEarnedRewards()

  const allRewardsFormatted = useMemo(() => {
    return +formatBNToString(
      Object.values(allRewards || {})?.reduce((sum, balance) => {
        return sum.add(balance)
      }, Zero),
      18,
      5,
    )
  }, [allRewards])

  const lpTokenBalancesFormatted = useMemo(() => {
    return Object.entries(lpTokenBalances || {})
      ?.filter((balance) => {
        return balance[1].gt(Zero)
      })
      .map(([symbol, value]) => {
        return {
          tokenName: symbol,
          icon: LP_TOKEN_MAP[symbol].icon,
          amount: commify(formatBNToString(value, 18, 5)),
        }
      })
  }, [lpTokenBalances])

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

  const FILTER_FUNCTIONS: {
    [filterField in FarmFilterFields]: (a: Farm) => boolean
  } = {
    balance: (a: Farm) =>
      (lpTokenBalances?.[a.lpToken.symbol] || Zero).gt(Zero),
    deposit: (a: Farm) => farmDeposits?.[a.name]?.gt(Zero) || false,
    dual: (a: Farm) => (farmStats?.[a.name]?.dualReward.token ? true : false),
    noFilter: (a: Farm) => (a ? true : false),
  }

  const SORT_FUNCTIONS: {
    [sortField in FarmSortFields]: (a: Farm, b: Farm) => boolean
  } = {
    apr: (a: Farm, b: Farm) =>
      +(farmStats?.[a.name]?.apr.slice(0, -1) || 0) +
        +(farmStats?.[a.name]?.dualReward.apr?.slice(0, -1) || 0) >
      +(farmStats?.[b.name]?.apr.slice(0, -1) || 0) +
        +(farmStats?.[b.name]?.dualReward.apr?.slice(0, -1) || 0),
    name: (a: Farm, b: Farm) => a.name > b.name,
    tvl: (a: Farm, b: Farm) =>
      +(farmStats?.[a.name].tvl || 0) > +(farmStats?.[b.name].tvl || 0),
    rewards: (a: Farm, b: Farm) =>
      (allRewards?.[a.name] || Zero).gt(allRewards?.[b.name] || Zero),
    balance: (a: Farm, b: Farm) =>
      (lpTokenBalances?.[a.lpToken.symbol] || Zero).gt(
        lpTokenBalances?.[b.lpToken.symbol] || Zero,
      ),
    deposit: (a: Farm, b: Farm) =>
      (farmDeposits?.[a.name] || Zero).gt(farmDeposits?.[b.name] || Zero),
  }

  return (
    <PageWrapper maxW="1650px">
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
                infoType="Farm"
                sections={[
                  {
                    title: "How to Farm",
                    items: [
                      {
                        icon: FaChartPie,
                        text: "Add liquidity to one of our pools and receive LP tokens in exchange.",
                      },
                      {
                        icon: FaReceipt,
                        text: "Click on any of the farm cards to deposit your LP tokens and earn rewards!",
                      },
                      {
                        icon: FaGift,
                        text: "Withdraw your LP tokens and claim rewards at any time.",
                      },
                    ],
                  },
                  {
                    title: "Dashboard",
                    items: [
                      {
                        icon: FaLayerGroup,
                        text: "View your total rewards, LP token balances, & Farm Deposits across all farms all in one view!",
                      },
                    ],
                  },
                  {
                    title: "Preferences",
                    items: [
                      {
                        icon: FaSortAmountUp,
                        text: "Sort by any of the farm card fields like TVL, APR & Name.",
                      },
                      {
                        icon: FaFilter,
                        text: "Filter by your Farm Deposits, LP Token Balances and Farms with Dual Rewards.",
                      },
                      {
                        icon: BsSliders,
                        text: "Configure your preferences on this page like default sorting behavior. We will save this info for you and apply it each time you visit the page!",
                      },
                    ],
                  },
                  {
                    title: "Pools",
                    items: [
                      {
                        icon: FaChartPie,
                        text: (
                          <>
                            Most of our liquidity pools can be found by visiting
                            our{" "}
                            <Link
                              to="/pools"
                              style={{
                                textDecoration: "underline",
                                margin: 0,
                                fontWeight: "bold",
                              }}
                            >
                              pools page
                            </Link>
                            , but the{" "}
                            <a
                              href="https://dex.nearpad.io/add/0xdcD6D4e2B3e1D1E1E6Fa8C21C8A323DcbecfF970/0x885f8CF6E45bdd3fdcDc644efdcd0AC93880c781"
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                textDecoration: "underline",
                                margin: 0,
                                fontWeight: "bold",
                              }}
                            >
                              ROSE/PAD
                              <sup>↗</sup>
                            </a>{" "}
                            and{" "}
                            <a
                              href="https://dex.nearpad.io/add/0xdcD6D4e2B3e1D1E1E6Fa8C21C8A323DcbecfF970/0xDA2585430fEf327aD8ee44Af8F1f989a2A91A3d2"
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                textDecoration: "underline",
                                margin: 0,
                                fontWeight: "bold",
                              }}
                            >
                              ROSE/Frax
                              <sup>↗</sup>
                            </a>{" "}
                            pairs can be found on the Nearpad DEX.
                          </>
                        ),
                      },
                    ],
                  },
                ]}
              />
            ) : (
              <FarmsDashboard
                allRewardsFormatted={allRewardsFormatted}
                farmStats={farmStats}
                lpTokenBalancesFormatted={lpTokenBalancesFormatted}
                farmDepositsFormatted={farmDepositsFormatted}
                loading={
                  (_.isEmpty(lpTokenBalances) ||
                    _.isEmpty(farmDeposits) ||
                    _.isEmpty(allRewards)) &&
                  !timeout
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
            sortFieldLabelMap={FARM_SORT_FIELDS_TO_LABEL}
            filterByField={filterByField}
            filterFieldLabelMap={FARM_FILTER_FIELDS_TO_LABEL}
            handleSortDirection={setSortDirection}
            handleClearFilter={() =>
              setfilterByField(FarmFilterFields.NO_FILTER)
            }
            handleUpdateSortField={(e) =>
              setSortByField(e.target.value as FarmSortFields)
            }
            handleUpdateFilterField={(e) =>
              setfilterByField(e.target.value as FarmFilterFields)
            }
            onIconClick={onIconButtonClick}
            popOverContent={
              <OverviewSettingsContent
                sortFieldLabelMap={FARM_SORT_FIELDS_TO_LABEL}
                filterFieldLabelMap={FARM_FILTER_FIELDS_TO_LABEL}
                preferences={farmPreferences}
                updateVisibleFields={(e, field: string) =>
                  dispatch(
                    updateFarmVisibleFieldPreferences({
                      field: field as FarmSortFields,
                      value: +e.target.value * -1,
                    }),
                  )
                }
                updateFilterPreferences={(e) =>
                  dispatch(
                    updateFarmFilterPreferences(
                      e.target.value as FarmFilterFields,
                    ),
                  )
                }
                updateSortPreferences={(e) =>
                  dispatch(
                    updateFarmSortPreferences(e.target.value as FarmSortFields),
                  )
                }
              />
            }
          />
        }
        left={
          <AnimatePresence>
            {(farmStats &&
              Object.values(FARMS_MAP).every(
                (farm) =>
                  lpTokenBalances?.[farm.lpToken.symbol] &&
                  farmDeposits?.[farm.name] &&
                  allRewards?.[farm.name],
              )) ||
            timeout
              ? Object.values(FARMS_MAP)
                  .filter((farm) => FILTER_FUNCTIONS[filterByField](farm))
                  // hide UST farm
                  .filter((farm) => farm.name !== UST_METAPOOL_FARM_NAME)
                  .sort((a, b) => {
                    return SORT_FUNCTIONS[sortByField](a, b)
                      ? sortDirection * -1
                      : sortDirection
                  })
                  .map((farm) => (
                    <FarmsOverview
                      key={farm.name}
                      farmName={farm.name}
                      lpTokenIcon={farm.lpToken.icon}
                      farmRoute={farm.route}
                      balance={lpTokenBalances?.[farm.lpToken.symbol] || Zero}
                      deposited={farmDeposits?.[farm.name] || Zero}
                      tvl={farmStats?.[farm.name]?.tvl}
                      apr={{
                        roseApr: farmStats?.[farm.name]?.apr,
                        dualRewardApr: farmStats?.[farm.name]?.dualReward.apr,
                        dualRewardTokenName:
                          farmStats?.[farm.name]?.dualReward.token,
                      }}
                      rewards={{
                        rose: allRewards?.[farm.name] || Zero,
                        dual:
                          farm.name === UST_METAPOOL_FARM_NAME
                            ? allRewards?.["dualReward"] || Zero
                            : Zero,
                      }}
                    />
                  ))
              : Object.keys(_.omit(FARMS_MAP, UST_METAPOOL_FARM_NAME)).map(
                  (key) => (
                    <Skeleton key={key} height="100px" borderRadius="10px" />
                  ),
                )}
          </AnimatePresence>
        }
        right={
          <FarmsDashboard
            allRewardsFormatted={allRewardsFormatted}
            farmStats={farmStats}
            lpTokenBalancesFormatted={lpTokenBalancesFormatted}
            farmDepositsFormatted={farmDepositsFormatted}
            loading={
              (_.isEmpty(lpTokenBalances) ||
                _.isEmpty(farmDeposits) ||
                _.isEmpty(allRewards)) &&
              !timeout
            }
          />
        }
      />
    </PageWrapper>
  )
}

interface FarmDashboardProps {
  allRewardsFormatted: number
  farmStats: { [key: string]: FarmStats } | undefined
  lpTokenBalancesFormatted: DashboardItems[]
  farmDepositsFormatted: DashboardItems[]
  loading: boolean
}

const FarmsDashboard = ({
  allRewardsFormatted,
  farmStats,
  lpTokenBalancesFormatted,
  farmDepositsFormatted,
  loading,
}: FarmDashboardProps): ReactElement => {
  return (
    <Dashboard
      dashboardName="Farms"
      dashboardContent={
        <StakeDetails
          extraStakeDetailChild={
            <Flex justifyContent="space-between" alignItems="center">
              <FaGift color="#cc3a59" size="35px" title="Total Rewards" />
              <AnimatingNumber
                value={allRewardsFormatted}
                precision={allRewardsFormatted > 0 ? 3 : 1}
              />
            </Flex>
          }
          loading={loading}
          balanceView={{
            title: "LP Token Balances",
            items: lpTokenBalancesFormatted,
          }}
          stakedView={{
            title: "Farm Deposits",
            items: farmDepositsFormatted,
          }}
          stats={[
            {
              statLabel: "Total Farm TVL",
              statValue: `$${commify(
                formatBNToString(
                  Object.values(farmStats || {})
                    ?.map((stat) => {
                      return BigNumber.from(stat?.tvl || Zero)
                    })
                    .reduce((sum, tvl) => {
                      return sum.add(tvl)
                    }, Zero),
                  18,
                  2,
                ),
              )}`,
            },
          ]}
        />
      }
    />
  )
}

export default Farms
