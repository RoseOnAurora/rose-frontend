import { AppDispatch, AppState } from "../state"
import { BORROW_MARKET_MAP, BorrowMarket } from "../constants"
import {
  BorrowFilterFields,
  BorrowSortFields,
  updateBorrowFilterPreferences,
  updateBorrowSortPreferences,
  updateBorrowVisibleFieldPreferences,
} from "../state/user"
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
  Progress,
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
  FaFilter,
  FaHandHoldingUsd,
  FaInfoCircle,
  FaLayerGroup,
  FaSortAmountDownAlt,
  FaSortAmountUp,
  FaUndo,
} from "react-icons/fa"
import React, { ReactElement, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { AnimatePresence } from "framer-motion"
import AnimatingNumber from "../components/AnimateNumber"
import BorrowMarketsOverview from "../components/BorrowMarketsOverview"
import Dashboard from "../components/Dashboard"
import FormattedComponentName from "../components/FormattedComponentName"
import { IconButtonPopover } from "../components/Popover"
import StakeDetails from "../components/StakeDetails"
import TopMenu from "../components/TopMenu"
import { Zero } from "@ethersproject/constants"

export const SORT_FIELDS_TO_LABEL: {
  [sortField in BorrowSortFields]: string
} = {
  name: "Name",
  tvl: "TVL",
  collateral: "Collateral Deposited",
  borrow: "Borrowed",
  supply: "RUSD Left to Borrow",
  interest: "Interest",
  liquidationFee: "Liquidation Fee",
}

const FILTER_FIELDS_TO_LABEL: {
  [filterField in BorrowFilterFields]: string
} = {
  noFilter: "No Filter",
  supply: "RUSD Left to Borrow",
  collateral: "Collateral Deposited",
  borrow: "Borrowed",
}

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

  const [howToOpen, setHowToOpen] = useState(1)
  const [dashboardHelp, setDashboardHelp] = useState(-1)
  const [preferencesHelp, setPreferencesHelp] = useState(-1)
  const [glossaryHelp, setGlossaryHelp] = useState(-1)

  const { isOpen, onOpen, onClose } = useDisclosure()
  const resetDashboardView = () => {
    onClose()
    setIsInfo(false)
  }

  useTimeout(() => setTimout(true), 3000)

  const FILTER_FUNCTIONS: {
    [filterField in BorrowFilterFields]: (a: BorrowMarket) => boolean
  } = {
    borrow: (a: BorrowMarket) => a.name === "ROSE",
    supply: (a: BorrowMarket) => a.name === "ROSE",
    collateral: (a: BorrowMarket) => a.name === "ROSE",
    noFilter: (a: BorrowMarket) => (a ? true : false),
  }

  const SORT_FUNCTIONS: {
    [sortField in BorrowSortFields]: (
      a: BorrowMarket,
      b: BorrowMarket,
    ) => boolean
  } = {
    borrow: (a: BorrowMarket, b: BorrowMarket) => a.name > b.name,
    supply: (a: BorrowMarket, b: BorrowMarket) => a.name > b.name,
    name: (a: BorrowMarket, b: BorrowMarket) => a.name > b.name,
    tvl: (a: BorrowMarket, b: BorrowMarket) => a.name > b.name,
    interest: (a: BorrowMarket, b: BorrowMarket) => a.name > b.name,
    liquidationFee: (a: BorrowMarket, b: BorrowMarket) => a.name > b.name,
    collateral: (a: BorrowMarket, b: BorrowMarket) => a.name > b.name,
  }

  return (
    <>
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
              <Box
                p="30px"
                borderRadius="10px"
                background="var(--background-element)"
              >
                <Grid gridTemplateRows="auto" rowGap="15px">
                  <GridItem>
                    <Text fontSize="25px" fontWeight="700">
                      Borrow Information
                    </Text>
                  </GridItem>
                  <Divider />
                  <GridItem>
                    <Flex>
                      <Text mb="10px" fontWeight="600" fontSize="20px">
                        How to Borrow
                      </Text>
                      <IconButton
                        onClick={() => setHowToOpen(howToOpen * -1)}
                        aria-label={howToOpen > 0 ? "Collapse" : "Expand"}
                        variant="outline"
                        size="xs"
                        marginLeft="5px"
                        icon={<BsChevronExpand />}
                        title={howToOpen > 0 ? "Collapse" : "Expand"}
                      />
                    </Flex>
                    <Collapse in={howToOpen > 0 ? true : false} animateOpacity>
                      <List color="var(--text-lighter)" spacing={3}>
                        <ListItem>
                          <ListIcon
                            as={FaHandHoldingUsd}
                            color="var(--text-primary)"
                          />
                          Click on one of the borrow markets cards to add
                          collateral to borrow RUSD. The name of the market
                          indicates which token(s) are accepted as collateral.
                        </ListItem>
                      </List>
                    </Collapse>
                  </GridItem>
                  <Divider />
                  <GridItem>
                    <Flex>
                      <Text mb="10px" fontWeight="600" fontSize="20px">
                        Dashboard
                      </Text>
                      <IconButton
                        onClick={() => setDashboardHelp(dashboardHelp * -1)}
                        aria-label={dashboardHelp > 0 ? "Collapse" : "Expand"}
                        variant="outline"
                        size="xs"
                        marginLeft="5px"
                        icon={<BsChevronExpand />}
                        title={dashboardHelp > 0 ? "Collapse" : "Expand"}
                      />
                    </Flex>
                    <Collapse
                      in={dashboardHelp > 0 ? true : false}
                      animateOpacity
                    >
                      <List color="var(--text-lighter)" spacing={3}>
                        <ListItem>
                          <ListIcon
                            as={FaLayerGroup}
                            color="var(--text-primary)"
                          />
                          View your total borrowed & collateralized positions
                          across all markets all in one view!
                        </ListItem>
                      </List>
                    </Collapse>
                  </GridItem>
                  <Divider />
                  <GridItem>
                    <Flex>
                      <Text mb="10px" fontWeight="600" fontSize="20px">
                        Preferences
                      </Text>
                      <IconButton
                        onClick={() => setPreferencesHelp(preferencesHelp * -1)}
                        aria-label={preferencesHelp > 0 ? "Collapse" : "Expand"}
                        variant="outline"
                        size="xs"
                        marginLeft="5px"
                        icon={<BsChevronExpand />}
                        title={preferencesHelp > 0 ? "Collapse" : "Expand"}
                      />
                    </Flex>
                    <Collapse
                      in={preferencesHelp > 0 ? true : false}
                      animateOpacity
                    >
                      <List color="var(--text-lighter)" spacing={3}>
                        <ListItem>
                          <ListIcon
                            as={FaSortAmountUp}
                            color="var(--text-primary)"
                          />
                          Sort by any of the borrow market card fields like TVL,
                          Interest & Name.
                        </ListItem>
                        <ListItem>
                          <ListIcon as={FaFilter} color="var(--text-primary)" />
                          Filter by your Borrowed Balances and collateralized
                          positions.
                        </ListItem>
                        <ListItem>
                          <ListIcon
                            as={BsSliders}
                            color="var(--text-primary)"
                          />
                          Configure your preferences on this page like default
                          sorting behavior. We will save this info for you and
                          apply it each time you visit the page!
                        </ListItem>
                      </List>
                    </Collapse>
                  </GridItem>
                  <Divider />
                  <GridItem>
                    <Flex>
                      <Text mb="10px" fontWeight="600" fontSize="20px">
                        Glossary
                      </Text>
                      <IconButton
                        onClick={() => setGlossaryHelp(glossaryHelp * -1)}
                        aria-label={glossaryHelp > 0 ? "Collapse" : "Expand"}
                        variant="outline"
                        size="xs"
                        marginLeft="5px"
                        icon={<BsChevronExpand />}
                        title={glossaryHelp > 0 ? "Collapse" : "Expand"}
                      />
                    </Flex>
                    <Collapse
                      in={glossaryHelp > 0 ? true : false}
                      animateOpacity
                    >
                      <List color="var(--text-lighter)" spacing={3}></List>
                    </Collapse>
                  </GridItem>
                </Grid>
              </Box>
            ) : (
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
                        <AnimatingNumber value={1205.7} precision={2} />
                      </Flex>
                    }
                    loading={!timeout}
                    balanceView={{
                      title: "Your RUSD Borrowed",
                      items: [],
                    }}
                    stakedView={{
                      title: "Your Deposited Collateral",
                      items: [],
                    }}
                    stats={[
                      {
                        statLabel: "RUSD Rate",
                        statValue: "1 RUSD = 1 USD",
                      },
                    ]}
                  />
                }
              />
            )}
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
        <TopMenu activeTab="borrow" />
        <Container maxW="1550px" mt="40px">
          <Grid
            templateColumns={{ base: "100%", lg: "65% 32%" }}
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
                          "blackAlpha.500",
                          "rosybrown",
                        )}
                        fontSize={{ base: "12px", sm: "13px", md: "16px" }}
                        onChange={(e) =>
                          setSortByField(e.target.value as BorrowSortFields)
                        }
                      >
                        <option value={BorrowSortFields.TVL}>
                          Sort by TVL
                        </option>
                        <option value={BorrowSortFields.INTEREST}>
                          Sort by Interest Rate
                        </option>
                        <option value={BorrowSortFields.SUPPLY}>
                          Sort by RUSD Left to Borrow
                        </option>
                        <option value={BorrowSortFields.LIQUIDATION_FEE}>
                          Sort by Liquidation Fee
                        </option>
                        <option value={BorrowSortFields.BORROW}>
                          Sort by Borrowed
                        </option>
                        <option value={BorrowSortFields.COLLATERAL}>
                          Sort by Collateralized Position
                        </option>
                        <option value={BorrowSortFields.NAME}>
                          Sort by Name
                        </option>
                      </Select>
                    </Box>
                  </HStack>
                  <HStack spacing="5px">
                    <Box
                      bgColor={useColorModeValue(
                        "whiteAlpha.500",
                        "blackAlpha.900",
                      )}
                      borderRadius="10px"
                      p="10px"
                      boxShadow="var(--shadow)"
                    >
                      <IconButton
                        _focus={{ boxShadow: "none" }}
                        aria-label="sort"
                        disabled={
                          filterByField === BorrowFilterFields.NO_FILTER
                        }
                        title={
                          filterByField === BorrowFilterFields.NO_FILTER
                            ? "Filter"
                            : "Clear Filter"
                        }
                        icon={
                          filterByField === BorrowFilterFields.NO_FILTER ? (
                            <FaFilter />
                          ) : (
                            <FaUndo />
                          )
                        }
                        onClick={() =>
                          setfilterByField(BorrowFilterFields.NO_FILTER)
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
                          "blackAlpha.500",
                          "rosybrown",
                        )}
                        onChange={(e) =>
                          setfilterByField(e.target.value as BorrowFilterFields)
                        }
                      >
                        <option disabled value={BorrowFilterFields.NO_FILTER}>
                          Select A Filter
                        </option>
                        <option value={BorrowFilterFields.BORROW}>
                          Filter By Borrowed
                        </option>
                        <option value={BorrowFilterFields.SUPPLY}>
                          Filter By Total RUSD Left to Borrow
                        </option>
                        <option value={BorrowFilterFields.COLLATERAL}>
                          Filter By Position
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
                                rowGap="5px"
                              >
                                {Object.values(BorrowSortFields).map(
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
                                                updateBorrowVisibleFieldPreferences(
                                                  {
                                                    field: field,
                                                    value: +e.target.value * -1,
                                                  },
                                                ),
                                              )
                                            }
                                            value={
                                              borrowPreferences.visibleFields[
                                                field
                                              ]
                                            }
                                            isChecked={
                                              borrowPreferences.visibleFields[
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
                                value={borrowPreferences.sortField}
                                size="sm"
                              >
                                <Grid
                                  gridTemplateRows="auto"
                                  gridTemplateColumns="repeat(2, 1fr)"
                                  rowGap="5px"
                                >
                                  {Object.values(BorrowSortFields).map(
                                    (field, index) => (
                                      <GridItem
                                        rowSpan={1}
                                        colSpan={1}
                                        key={index}
                                        fontSize="12px"
                                      >
                                        <Radio
                                          onChange={(e) =>
                                            dispatch(
                                              updateBorrowSortPreferences(
                                                e.target
                                                  .value as BorrowSortFields,
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
                                value={borrowPreferences.filterField}
                              >
                                <Grid
                                  gridTemplateRows="auto"
                                  gridTemplateColumns="repeat(2, 1fr)"
                                  rowGap="5px"
                                >
                                  {Object.values(BorrowFilterFields).map(
                                    (field, index) => (
                                      <GridItem
                                        rowSpan={1}
                                        colSpan={1}
                                        key={index}
                                      >
                                        <Radio
                                          onChange={(e) =>
                                            dispatch(
                                              updateBorrowFilterPreferences(
                                                e.target
                                                  .value as BorrowFilterFields,
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
                    <IconButton
                      _focus={{ boxShadow: "none" }}
                      aria-label="info"
                      title="Need Help?"
                      icon={<FaInfoCircle />}
                      onClick={() => {
                        onOpen()
                        setIsInfo(true)
                      }}
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
                dashboardName="Borrow Markets"
                dashboardContent={
                  <StakeDetails
                    extraStakeDetailChild={
                      <Grid gridTemplateRows="auto" rowGap="30px">
                        <GridItem>
                          <Flex
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <FaHandHoldingUsd
                              color="#cc3a59"
                              size="35px"
                              title="Total RUSD Borrowed"
                            />
                            <AnimatingNumber value={1205.7} precision={2} />
                          </Flex>
                        </GridItem>
                        <Divider />
                        <GridItem>
                          <Grid gridTemplateRows="auto" rowGap="20px">
                            <GridItem>
                              <Text
                                fontWeight={700}
                                lineHeight="30px"
                                fontSize="25px"
                              >
                                Your Position Health
                              </Text>
                            </GridItem>
                            <GridItem>
                              <Flex
                                justifyContent="space-between"
                                alignItems="center"
                              >
                                <FormattedComponentName
                                  name={"FRAX"}
                                  icon={
                                    BORROW_MARKET_MAP["Frax Market"]
                                      .collateralToken.icon
                                  }
                                />
                                <Box width={150}>
                                  <Progress
                                    colorScheme={"green"}
                                    height="30px"
                                    value={80}
                                  />
                                </Box>
                              </Flex>
                            </GridItem>
                          </Grid>
                        </GridItem>
                      </Grid>
                    }
                    loading={!timeout}
                    balanceView={{
                      title: "Your RUSD Borrowed",
                      items: [],
                    }}
                    stakedView={{
                      title: "Your Collateral Deposited",
                      items: [],
                    }}
                    stats={[
                      {
                        statLabel: "RUSD Rate",
                        statValue: "1 RUSD = 1 USD",
                      },
                    ]}
                  />
                }
              />
            </GridItem>
            <GridItem rowSpan="auto" colSpan={1}>
              <Stack spacing="10px">
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
                    .map((borrowMarket, index) =>
                      timeout ? (
                        <BorrowMarketsOverview
                          key={borrowMarket.name}
                          marketName={borrowMarket.name}
                          borrowRoute={borrowMarket.route}
                          tokenIcon={borrowMarket.collateralToken.icon}
                          borrowed={Zero}
                          position={Zero}
                          rusdLeftToBorrow={Zero}
                          tvl={Zero}
                          interest={Zero}
                          fee={Zero}
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

export default BorrowMarkets
