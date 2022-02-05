import { AppDispatch, AppState } from "../state"
import {
  Box,
  Collapse,
  Container,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  Grid,
  GridItem,
  HStack,
  IconButton,
  List,
  ListIcon,
  ListItem,
  Radio,
  RadioGroup,
  Select,
  Skeleton,
  Stack,
  Switch,
  Text,
  useColorModeValue,
  useDisclosure,
  useTimeout,
} from "@chakra-ui/react"
import { BsChevronExpand, BsSliders } from "react-icons/bs"
import {
  FARMS_MAP,
  Farm,
  FarmName,
  LP_TOKEN_MAP,
  UST_METAPOOL_FARM_NAME,
} from "../constants"
import {
  FaChartPie,
  FaFilter,
  FaGift,
  FaInfoCircle,
  FaLayerGroup,
  FaReceipt,
  FaSortAmountDownAlt,
  FaSortAmountUp,
  FaUndo,
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
import Dashboard from "../components/Dashboard"
import FarmsOverview from "../components/FarmsOverview"
import { IconButtonPopover } from "../components/Popover"
import { Link } from "react-router-dom"
import StakeDetails from "../components/StakeDetails"
import TopMenu from "../components/TopMenu"
import { Zero } from "@ethersproject/constants"
import _ from "lodash"
import { commify } from "@ethersproject/units"
import { formatBNToString } from "../utils"
import { useFarmLPTokenBalances } from "../state/wallet/hooks"
import { useMultiCallEarnedRewards } from "../hooks/useMultiCallEarnedRewards"
import { useMultiCallFarmDeposits } from "../hooks/useMultiCallFarmDeposits"

export const SORT_FIELDS_TO_LABEL: { [sortField in FarmSortFields]: string } = {
  apr: "APR",
  name: "Name",
  tvl: "TVL",
  rewards: "Rewards",
  deposit: "Deposited",
  balance: "Balance",
}

const FILTER_FIELDS_TO_LABEL: { [filterField in FarmFilterFields]: string } = {
  noFilter: "No Filter",
  dual: "Dual Rewards",
  deposit: "Deposited",
  balance: "Balance",
}

function Farms(): ReactElement {
  const dispatch = useDispatch<AppDispatch>()

  const { farmPreferences } = useSelector((state: AppState) => state.user)
  const { farmStats } = useSelector((state: AppState) => state.application)

  const [sortDirection, setSortDirection] = useState(1)
  const [sortByField, setSortByField] = useState(farmPreferences.sortField)
  const [filterByField, setfilterByField] = useState(
    farmPreferences.filterField,
  )
  const [howToOpen, setHowToOpen] = useState(1)
  const [dashboardHelp, setDashboardHelp] = useState(-1)
  const [preferencesHelp, setPreferencesHelp] = useState(-1)
  const [poolsHelp, setPoolsHelp] = useState(-1)
  const [timeout, setTimout] = useState(false)

  const { isOpen, onOpen, onClose } = useDisclosure()
  useTimeout(() => setTimout(true), 10000)

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
    <>
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="sm">
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
            <Dashboard
              dashboardName="Farms"
              dashboardContent={
                <StakeDetails
                  extraStakeDetailChild={
                    <Flex justifyContent="space-between" alignItems="center">
                      <FaGift
                        color="#cc3a59"
                        size="35px"
                        title="Total ROSE Rewards"
                      />
                      <AnimatingNumber
                        value={allRewardsFormatted}
                        precision={allRewardsFormatted > 0 ? 3 : 1}
                      />
                    </Flex>
                  }
                  loading={
                    (_.isEmpty(lpTokenBalances) ||
                      _.isEmpty(farmDeposits) ||
                      _.isEmpty(allRewards)) &&
                    !timeout
                  }
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
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      <Box
        minH="100vh"
        bg="var(--background-main)"
        color="var(--text)"
        fontSize="16px"
        pb="300px"
      >
        <TopMenu activeTab="farms" />
        <Container
          maxW="1550px"
          mt="40px"
          paddingInlineStart={"0.5em"}
          paddingInlineEnd={"0.5em"}
        >
          <Grid
            templateColumns={{ base: "100%", lg: "63% 34%" }}
            templateRows="auto"
            columnGap={{ base: "0", lg: "30px" }}
            rowGap="20px"
          >
            <GridItem rowSpan={{ base: 2, lg: 1 }} colSpan={1}>
              <Flex
                gridGap="15px"
                justifyContent="space-between"
                alignItems={{ base: "baseline", lg: "center" }}
              >
                <Stack
                  spacing={{ base: "10px", lg: "15px" }}
                  direction={{ base: "column", lg: "row" }}
                >
                  <HStack spacing="5px">
                    <Box
                      bgColor={useColorModeValue(
                        "whiteAlpha.600",
                        "blackAlpha.900",
                      )}
                      borderRadius="10px"
                      p="10px"
                      boxShadow="var(--shadow)"
                    >
                      <IconButton
                        _focus={{ boxShadow: "none" }}
                        aria-label="sort"
                        title={
                          sortDirection > 0
                            ? "Sort Ascending"
                            : "Sort Descending"
                        }
                        icon={
                          sortDirection > 0 ? (
                            <FaSortAmountUp />
                          ) : (
                            <FaSortAmountDownAlt />
                          )
                        }
                        onClick={() => setSortDirection(sortDirection * -1)}
                      />
                    </Box>
                    <Box
                      bgColor={useColorModeValue(
                        "whiteAlpha.600",
                        "blackAlpha.900",
                      )}
                      borderRadius="10px"
                      p="10px"
                      boxShadow="var(--shadow)"
                      maxW={{ base: "200px", md: "100%" }}
                    >
                      <Select
                        value={sortByField}
                        variant="filled"
                        focusBorderColor={useColorModeValue(
                          "blackAlpha.900",
                          "rosybrown",
                        )}
                        fontSize={{ base: "12px", sm: "13px", md: "16px" }}
                        onChange={(e) =>
                          setSortByField(e.target.value as FarmSortFields)
                        }
                      >
                        <option value={FarmSortFields.APR}>
                          Sort by {SORT_FIELDS_TO_LABEL[FarmSortFields.APR]}
                        </option>
                        <option value={FarmSortFields.TVL}>
                          Sort by {SORT_FIELDS_TO_LABEL[FarmSortFields.TVL]}
                        </option>
                        <option value={FarmSortFields.REWARD}>
                          Sort by {SORT_FIELDS_TO_LABEL[FarmSortFields.REWARD]}
                        </option>
                        <option value={FarmSortFields.DEPOSIT}>
                          Sort by {SORT_FIELDS_TO_LABEL[FarmSortFields.DEPOSIT]}
                        </option>
                        <option value={FarmSortFields.BALANCE}>
                          Sort by {SORT_FIELDS_TO_LABEL[FarmSortFields.BALANCE]}
                        </option>
                        <option value={FarmSortFields.NAME}>
                          Sort by {SORT_FIELDS_TO_LABEL[FarmSortFields.NAME]}
                        </option>
                      </Select>
                    </Box>
                  </HStack>
                  <HStack spacing="5px">
                    <Box
                      bgColor={useColorModeValue(
                        "whiteAlpha.600",
                        "blackAlpha.900",
                      )}
                      borderRadius="10px"
                      p="10px"
                      boxShadow="var(--shadow)"
                    >
                      <IconButton
                        _focus={{ boxShadow: "none" }}
                        aria-label="sort"
                        disabled={filterByField === FarmFilterFields.NO_FILTER}
                        title={
                          filterByField === FarmFilterFields.NO_FILTER
                            ? "Filter"
                            : "Clear Filter"
                        }
                        icon={
                          filterByField === FarmFilterFields.NO_FILTER ? (
                            <FaFilter />
                          ) : (
                            <FaUndo />
                          )
                        }
                        onClick={() =>
                          setfilterByField(FarmFilterFields.NO_FILTER)
                        }
                      />
                    </Box>
                    <Box
                      bgColor={useColorModeValue(
                        "whiteAlpha.600",
                        "blackAlpha.900",
                      )}
                      borderRadius="10px"
                      p="10px"
                      boxShadow="var(--shadow)"
                      maxW={{ base: "200px", md: "100%" }}
                    >
                      <Select
                        value={filterByField}
                        fontSize={{ base: "12px", sm: "13px", md: "16px" }}
                        variant="filled"
                        focusBorderColor={useColorModeValue(
                          "blackAlpha.900",
                          "rosybrown",
                        )}
                        onChange={(e) =>
                          setfilterByField(e.target.value as FarmFilterFields)
                        }
                      >
                        <option disabled value={FarmFilterFields.NO_FILTER}>
                          Select A Filter
                        </option>
                        <option value={FarmFilterFields.DEPOSIT}>
                          Filter By{" "}
                          {FILTER_FIELDS_TO_LABEL[FarmSortFields.DEPOSIT]}
                        </option>
                        <option value={FarmFilterFields.BALANCE}>
                          Filter By{" "}
                          {FILTER_FIELDS_TO_LABEL[FarmSortFields.BALANCE]}
                        </option>
                        <option value={FarmFilterFields.DUAL}>
                          Filter by{" "}
                          {FILTER_FIELDS_TO_LABEL[FarmFilterFields.DUAL]}
                        </option>
                      </Select>
                    </Box>
                  </HStack>
                </Stack>
                <Stack
                  spacing="5px"
                  alignItems="center"
                  direction={{ base: "column", lg: "row" }}
                >
                  <Box
                    bgColor={useColorModeValue(
                      "whiteAlpha.600",
                      "blackAlpha.900",
                    )}
                    borderRadius="10px"
                    p="10px"
                    boxShadow="var(--shadow)"
                  >
                    <IconButtonPopover
                      IconButtonProps={{
                        "aria-label": "Configure Settings",
                        size: "md",
                        icon: <BsSliders />,
                        title: "Configure Settings",
                        _focus: { boxShadow: "none" },
                      }}
                      PopoverBodyContent={
                        <Box p="15px">
                          <Grid gridTemplateRows="auto" rowGap="15px">
                            <GridItem>
                              <Text fontSize="23px" fontWeight="700">
                                Your Preferences
                              </Text>
                            </GridItem>
                            <Divider />
                            <GridItem>
                              <Text mb="10px" fontWeight="600">
                                Visible Fields
                              </Text>
                              <Grid
                                gridTemplateRows="auto"
                                gridTemplateColumns="repeat(2, 1fr)"
                              >
                                {Object.values(FarmSortFields).map(
                                  (field, index) => (
                                    <GridItem
                                      rowSpan={1}
                                      colSpan={1}
                                      key={index}
                                    >
                                      <Grid templateColumns="repeat(2, 1fr)">
                                        <GridItem>
                                          <Text fontSize="14px">
                                            {SORT_FIELDS_TO_LABEL[field]}
                                          </Text>
                                        </GridItem>
                                        <GridItem
                                          justifySelf="flex-end"
                                          mr="15px"
                                        >
                                          <Switch
                                            onChange={(e) =>
                                              dispatch(
                                                updateFarmVisibleFieldPreferences(
                                                  {
                                                    field: field,
                                                    value: +e.target.value * -1,
                                                  },
                                                ),
                                              )
                                            }
                                            value={
                                              farmPreferences.visibleFields[
                                                field
                                              ]
                                            }
                                            isChecked={
                                              farmPreferences.visibleFields[
                                                field
                                              ] > 0
                                                ? true
                                                : false
                                            }
                                            size="sm"
                                            colorScheme="green"
                                          />
                                        </GridItem>
                                      </Grid>
                                    </GridItem>
                                  ),
                                )}
                              </Grid>
                            </GridItem>
                            <Divider />
                            <GridItem>
                              <Text mb="10px" fontWeight="600">
                                Default Sorting Field
                              </Text>
                              <RadioGroup
                                value={farmPreferences.sortField}
                                size="sm"
                                defaultValue={"1"}
                              >
                                <Grid
                                  gridTemplateRows="auto"
                                  gridTemplateColumns="repeat(2, 1fr)"
                                >
                                  {Object.values(FarmSortFields).map(
                                    (field, index) => (
                                      <GridItem
                                        rowSpan={1}
                                        colSpan={1}
                                        key={index}
                                      >
                                        <Radio
                                          onChange={(e) =>
                                            dispatch(
                                              updateFarmSortPreferences(
                                                e.target
                                                  .value as FarmSortFields,
                                              ),
                                            )
                                          }
                                          value={field}
                                          colorScheme="green"
                                        >
                                          {SORT_FIELDS_TO_LABEL[field]}
                                        </Radio>
                                      </GridItem>
                                    ),
                                  )}
                                </Grid>
                              </RadioGroup>
                            </GridItem>
                            <Divider />
                            <GridItem>
                              <Text mb="10px" fontWeight="600">
                                Default Filter Field
                              </Text>
                              <RadioGroup
                                size="sm"
                                value={farmPreferences.filterField}
                              >
                                <Grid
                                  gridTemplateRows="auto"
                                  gridTemplateColumns="repeat(2, 1fr)"
                                >
                                  {Object.values(FarmFilterFields).map(
                                    (field, index) => (
                                      <GridItem
                                        rowSpan={1}
                                        colSpan={1}
                                        key={index}
                                      >
                                        <Radio
                                          onChange={(e) =>
                                            dispatch(
                                              updateFarmFilterPreferences(
                                                e.target
                                                  .value as FarmFilterFields,
                                              ),
                                            )
                                          }
                                          value={field}
                                          colorScheme="green"
                                        >
                                          {FILTER_FIELDS_TO_LABEL[field]}
                                        </Radio>
                                      </GridItem>
                                    ),
                                  )}
                                </Grid>
                              </RadioGroup>
                            </GridItem>
                          </Grid>
                        </Box>
                      }
                    />
                  </Box>
                  <Box
                    bgColor={useColorModeValue(
                      "whiteAlpha.600",
                      "blackAlpha.900",
                    )}
                    borderRadius="10px"
                    p="10px"
                    boxShadow="var(--shadow)"
                  >
                    <IconButtonPopover
                      IconButtonProps={{
                        "aria-label": "Help",
                        size: "md",
                        icon: <FaInfoCircle />,
                        title: "Need Help?",
                        _focus: { boxShadow: "none" },
                      }}
                      PopoverBodyContent={
                        <Box p="15px">
                          <Grid gridTemplateRows="auto" rowGap="15px">
                            <GridItem>
                              <Text fontSize="23px" fontWeight="700">
                                Farm Information
                              </Text>
                            </GridItem>
                            <Divider />
                            <GridItem>
                              <Flex>
                                <Text mb="10px" fontWeight="600">
                                  How to Farm
                                </Text>
                                <IconButton
                                  onClick={() => setHowToOpen(howToOpen * -1)}
                                  aria-label={
                                    howToOpen > 0 ? "Collapse" : "Expand"
                                  }
                                  variant="outline"
                                  size="xs"
                                  marginLeft="5px"
                                  icon={<BsChevronExpand />}
                                  title={howToOpen > 0 ? "Collapse" : "Expand"}
                                />
                              </Flex>
                              <Collapse
                                in={howToOpen > 0 ? true : false}
                                animateOpacity
                              >
                                <List
                                  fontSize="13px"
                                  color="var(--text-lighter)"
                                  spacing={3}
                                >
                                  <ListItem>
                                    <ListIcon
                                      as={FaChartPie}
                                      color="var(--text-primary)"
                                    />
                                    Add liquidity to one of our pools and
                                    receive LP tokens in exchange.
                                  </ListItem>
                                  <ListItem>
                                    <ListIcon
                                      as={FaReceipt}
                                      color="var(--text-primary)"
                                    />
                                    Click on any of the farm cards to deposit
                                    your LP tokens and earn rewards!
                                  </ListItem>
                                  <ListItem>
                                    <ListIcon
                                      as={FaGift}
                                      color="var(--text-primary)"
                                    />
                                    Withdraw your LP tokens and claim rewards at
                                    any time.
                                  </ListItem>
                                </List>
                              </Collapse>
                            </GridItem>
                            <Divider />
                            <GridItem>
                              <Flex>
                                <Text mb="10px" fontWeight="600">
                                  Dashboard
                                </Text>
                                <IconButton
                                  onClick={() =>
                                    setDashboardHelp(dashboardHelp * -1)
                                  }
                                  aria-label={
                                    dashboardHelp > 0 ? "Collapse" : "Expand"
                                  }
                                  variant="outline"
                                  size="xs"
                                  marginLeft="5px"
                                  icon={<BsChevronExpand />}
                                  title={
                                    dashboardHelp > 0 ? "Collapse" : "Expand"
                                  }
                                />
                              </Flex>
                              <Collapse
                                in={dashboardHelp > 0 ? true : false}
                                animateOpacity
                              >
                                <List
                                  fontSize="13px"
                                  color="var(--text-lighter)"
                                  spacing={3}
                                >
                                  <ListItem>
                                    <ListIcon
                                      as={FaLayerGroup}
                                      color="var(--text-primary)"
                                    />
                                    View your total rewards, LP token balances,
                                    & Farm Deposits across all farms all in one
                                    view!
                                  </ListItem>
                                </List>
                              </Collapse>
                            </GridItem>
                            <Divider />
                            <GridItem>
                              <Flex>
                                <Text mb="10px" fontWeight="600">
                                  Preferences
                                </Text>
                                <IconButton
                                  onClick={() =>
                                    setPreferencesHelp(preferencesHelp * -1)
                                  }
                                  aria-label={
                                    preferencesHelp > 0 ? "Collapse" : "Expand"
                                  }
                                  variant="outline"
                                  size="xs"
                                  marginLeft="5px"
                                  icon={<BsChevronExpand />}
                                  title={
                                    preferencesHelp > 0 ? "Collapse" : "Expand"
                                  }
                                />
                              </Flex>
                              <Collapse
                                in={preferencesHelp > 0 ? true : false}
                                animateOpacity
                              >
                                <List
                                  fontSize="13px"
                                  color="var(--text-lighter)"
                                  spacing={3}
                                >
                                  <ListItem>
                                    <ListIcon
                                      as={FaSortAmountUp}
                                      color="var(--text-primary)"
                                    />
                                    Sort by any of the farm card fields like
                                    TVL, APR & Name.
                                  </ListItem>
                                  <ListItem>
                                    <ListIcon
                                      as={FaFilter}
                                      color="var(--text-primary)"
                                    />
                                    Filter by your Farm Deposits, LP Token
                                    Balances and Farms with Dual Rewards.
                                  </ListItem>
                                  <ListItem>
                                    <ListIcon
                                      as={BsSliders}
                                      color="var(--text-primary)"
                                    />
                                    Configure your preferences on this page like
                                    default sorting behavior. We will save this
                                    info for you and apply it each time you
                                    visit the page!
                                  </ListItem>
                                </List>
                              </Collapse>
                            </GridItem>
                            <Divider />
                            <GridItem>
                              <Flex>
                                <Text mb="10px" fontWeight="600">
                                  Pools
                                </Text>
                                <IconButton
                                  onClick={() => setPoolsHelp(poolsHelp * -1)}
                                  aria-label={
                                    poolsHelp > 0 ? "Collapse" : "Expand"
                                  }
                                  variant="outline"
                                  size="xs"
                                  marginLeft="5px"
                                  icon={<BsChevronExpand />}
                                  title={poolsHelp > 0 ? "Collapse" : "Expand"}
                                />
                              </Flex>
                              <Collapse
                                in={poolsHelp > 0 ? true : false}
                                animateOpacity
                              >
                                <List
                                  fontSize="13px"
                                  color="var(--text-lighter)"
                                  spacing={3}
                                >
                                  <ListItem>
                                    <ListIcon
                                      as={FaChartPie}
                                      color="var(--text-primary)"
                                    />
                                    Most of our liquidity pools can be found by
                                    visiting our{" "}
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
                                  </ListItem>
                                </List>
                              </Collapse>
                            </GridItem>
                          </Grid>
                        </Box>
                      }
                    />
                  </Box>
                  <Box
                    bgColor={useColorModeValue(
                      "whiteAlpha.500",
                      "blackAlpha.900",
                    )}
                    borderRadius="10px"
                    p="10px"
                    boxShadow="var(--shadow)"
                    display={{ base: "flex", lg: "none" }}
                  >
                    <IconButton
                      _focus={{ boxShadow: "none" }}
                      aria-label="dashboard"
                      title="Dashboard"
                      icon={<FaLayerGroup color="#cc3a59" />}
                      onClick={onOpen}
                    />
                  </Box>
                </Stack>
              </Flex>
            </GridItem>
            <GridItem
              display={{ base: "none", lg: "grid" }}
              rowSpan={10}
              colSpan={1}
            >
              <Dashboard
                dashboardName="Farms"
                dashboardContent={
                  <StakeDetails
                    extraStakeDetailChild={
                      <Flex justifyContent="space-between" alignItems="center">
                        <FaGift
                          color="#cc3a59"
                          size="35px"
                          title="Total ROSE Rewards"
                        />
                        <AnimatingNumber
                          value={allRewardsFormatted}
                          precision={allRewardsFormatted > 0 ? 3 : 1}
                        />
                      </Flex>
                    }
                    loading={
                      (_.isEmpty(lpTokenBalances) ||
                        _.isEmpty(farmDeposits) ||
                        _.isEmpty(allRewards)) &&
                      !timeout
                    }
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
            </GridItem>
            <GridItem rowSpan={9} colSpan={1}>
              <Stack spacing="10px">
                <AnimatePresence>
                  {Object.values(FARMS_MAP)
                    .filter((farm) => FILTER_FUNCTIONS[filterByField](farm))
                    .sort((a, b) => {
                      return SORT_FUNCTIONS[sortByField](a, b)
                        ? sortDirection * -1
                        : sortDirection
                    })
                    .map((farm, index) =>
                      (farmStats &&
                        lpTokenBalances?.[farm.lpToken.symbol] &&
                        farmDeposits?.[farm.name] &&
                        allRewards?.[farm.name]) ||
                      timeout ? (
                        <FarmsOverview
                          key={farm.name}
                          farmName={farm.name}
                          lpTokenIcon={farm.lpToken.icon}
                          farmRoute={farm.route}
                          balance={
                            lpTokenBalances?.[farm.lpToken.symbol] || Zero
                          }
                          deposited={farmDeposits?.[farm.name] || Zero}
                          tvl={farmStats?.[farm.name]?.tvl}
                          apr={{
                            roseApr: farmStats?.[farm.name]?.apr,
                            dualRewardApr:
                              farmStats?.[farm.name]?.dualReward.apr,
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
                      ) : (
                        <Skeleton
                          key={index}
                          height="100px"
                          borderRadius="10px"
                        />
                      ),
                    )}
                </AnimatePresence>
              </Stack>
            </GridItem>
          </Grid>
        </Container>
      </Box>
    </>
  )
}

export default Farms
