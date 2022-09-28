import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  HStack,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { FARMS_MAP, FarmName } from "../constants"
import React, { ReactElement, useState } from "react"
import {
  useFarmContract,
  useLPTokenContractForFarm,
} from "../hooks/useContract"
import AnimatingNumber from "./AnimateNumber"
import { AppState } from "../state"
import FarmRewardsPopoverContent from "./FarmRewardsPopoverContent"
import { IconButtonPopover } from "./Popover"
import ModalWrapper from "./wrappers/ModalWrapper"
import RewardInfo from "./RewardInfo"
import { RewardsIcon } from "../constants/icons"
import StakeForm from "./stake/StakeForm"
import StakeRewardInfo from "./StakeRewardInfo"
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

interface FarmProps {
  farmName: FarmName
  farmDescription?: string
}

const Farm = ({ farmName, farmDescription }: FarmProps): ReactElement => {
  // hooks
  const { farmStats } = useSelector((state: AppState) => state.application)
  const { roseRewards, dualRewards, totalRewards } = useEarnedRewards(
    farmName,
    farmStats?.[farmName]?.dualReward.address,
  )
  const getReward = useClaimReward(farmName)
  const exit = useFarmExit(farmName)
  const { lpTokenBalance } = useFarmData(farmName)
  const farmDeposited = useCalculateFarmDeposited(lpTokenBalance, farmName)
  const { t } = useTranslation()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const farmContract = useFarmContract(farmName)
  const lpTokenContract = useLPTokenContractForFarm(farmName)
  const [approved, loading, checkLpTokenApproved] =
    useCheckTokenRequiresApproval(lpTokenContract, farmContract)
  const farm = useApproveAndDepositFarm(farmName)
  const withdraw = useWithdrawFarm(farmName)

  // state
  const [isStake, toggleIsStake] = useState(true)

  const rewardsEarned = totalRewards ? totalRewards : roseRewards
  const dualRewardTokenName = farmStats?.[farmName]?.dualReward.token
  const lpTokenName = FARMS_MAP[farmName].lpToken.name

  return (
    <React.Fragment>
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
            token={FARMS_MAP[farmName].lpToken.symbol}
            tokenName={FARMS_MAP[farmName].lpToken.name}
            tokenIcon={FARMS_MAP[farmName].lpToken.icon}
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
            token={FARMS_MAP[farmName].lpToken.symbol}
            tokenName={FARMS_MAP[farmName].lpToken.name}
            tokenIcon={FARMS_MAP[farmName].lpToken.icon}
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
      <Box bg="bgDark" borderRadius="8px" p="15px">
        <Stack w="full">
          <Flex justifyContent="space-between" alignItems="center" mb="20px">
            <Text
              fontSize={{ base: "18px", md: "25px" }}
              fontWeight={700}
              lineHeight="30px"
            >
              {farmDescription || "Rewards"}
            </Text>
            <HStack>
              <IconButtonPopover
                IconButtonProps={{
                  "aria-label": "Harvest Rewards",
                  variant: "solid",
                  borderRadius: "8px",
                  size: "lg",
                  icon: <RewardsIcon fill="red.500" fontSize="25px" />,
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
            <RewardInfo lpTokenName={lpTokenName} />
          )}
        </Stack>
      </Box>
    </React.Fragment>
  )
}

export default Farm
