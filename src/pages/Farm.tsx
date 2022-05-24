import { Box, Flex, Link, Text, useColorModeValue } from "@chakra-ui/react"
import { FARMS_MAP, FarmName } from "../constants"
import React, { ReactElement } from "react"
import { commify, formatBNToShortString, formatBNToString } from "../utils"
import {
  useFarmContract,
  useLPTokenContractForFarm,
} from "../hooks/useContract"
import AnimatingNumber from "../components/AnimateNumber"
import { AppState } from "../state"
import BackButton from "../components/BackButton"
import { BigNumber } from "@ethersproject/bignumber"
import ComponentWrapper from "../components/wrappers/ComponentWrapper"
import { FaGift } from "react-icons/fa"
import FarmRewardsPopoverContent from "../components/FarmRewardsPopoverContent"
import { IconButtonPopover } from "../components/Popover"
import PageWrapper from "../components/wrappers/PageWrapper"
import { Link as ReactLink } from "react-router-dom"
import StakeDetails from "../components/StakeDetails"
import StakeForm from "../components/StakeForm"
import TabsWrapper from "../components/wrappers/TabsWrapper"
import { TransactionType } from "../hooks/useChakraToast"
import { Zero } from "@ethersproject/constants"
import { useApproveAndDepositFarm } from "../hooks/useApproveAndDepositFarm"
import useCalculateFarmDeposited from "../hooks/useCalculateFarmDeposited"
import { useCheckTokenRequiresApproval } from "../hooks/useCheckTokenRequiresApproval"
import useClaimReward from "../hooks/useClaimReward"
import useEarnedRewards from "../hooks/useEarnedRewards"
import useFarmData from "../hooks/useFarmData"
import useFarmExit from "../hooks/useFarmExit"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"
import { useWithdrawFarm } from "../hooks/useWithdrawFarm"

interface Props {
  farmName: FarmName
}

const Farm = ({ farmName }: Props): ReactElement => {
  const farmData = useFarmData(farmName)
  const { lpToken, poolName, poolUrl, isRose } = FARMS_MAP[farmName]
  const deposited = useCalculateFarmDeposited(
    farmData?.lpTokenBalance,
    farmName,
  )
  const farm = useApproveAndDepositFarm(farmName)
  const withdraw = useWithdrawFarm(farmName)
  const farmContract = useFarmContract(farmName)
  const lpTokenContract = useLPTokenContractForFarm(farmName)
  const [approved, loading, checkLpTokenApproved] =
    useCheckTokenRequiresApproval(lpTokenContract, farmContract)

  const formattedBalance = commify(
    formatBNToString(farmData?.lpTokenBalance || Zero, 18, 5),
  )
  const formattedDeposited = commify(formatBNToString(deposited, 18, 5))
  const { farmStats } = useSelector((state: AppState) => state.application)
  const { roseRewards, dualRewards, totalRewards } = useEarnedRewards(
    farmName,
    farmStats?.[farmName]?.dualReward.address,
  )
  const tvl = farmStats?.[farmName]?.tvl
  const formattedTvl = tvl
    ? `$${formatBNToShortString(BigNumber.from(tvl), 18)}`
    : "-"
  const apr = farmStats?.[farmName]?.apr || "-"
  const dualRewardApr = farmStats?.[farmName]?.dualReward.apr
  const dualRewardTokenName = farmStats?.[farmName]?.dualReward.token
  const dualRewardsPopover =
    dualRewardTokenName && dualRewards
      ? {
          tokenName: dualRewardTokenName,
          amount: dualRewards,
        }
      : undefined
  const rewardsEarned = totalRewards ? totalRewards : roseRewards
  const exit = useFarmExit(farmName)
  const getReward = useClaimReward(farmName)
  const { t } = useTranslation()

  const FormDescription = (): ReactElement => {
    return isRose ? (
      <>
        Add liquidity to the the{" "}
        <Link
          as={ReactLink}
          to={`/pools/${poolUrl}`}
          style={{ margin: 0, fontWeight: "bold" }}
        >
          {poolName}
        </Link>{" "}
        to get {lpToken.name}
      </>
    ) : (
      <>
        Add liquidity to the the{" "}
        <Link
          href={poolUrl}
          target="_blank"
          rel="noreferrer"
          style={{ margin: 0, fontWeight: "bold" }}
        >
          {poolName}
          <sup>↗</sup>
        </Link>{" "}
        to get {lpToken.name}
      </>
    )
  }

  const FormTitle = ({ title }: { title: string }): ReactElement => {
    return (
      <Text
        fontWeight={700}
        fontSize={{ base: "21px", md: "25px", lg: "28px" }}
        lineHeight="30px"
      >
        {title} {lpToken.symbol}
      </Text>
    )
  }

  return (
    <PageWrapper activeTab="farm">
      <ComponentWrapper
        top={<BackButton route="/farms" buttonText="Go back to farms" />}
        left={
          <TabsWrapper
            tabsProps={{ variant: "primary" }}
            tab1={{
              name: t("deposit"),
              content: (
                <StakeForm
                  fieldName={"deposit"}
                  token={lpToken.symbol}
                  tokenIcon={lpToken.icon}
                  submitButtonLabel={
                    approved
                      ? t("deposit")
                      : t("approveAnd", { action: t("deposit") })
                  }
                  isLoading={loading}
                  formTitle={<FormTitle title={t("deposit")} />}
                  formDescription={<FormDescription />}
                  txnType={TransactionType.DEPOSIT}
                  max={farmData?.lpTokenBalance || Zero}
                  handleSubmit={farm}
                  handleInputChanged={checkLpTokenApproved}
                />
              ),
            }}
            tab2={{
              name: t("Withdraw"),
              content: (
                <StakeForm
                  fieldName={"withdraw"}
                  token={lpToken.symbol}
                  tokenIcon={lpToken.icon}
                  isLoading={false}
                  formTitle={<FormTitle title={t("Withdraw")} />}
                  formDescription={<FormDescription />}
                  txnType={TransactionType.WITHDRAW}
                  submitButtonLabel={t("Withdraw")}
                  max={deposited}
                  handleSubmit={withdraw}
                />
              ),
            }}
          />
        }
        right={
          <StakeDetails
            extraStakeDetailChild={
              <Flex justifyContent="space-between" alignItems="center">
                <IconButtonPopover
                  IconButtonProps={{
                    "aria-label": "Harvest Rewards",
                    variant: "primary",
                    size: "lg",
                    icon: <FaGift size="30px" />,
                    title: "Harvest Rewards",
                    disabled: +rewardsEarned <= 0,
                  }}
                  PopoverBodyContent={
                    <FarmRewardsPopoverContent
                      totalRewardsAmount={rewardsEarned || "0"}
                      roseRewardsAmount={roseRewards}
                      dualRewards={dualRewardsPopover}
                      claim={getReward}
                      withdrawAndClaim={exit}
                    />
                  }
                />
                <AnimatingNumber
                  value={+rewardsEarned}
                  precision={+rewardsEarned ? 5 : 1}
                ></AnimatingNumber>
              </Flex>
            }
            balanceView={{
              title: t("balance"),
              items: [
                {
                  tokenName: lpToken.symbol,
                  icon: lpToken.icon,
                  amount: formattedBalance,
                },
              ],
            }}
            stakedView={{
              title: t("deposited"),
              items: [
                {
                  tokenName: lpToken.symbol,
                  icon: lpToken.icon,
                  amount: formattedDeposited,
                },
              ],
            }}
            stats={[
              {
                statLabel: "TVL",
                statValue: formattedTvl,
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
                statPopOver: (
                  <Flex
                    flexDirection="column"
                    color={useColorModeValue("#555555", "#bbbbbb")}
                  >
                    <Flex justifyContent="space-between">
                      <Box>ROSE APR</Box>
                      <Box>{apr}</Box>
                    </Flex>
                    {dualRewardApr && dualRewardTokenName ? (
                      <Flex justifyContent="space-between">
                        <Box>{dualRewardTokenName} APR</Box>
                        <Box>{dualRewardApr}</Box>
                      </Flex>
                    ) : null}
                  </Flex>
                ),
              },
            ]}
          />
        }
      />
    </PageWrapper>
  )
}

export default Farm
