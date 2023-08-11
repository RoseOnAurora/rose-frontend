import { AppDispatch, AppState } from "../state"
import {
  BUSD_METAPOOL_NAME,
  ChainId,
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
  ROSE_FRAX_NLP_FARM_NAME,
  ROSE_PAD_NLP_FARM_NAME,
  RUSD_METAPOOL_NAME,
  STABLECOIN_POOL_V2_NAME,
  UST_METAPOOL_FARM_NAME,
  UST_METAPOOL_NAME,
} from "../constants"
import {
  Box,
  Center,
  Collapse,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  Grid,
  GridItem,
  Heading,
  IconButton,
  Image,
  Skeleton,
  Stack,
  Text,
  VStack,
  useDisclosure,
  useTimeout,
} from "@chakra-ui/react"
import {
  BsChevronDown,
  BsChevronExpand,
  BsChevronUp,
  BsSliders,
} from "react-icons/bs"
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
import React, { ReactElement, useCallback, useMemo, useState } from "react"
import {
  calculatePctOfTotalShare,
  formatBNToPercentString,
  formatBNToString,
  isAddress,
} from "../utils"
import { useDispatch, useSelector } from "react-redux"
import usePoolData, { PoolDataType, UserShareType } from "../hooks/usePoolData"
import { AnimatePresence } from "framer-motion"
import AnimatingNumber from "../components/AnimateNumber"
import { BigNumber } from "@ethersproject/bignumber"
import Farm from "../components/Farm"
import { FarmStats } from "../utils/fetchFarmStats"
import OverviewInfo from "../components/OverviewInfo"
import OverviewInputFieldsWrapper from "../components/wrappers/OverviewInputFieldsWrapper"
import OverviewSettingsContent from "../components/OverviewSettingsContent"
import OverviewWrapper from "../components/wrappers/OverviewWrapper"
import PageWrapper from "../components/wrappers/PageWrapper"
import PoolOverview from "../components/PoolOverview"
import StakeDetails from "../components/stake/StakeDetails"
import { Zero } from "@ethersproject/constants"
import chartGraph from "../assets/chart-graph.svg"
import { commify } from "@ethersproject/units"
import emptyPools from "../assets/holo-rose-pink-circle.png"
import rewardsGift from "../assets/rewards-gift.svg"
import roseFraxIcon from "../assets/icons/rose-frax.svg"
import rosePadIcon from "../assets/icons/rose-pad.svg"
import stablesPoolIcon from "../assets/icons/dai-usdt-usdc.svg"
import { useMultiCallEarnedRewards } from "../hooks/useMultiCallEarnedRewards"
import { useMultiCallFarmDeposits } from "../hooks/useMultiCallFarmDeposits"
import { useWeb3React } from "@web3-react/core"

function Pools(): ReactElement | null {
  // hooks
  const dispatch = useDispatch<AppDispatch>()
  const { poolPreferences } = useSelector((state: AppState) => state.user)
  const { farmStats } = useSelector((state: AppState) => state.application)
  const farmDeposits = useMultiCallFarmDeposits()
  const allRewards = useMultiCallEarnedRewards()
  const { chainId } = useWeb3React()
  const [loading, setLoading] = useState(true)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [usdPoolV2Data, usdV2UserShareData] = usePoolData(
    STABLECOIN_POOL_V2_NAME,
  )
  const [fraxStablesPoolData, fraxStablesUserShareData] = usePoolData(
    FRAX_STABLES_LP_POOL_NAME,
  )
  const [fraxMetaPoolData, fraxMetaPoolUserShareData] =
    usePoolData(FRAX_METAPOOL_NAME)
  const [ustMetaPoolData, ustMetaPoolUserShareData] =
    usePoolData(UST_METAPOOL_NAME)
  const [busdMetaPoolData, busdMetaPoolUserShareData] =
    usePoolData(BUSD_METAPOOL_NAME)
  const [maiMetaPoolData, maiMetaPoolUserShareData] =
    usePoolData(MAI_METAPOOL_NAME)
  const [rusdMetaPoolData, rusdMetaPoolUserShareData] =
    usePoolData(RUSD_METAPOOL_NAME)

  useTimeout(() => setLoading(false), 1000)

  // handlers
  const getPoolData = useCallback(
    (poolName: PoolName) => {
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
        case RUSD_METAPOOL_NAME:
          return {
            balance: rusdMetaPoolUserShareData?.lpTokenBalance || Zero,
            tvl: rusdMetaPoolData?.reserve || Zero,
            volume: rusdMetaPoolData?.volume || Zero,
          }
        default:
          return {
            balance: usdV2UserShareData?.lpTokenBalance || Zero,
            tvl: usdPoolV2Data?.reserve || Zero,
            volume: usdPoolV2Data?.volume || Zero,
          }
      }
    },
    [
      fraxStablesUserShareData,
      fraxStablesPoolData,
      fraxMetaPoolUserShareData,
      fraxMetaPoolData,
      ustMetaPoolUserShareData,
      ustMetaPoolData,
      busdMetaPoolUserShareData,
      busdMetaPoolData,
      maiMetaPoolUserShareData,
      maiMetaPoolData,
      rusdMetaPoolUserShareData,
      rusdMetaPoolData,
      usdV2UserShareData,
      usdPoolV2Data,
    ],
  )

  const onIconButtonClick = useCallback(
    (isInfo: boolean): void => {
      onOpen()
      setIsInfo(isInfo)
    },
    [onOpen],
  )

  const resetDashboardView = useCallback(() => {
    onClose()
    setIsInfo(false)
  }, [onClose])

  // state
  const [sortDirection, setSortDirection] = useState(1)
  const [sortByField, setSortByField] = useState(poolPreferences.sortField)
  const [filterByField, setfilterByField] = useState(
    poolPreferences.filterField,
  )
  const [isInfo, setIsInfo] = useState(false)
  const [searchText, setSearchText] = useState<string>("")

  const allPoolData: PoolDataType[] = useMemo(
    () =>
      [
        usdPoolV2Data,
        fraxStablesPoolData,
        fraxMetaPoolData,
        ustMetaPoolData,
        busdMetaPoolData,
        rusdMetaPoolData,
      ].filter((data) => !!POOLS_MAP[data.name].addresses[chainId as ChainId]),
    [
      usdPoolV2Data,
      fraxStablesPoolData,
      fraxMetaPoolData,
      ustMetaPoolData,
      busdMetaPoolData,
      rusdMetaPoolData,
      chainId,
    ],
  )

  const allUserShareData: (UserShareType | null)[] = useMemo(
    () =>
      [
        usdV2UserShareData,
        fraxStablesUserShareData,
        fraxMetaPoolUserShareData,
        ustMetaPoolUserShareData,
        busdMetaPoolUserShareData,
        rusdMetaPoolUserShareData,
      ].filter(
        (userShare) =>
          !!POOLS_MAP[userShare.name!].addresses[chainId as ChainId], // eslint-disable-line @typescript-eslint/no-non-null-assertion
      ),
    [
      usdV2UserShareData,
      fraxStablesUserShareData,
      fraxMetaPoolUserShareData,
      ustMetaPoolUserShareData,
      busdMetaPoolUserShareData,
      rusdMetaPoolUserShareData,
      chainId,
    ],
  )

  const formattedLpTokenBalances = useMemo(
    () =>
      allUserShareData
        .filter((data) => {
          return data?.lpTokenBalance.gt(Zero)
        })
        .map((data) => {
          return {
            tokenName: POOLS_MAP[data?.name || ""]?.lpToken.symbol,
            icon: POOLS_MAP[data?.name || ""]?.lpToken.icon,
            amount: commify(
              formatBNToString(data?.lpTokenBalance || Zero, 18, 5),
            ),
          }
        }),
    [allUserShareData],
  )

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

  const totalShare = useMemo(
    () =>
      calculatePctOfTotalShare(
        allUserShareData.reduce((sum, data) => {
          return sum.add(data?.lpTokenBalance || Zero)
        }, Zero),
        allPoolData.reduce((sum, data) => {
          return sum.add(data.totalLocked)
        }, Zero),
      ),
    [allPoolData, allUserShareData],
  )

  const allRewardsFormatted = useMemo(() => {
    return +formatBNToString(
      Object.values(allRewards || {})?.reduce((sum, balance) => {
        return sum.add(balance)
      }, Zero),
      18,
      5,
    )
  }, [allRewards])

  const total24HrVolume = useMemo(
    () =>
      allPoolData.reduce((sum, data) => {
        return sum.add(data?.volume || Zero)
      }, Zero),
    [allPoolData],
  )

  const totalTvl = useMemo(
    () =>
      allPoolData
        ?.map((data) => {
          return BigNumber.from(data.reserve || Zero)
        })
        .reduce((sum, tvl) => {
          return sum.add(tvl)
        }, Zero),
    [allPoolData],
  )

  // pool fields
  const fields: PoolSortFields[] = useMemo(
    () =>
      Object.values(PoolSortFields)
        .filter((field) => {
          return poolPreferences.visibleFields[field] > 0
        })
        .map((field) => {
          return field
        }),
    [poolPreferences],
  )

  const SORT_FUNCTIONS: {
    [sortField in PoolSortFields]: (a: Pool, b: Pool) => boolean
  } = useMemo(
    () => ({
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
      farmTvl: (a: Pool, b: Pool) =>
        +(farmStats?.[a.farmName || ""]?.tvl || 0) >
        +(farmStats?.[b.farmName || ""]?.tvl || 0),
      rewards: (a: Pool, b: Pool) =>
        (allRewards?.[a.farmName || ""] || Zero).gt(
          allRewards?.[b.farmName || ""] || Zero,
        ),
      apr: (a: Pool, b: Pool) =>
        +(farmStats?.[a.farmName || ""]?.apr.slice(0, -1) || 0) +
          +(farmStats?.[a.farmName || ""]?.dualReward.apr?.slice(0, -1) || 0) >
        +(farmStats?.[b.farmName || ""]?.apr.slice(0, -1) || 0) +
          +(farmStats?.[b.farmName || ""]?.dualReward.apr?.slice(0, -1) || 0),
    }),
    [farmDeposits, farmStats, allRewards, getPoolData],
  )

  const FILTER_FUNCTIONS: {
    [sortField in PoolFilterFields]: (a: Pool) => boolean
  } = useMemo(
    () => ({
      farmDeposit: (a: Pool) =>
        (farmDeposits?.[a.farmName || ""] || Zero).gt(Zero),
      balance: (a: Pool) => getPoolData(a.name).balance.gt(Zero),
      noFilter: (a: Pool) => a === a,
    }),
    [farmDeposits, getPoolData],
  )

  const pools = useMemo(
    () =>
      Object.values(POOLS_MAP)
        // temporarily hide outdated Frax pool while keeping its page enabled
        .filter(
          ({ name, addresses }) =>
            name !== FRAX_STABLES_LP_POOL_NAME &&
            !!addresses[chainId as ChainId], // only show pools with addresses defined
        )
        .filter((pool) => FILTER_FUNCTIONS[filterByField](pool))
        .filter(({ name, addresses }) => {
          const target = searchText.toLowerCase()
          if (isAddress(target) && chainId) {
            return addresses[chainId as ChainId].toLowerCase() === target
          }
          return name.toLowerCase().includes(target)
        })
        .sort((a, b) =>
          SORT_FUNCTIONS[sortByField](a, b)
            ? sortDirection * -1
            : sortDirection,
        ),
    [
      FILTER_FUNCTIONS,
      SORT_FUNCTIONS,
      chainId,
      filterByField,
      searchText,
      sortByField,
      sortDirection,
    ],
  )

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
                infoType="Pool"
                sections={[
                  {
                    title: "How to provide liquidity",
                    items: [
                      {
                        icon: FaChartPie,
                        text: "Add liquidity to one of our pools by clicking on one of the pool cards. Currently, we support StablePools and MetaPools.",
                      },
                      {
                        icon: FaReceipt,
                        text: "Deposit one or more of the tokens that the pool accepts. For example, the Stables Pool accepts DAI, USDT, & USDC as liquidity.",
                      },
                      {
                        icon: FaGift,
                        text: "You will earn trading fees proportional to your share of the pool, and can be claimed by withdrawing your liquidity.",
                      },
                    ],
                  },
                  {
                    title: "Dashboard",
                    items: [
                      {
                        icon: FaLayerGroup,
                        text: "View your total share, LP token balances, & Farm Deposits across all pools all in one view!",
                      },
                      {
                        icon: FaInfoCircle,
                        text: "Note that your pool deposit is represented by your current LP token balance. Farm deposits represent the LP tokens you have deposited on the pool's farm.",
                      },
                    ],
                  },
                  {
                    title: "Preferences",
                    items: [
                      {
                        icon: FaSortAmountUp,
                        text: " Sort by any of the pool card fields like TVL, Volume, & Name.",
                      },
                      {
                        icon: FaFilter,
                        text: "Filter by your LP Token Balances and pool deposits that you are farming.",
                      },
                      {
                        icon: BsSliders,
                        text: "Configure your preferences on this page like default sorting behavior. We will save this info for you and apply it each time you visit the page!",
                      },
                    ],
                  },
                  {
                    title: "Farming",
                    items: [
                      {
                        icon: FaChartPie,
                        text: "When you add liquidity, you will receive LP tokens in exchange. With these LP tokens, you can then deposit them into the pool's corresponding farm.",
                      },
                      {
                        icon: FaGift,
                        text: "For example, after depositing liquidity into the Stables Pool, you can take those LP tokens and deposit them into the Stables Farm. By doing so, you can earn rewards in ROSE!",
                      },
                      {
                        icon: FaGift,
                        text: "All farms can be found in each of their corresponding pool pages with the exception of the ROSE/PAD PLP & ROSE/FRAX PLP farms. Those can be found on this page under the external farms section.",
                      },
                    ],
                  },
                  {
                    title: "MetaPools",
                    items: [
                      {
                        icon: FaChartPie,
                        text: "Metapools contain one token to trade with another underlying Base pool. Adding the single asset to the metapool does not dilute the liquidity of the underlying base pool.",
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
                loading={loading}
                allRewards={allRewardsFormatted}
                farmStats={farmStats}
              />
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      <OverviewWrapper
        templateColumns="33% 65%"
        left={
          <PoolDashboard
            totalShare={totalShare}
            formattedBalances={formattedLpTokenBalances}
            formattedDeposits={farmDepositsFormatted}
            totalTvl={totalTvl}
            total24hVolume={total24HrVolume}
            loading={loading}
            allRewards={allRewardsFormatted}
            farmStats={farmStats}
          />
        }
        right={
          <Stack spacing="15px">
            <Stack spacing="50px">
              <OverviewInputFieldsWrapper
                title="Pools"
                sortDirection={sortDirection}
                sortByField={sortByField}
                sortFieldLabelMap={POOL_SORT_FIELDS_TO_LABEL}
                filterByField={filterByField}
                filterFieldLabelMap={POOL_FILTER_FIELDS_TO_LABEL}
                handleSortDirection={setSortDirection}
                handleClearFilter={() => {
                  setfilterByField(PoolFilterFields.NO_FILTER)
                  setSearchText("")
                }}
                handleUpdateSortField={(e) =>
                  setSortByField(e.target.value as PoolSortFields)
                }
                handleUpdateFilterField={(e) =>
                  setfilterByField(e.target.value as PoolFilterFields)
                }
                onUpdateFilterText={setSearchText}
                searchText={searchText}
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
                        updatePoolSortPreferences(
                          e.target.value as PoolSortFields,
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
                        {POOL_SORT_FIELDS_TO_LABEL[field]}
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
            <Stack
              spacing={6}
              maxH="600px"
              overflowY={pools.length ? "auto" : "hidden"}
              overflowX="hidden"
            >
              <AnimatePresence initial={false}>
                {pools.map((pool) => (
                  <Skeleton
                    key={pool.name}
                    borderRadius="10px"
                    fadeDuration={1}
                    isLoaded={!loading}
                  >
                    <PoolOverview
                      poolName={pool.name}
                      poolRoute={pool.route}
                      poolIcon={
                        pool.name === STABLECOIN_POOL_V2_NAME
                          ? stablesPoolIcon
                          : pool.lpToken.icon
                      }
                      farmDeposit={farmDeposits?.[pool.farmName || ""] || Zero}
                      farmTvl={farmStats?.[pool.farmName || ""]?.tvl}
                      apr={{
                        roseApr: farmStats?.[pool.farmName || ""]?.apr,
                        dualRewardApr:
                          farmStats?.[pool.farmName || ""]?.dualReward.apr,
                        dualRewardTokenName:
                          farmStats?.[pool.farmName || ""]?.dualReward.token,
                      }}
                      rewards={{
                        rose: allRewards?.[pool.farmName || ""] || Zero,
                        dual:
                          pool.farmName === UST_METAPOOL_FARM_NAME
                            ? allRewards?.["dualReward"] || Zero
                            : Zero,
                      }}
                      {...getPoolData(pool.name)}
                    />
                  </Skeleton>
                ))}
                {!pools.length && (
                  <VStack spacing="50px" alignItems="center" mt="10px">
                    <Heading
                      fontWeight={400}
                      color="gray.100"
                      fontSize="25px"
                      whiteSpace="nowrap"
                    >
                      Switch chains to view pools.
                    </Heading>
                    <Center h={{ base: "400px", md: "500px" }} pos="relative">
                      <Box
                        left={{ base: "-210px", md: "-250px" }}
                        top="-100px"
                        w={{ base: "400px", md: "500px" }}
                        pos="absolute"
                      >
                        <Image
                          src={emptyPools}
                          objectFit="cover"
                          opacity={0.6}
                        />
                      </Box>
                    </Center>
                  </VStack>
                )}
              </AnimatePresence>
            </Stack>
          </Stack>
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
  allRewards: number
  farmStats: { [key: string]: FarmStats } | undefined
}

const PoolDashboard = ({
  totalShare,
  formattedBalances,
  formattedDeposits,
  totalTvl,
  total24hVolume,
  loading,
  allRewards,
  farmStats,
}: PoolDashboardProps): ReactElement => {
  const [externalFarm, setExternalFarm] = useState<"PAD" | "FRAX">("PAD")
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
          <Stack spacing={4} direction={{ base: "column", md: "row" }}>
            <Box
              bg="bgDark"
              borderRadius="8px"
              py="15px"
              px="20px"
              w="full"
              h="115px"
            >
              <Stack pt={{ base: "5px", md: 0 }}>
                <Text
                  fontWeight={700}
                  fontSize={{ base: "12px", md: "15px" }}
                  color="gray.200"
                  lineHeight="19px"
                  textAlign="left"
                >
                  Total Pool Share
                </Text>
                <Flex gap="10px" alignItems="center">
                  <FaChartPie color="#EF4444" fontSize="25px" />
                  <Text
                    as="span"
                    fontSize={{ base: "21px", lg: "24px" }}
                    fontWeight={700}
                  >
                    {formatBNToPercentString(totalShare, 18, 2)}
                  </Text>
                </Flex>
              </Stack>
            </Box>
            <Box
              bg="bgDark"
              borderRadius="8px"
              py="15px"
              px="20px"
              w="full"
              h="115px"
            >
              <Stack pt={{ base: "5px", md: 0 }}>
                <Text
                  fontWeight={700}
                  fontSize={{ base: "12px", md: "15px" }}
                  color="gray.200"
                  lineHeight="19px"
                  textAlign="left"
                >
                  Total Rewards
                </Text>
                <Flex gap="10px" alignItems="center">
                  <Box boxSize="25px">
                    <Image src={rewardsGift} objectFit="cover" w="full" />
                  </Box>
                  <AnimatingNumber
                    value={allRewards}
                    precision={allRewards > 0 ? 2 : 1}
                  />
                </Flex>
              </Stack>
            </Box>
          </Stack>
        </Stack>
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
      bottom={
        <Stack spacing={2} h="250px">
          <Flex alignItems="center" justifyContent="space-between">
            <Text
              fontSize={{ base: "18px", md: "25px" }}
              fontWeight={700}
              lineHeight="30px"
            >
              External Farms
            </Text>
            <Flex alignItems="center" gap={3}>
              <IconButton
                aria-label="ROSE/PAD PLP Farm"
                icon={
                  <Box width={{ base: "35px", md: "45px" }}>
                    <Image src={rosePadIcon} objectFit="cover" w="100%" />
                  </Box>
                }
                p={3}
                variant="outline"
                borderRadius="md"
                size="lg"
                title="ROSE/PAD PLP Farm"
                onClick={() => setExternalFarm("PAD")}
              />
              <IconButton
                aria-label="ROSE/FRAX PLP Farm"
                icon={
                  <Box width={{ base: "35px", md: "45px" }}>
                    <Image src={roseFraxIcon} objectFit="cover" w="100%" />
                  </Box>
                }
                p={3}
                variant="outline"
                borderRadius="md"
                size="lg"
                title="ROSE/FRAX PLP Farm"
                onClick={() => setExternalFarm("FRAX")}
              />
            </Flex>
          </Flex>
          <Collapse in={externalFarm === "PAD"} animateOpacity>
            <Farm
              farmName={ROSE_PAD_NLP_FARM_NAME}
              farmDescription="ROSE/PAD PLP"
            />
          </Collapse>
          <Collapse in={externalFarm === "FRAX"} animateOpacity>
            <Farm
              farmName={ROSE_FRAX_NLP_FARM_NAME}
              farmDescription="ROSE/FRAX PLP"
            />
          </Collapse>
        </Stack>
      }
    />
  )
}

export default Pools
