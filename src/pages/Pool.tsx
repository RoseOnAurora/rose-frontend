import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Grid,
  GridItem,
  HStack,
  Image,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import {
  POOLS_MAP,
  POOL_FEE_PRECISION,
  PoolName,
  TOKENS_MAP,
} from "../constants"
import React, { ReactElement, useState } from "react"
import {
  commify,
  formatBNToPercentString,
  formatBNToShortString,
  formatBNToString,
} from "../utils"
import useChakraToast, { TransactionType } from "../hooks/useChakraToast"
import {
  useFarmContract,
  useLPTokenContractForFarm,
} from "../hooks/useContract"
import AnimatingNumber from "../components/AnimateNumber"
import { AppState } from "../state"
import BackButton from "../components/button/BackButton"
import { BigNumber } from "@ethersproject/bignumber"
import ComponentWrapper from "../components/wrappers/ComponentWrapper"
import Deposit from "../components/Deposit"
import { FaChartPie } from "react-icons/fa"
import FarmRewardsPopoverContent from "../components/FarmRewardsPopoverContent"
import { IconButtonPopover } from "../components/Popover"
import ModalWrapper from "../components/wrappers/ModalWrapper"
import PageWrapper from "../components/wrappers/PageWrapper"
import RewardInfo from "../components/RewardInfo"
import { RewardsIcon } from "../constants/icons"
import StakeDetails from "../components/stake/StakeDetails"
import StakeForm from "../components/stake/StakeForm"
import StakeRewardInfo from "../components/StakeRewardInfo"
import TabsWrapper from "../components/wrappers/TabsWrapper"
import Withdraw from "../components/Withdraw"
import { Zero } from "@ethersproject/constants"
import { useApproveAndDepositFarm } from "../hooks/useApproveAndDepositFarm"
import useCalculateFarmDeposited from "../hooks/useCalculateFarmDeposited"
import { useCheckTokenRequiresApproval } from "../hooks/useCheckTokenRequiresApproval"
import useClaimReward from "../hooks/useClaimReward"
import useEarnedRewards from "../hooks/useEarnedRewards"
import useFarmExit from "../hooks/useFarmExit"
import useHandlePostSubmit from "../hooks/useHandlePostSubmit"
import usePoolData from "../hooks/usePoolData"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"
import { useWithdrawFarm } from "../hooks/useWithdrawFarm"

interface Props {
  poolName: PoolName
}

const Pool = ({ poolName }: Props): ReactElement => {
  const { t } = useTranslation()
  const toast = useChakraToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const handlePostSubmit = useHandlePostSubmit()
  const [poolData, userShareData] = usePoolData(poolName)
  const [isStake, toggleIsStake] = useState(true)

  // farm
  const farmName = POOLS_MAP[poolName].farmName!
  const exit = useFarmExit(farmName)
  const getReward = useClaimReward(farmName)
  const farm = useApproveAndDepositFarm(farmName)
  const withdraw = useWithdrawFarm(farmName)
  const farmContract = useFarmContract(farmName)
  const lpTokenContract = useLPTokenContractForFarm(farmName)
  const farmDeposited = useCalculateFarmDeposited(
    userShareData?.lpTokenBalance,
    farmName,
  )
  const lpTokenBalance = userShareData?.lpTokenBalance
  const [approved, loading, checkLpTokenApproved] =
    useCheckTokenRequiresApproval(lpTokenContract, farmContract)
  const { farmStats } = useSelector((state: AppState) => state.application)
  const { roseRewards, dualRewards, totalRewards } = useEarnedRewards(
    farmName,
    farmStats?.[farmName]?.dualReward.address,
  )
  const rewardsEarned = totalRewards ? totalRewards : roseRewards
  const dualRewardTokenName = farmStats?.[farmName]?.dualReward.token
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
      <ModalWrapper
        isOpen={isOpen}
        onClose={onClose}
        modalHeader={isStake ? "Stake to Earn Rewards" : "Unstake"}
        isCentered
        preserveScrollBarGap
        blockScrollOnMount={false}
        maxW="600px"
      >
        {isStake ? (
          <StakeForm
            fieldName={"stake"}
            token={POOLS_MAP[poolName].lpToken.symbol}
            tokenName={POOLS_MAP[poolName].lpToken.name}
            tokenIcon={POOLS_MAP[poolName].lpToken.icon}
            formDescription={<StakeRewardInfo />}
            submitButtonLabel={
              approved ? t("stake") : t("approveAnd", { action: t("stake") })
            }
            isLoading={loading}
            txnType={TransactionType.STAKE}
            max={lpTokenBalance || Zero}
            handleSubmit={async (amount: string) => {
              await farm(amount)
              onClose()
            }}
            handleInputChanged={checkLpTokenApproved}
          />
        ) : (
          <StakeForm
            fieldName={"unstake"}
            token={POOLS_MAP[poolName].lpToken.symbol}
            tokenName={POOLS_MAP[poolName].lpToken.name}
            tokenIcon={POOLS_MAP[poolName].lpToken.icon}
            isLoading={false}
            txnType={TransactionType.UNSTAKE}
            submitButtonLabel={t("unstake")}
            max={farmDeposited}
            handleSubmit={async (amount: string) => {
              await withdraw(amount)
              onClose()
            }}
          />
        )}
      </ModalWrapper>
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
                      fontSize="27px"
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
                        3,
                      )}
                    </Text>
                  </HStack>
                </Flex>
                <Box bg="bgDark" borderRadius="8px" p="28px">
                  <Stack w="full">
                    <Flex
                      justifyContent="space-between"
                      alignItems="center"
                      mb="20px"
                    >
                      <Text fontSize="25px" fontWeight={700} lineHeight="30px">
                        Rewards
                      </Text>
                      <HStack>
                        <IconButtonPopover
                          IconButtonProps={{
                            "aria-label": "Harvest Rewards",
                            variant: "solid",
                            borderRadius: "8px",
                            size: "lg",
                            icon: (
                              <RewardsIcon fill="red.500" fontSize="25px" />
                            ),
                            title: "Harvest Rewards",
                            disabled: +rewardsEarned <= 0,
                          }}
                          PopoverBodyContent={
                            <FarmRewardsPopoverContent
                              totalRewardsAmount={rewardsEarned || "0"}
                              roseRewardsAmount={roseRewards}
                              dualRewards={
                                dualRewardTokenName && dualRewards
                                  ? {
                                      tokenName: dualRewardTokenName,
                                      amount: dualRewards,
                                    }
                                  : undefined
                              }
                              claim={getReward}
                              withdrawAndClaim={exit}
                            />
                          }
                        />
                        <AnimatingNumber
                          value={+rewardsEarned}
                          precision={+rewardsEarned ? 3 : 1}
                        />
                      </HStack>
                    </Flex>
                    {farmDeposited.gt(Zero) || lpTokenBalance?.gt(Zero) ? (
                      <ButtonGroup size="md" isAttached>
                        <Button
                          disabled={lpTokenBalance?.lte(Zero)}
                          w="full"
                          color="gray.50"
                          borderRadius="8px"
                          variant="primary"
                          onClick={() => {
                            toggleIsStake(true)
                            onOpen()
                          }}
                        >
                          {t("stake")}
                        </Button>
                        <Button
                          w="full"
                          textAlign="right"
                          disabled={farmDeposited.lte(Zero)}
                          color="gray.50"
                          borderRadius="8px"
                          variant="solid"
                          onClick={() => {
                            toggleIsStake(false)
                            onOpen()
                          }}
                        >
                          {t("unstake")}
                        </Button>
                      </ButtonGroup>
                    ) : (
                      <RewardInfo lpTokenName={poolData.lpToken} />
                    )}
                  </Stack>
                </Box>
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
                      gridTemplateColumns="repeat(2, 1fr)"
                      gridTemplateRows="auto"
                      gap={5}
                      mt={2}
                      p="10px"
                    >
                      {formattedPoolDataTokens.map((token, index) => (
                        <GridItem
                          key={index}
                          colSpan={
                            index === formattedPoolDataTokens.length - 1 &&
                            formattedPoolDataTokens.length === 3
                              ? 2
                              : 1
                          }
                        >
                          <Flex
                            alignItems="center"
                            gap={3}
                            justifyContent="center"
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
