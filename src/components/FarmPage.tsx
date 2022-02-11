import {
  Box,
  Button,
  Flex,
  IconButton,
  Text,
  useColorModeValue,
} from "@chakra-ui/react"
import ConfirmTransaction, {
  ConfirmTransactionProps,
  ModalType,
} from "./ConfirmTransaction"
import React, { ReactElement, useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import { commify, formatBNToShortString, formatBNToString } from "../utils"
import AnimatingNumber from "./AnimateNumber"
import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import { FaGift } from "react-icons/fa"
import FarmFooter from "./FarmFooter"
import { FarmName } from "../constants"
import FarmTabs from "./FarmTabs"
// import HarvestRewards from "./HarvestRewards"
import Modal from "./Modal"
import StakeDetails from "./StakeDetails"
import { getEtherscanLink } from "../utils/getEtherscanLink"
import roseIcon from "../assets/icons/rose.svg"
import styles from "./FarmPage.module.scss"
import terraLunaIcon from "../assets/icons/terra-luna-logo.svg"
import useClaimReward from "../hooks/useClaimReward"
import useEarnedRewards from "../hooks/useEarnedRewards"
import useFarmExit from "../hooks/useFarmExit"
import { useSelector } from "react-redux"

interface Props {
  lpTokenName: string
  lpTokenIcon: string
  balance: BigNumber
  deposited: BigNumber
  farmName: FarmName
  poolName: string
}

const FarmPage = (props: Props): ReactElement => {
  const { lpTokenName, lpTokenIcon, balance, deposited, farmName } = props
  const formattedBalance = commify(formatBNToString(balance, 18, 5))
  const formattedDeposited = commify(formatBNToString(deposited, 18, 5))
  const { farmStats } = useSelector((state: AppState) => state.application)
  const { roseRewards, dualRewards, totalRewards } = useEarnedRewards(
    farmName,
    farmStats?.[farmName]?.dualReward.address,
  )
  const rewardsEarned = totalRewards ? totalRewards : roseRewards
  const exit = useFarmExit(farmName)
  const getReward = useClaimReward(farmName)
  const [
    currentModal,
    setCurrentModal,
  ] = useState<ConfirmTransactionProps | null>(null)
  const tvl = farmStats?.[farmName]?.tvl
  const formattedTvl = tvl
    ? `$${formatBNToShortString(BigNumber.from(tvl), 18)}`
    : "-"
  const apr = farmStats?.[farmName]?.apr || "-"
  const dualRewardApr = farmStats?.[farmName]?.dualReward.apr
  const dualRewardTokenName = farmStats?.[farmName]?.dualReward.token
  const { t } = useTranslation()

  const updateModal = (
    modalType: ModalType,
    txnType?: string,
    txnHash?: string,
  ): void => {
    switch (modalType) {
      case ModalType.CONFIRM:
        setCurrentModal({ type: ModalType.CONFIRM })
        break
      case ModalType.SUCCESS:
        setCurrentModal({
          type: ModalType.SUCCESS,
          title: t("successTitle"),
          description: t("txConfirmed", { tx: txnType }),
        })
        break
      case ModalType.FAILED:
        setCurrentModal({
          type: ModalType.FAILED,
          title: t("failedTitle"),
          description: !txnHash
            ? t("txFailed_internal", { tx: txnType })
            : undefined,
          children: txnHash ? (
            <Trans i18nKey="txFailed" t={t}>
              {{ tx: txnType }}
              <a
                href={getEtherscanLink(txnHash, "tx")}
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: "underline", margin: 0 }}
              >
                blockscout.
              </a>
            </Trans>
          ) : null,
        })
        break
      case ModalType.APPROVE:
        setCurrentModal({
          type: ModalType.APPROVE,
          title: t("chooseOption"),
          description: `Use the Harvest Rewards action to redeem all rewards from this farm. Use the Withdraw & Harvest action to redeem all rewards as well as withdraw your LP Token balance of ${formattedDeposited}.`,
        })
        break
      default:
        break
    }
  }

  return (
    <div className={styles.farmPage}>
      <Modal
        isOpen={!!currentModal}
        onClose={(): void => setCurrentModal(null)}
      >
        <ConfirmTransaction {...currentModal}>
          <Box
            bg="var(--secondary-background)"
            borderRadius="10px"
            p="15px"
            mt="30px"
          >
            <Flex justifyContent="center">
              <Text as="p" color="var(--text-lighter)">
                Current Rewards
              </Text>
            </Flex>
            <Flex justifyContent="center">
              <Box bg="#cc3a59" borderRadius="5px" p="20px" mt="5px">
                <Text as="h3" color="white">
                  {(+rewardsEarned).toFixed(8)}
                </Text>
              </Box>
            </Flex>
            <Box mt="20px">
              <Flex
                justifyContent="space-between"
                mb="10px"
                alignItems="center"
                flexWrap="wrap"
              >
                <Flex alignItems="center">
                  <Box width="40px">
                    <img alt="icon" src={roseIcon} width="100%" />
                  </Box>
                  <Text as="p">ROSE:</Text>
                </Flex>
                <Text as="b">{(+roseRewards).toFixed(8)}</Text>
              </Flex>
              {dualRewardApr && dualRewardTokenName ? (
                <Flex
                  justifyContent="space-between"
                  alignItems="center"
                  flexWrap="wrap"
                >
                  <Flex alignItems="center">
                    <Box width="40px" mr="3px">
                      <img alt="icon" src={terraLunaIcon} width="100%" />
                    </Box>
                    <Text as="p">{dualRewardTokenName}:</Text>
                  </Flex>
                  <Text as="b">
                    {dualRewards ? (+dualRewards).toFixed(8) : "0.0"}
                  </Text>
                </Flex>
              ) : null}
            </Box>
          </Box>
          {currentModal?.type === ModalType.APPROVE ? (
            <div className={styles.approveButtons}>
              <Button
                p="20px"
                variant="primary"
                onClick={async () => {
                  updateModal(ModalType.CONFIRM)
                  const receipt = await getReward()
                  if (receipt?.status) {
                    updateModal(ModalType.SUCCESS, t("harvestRewards"))
                  } else {
                    updateModal(
                      ModalType.FAILED,
                      t("harvestRewards"),
                      receipt?.transactionHash,
                    )
                  }
                }}
              >
                {t("harvestRewards")}
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  updateModal(ModalType.CONFIRM)
                  const receipt = await exit()
                  if (receipt?.status) {
                    updateModal(ModalType.SUCCESS, t("withdrawAndHarvest"))
                  } else {
                    updateModal(
                      ModalType.FAILED,
                      t("withdrawAndHarvest"),
                      receipt?.transactionHash,
                    )
                  }
                }}
              >
                {t("withdrawAndHarvest")}
              </Button>
            </div>
          ) : null}
        </ConfirmTransaction>
      </Modal>
      <FarmTabs {...props} handleModal={updateModal} />
      <div className={styles.stakeDetailsContainer}>
        <StakeDetails
          extraStakeDetailChild={
            <Flex justifyContent="space-between" alignItems="center">
              <IconButton
                aria-label="Harvest Rewards"
                variant="primary"
                size="lg"
                disabled={+rewardsEarned <= 0}
                onClick={() => updateModal(ModalType.APPROVE)}
                icon={<FaGift size="30px" />}
                title="Harvest Rewards"
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
                tokenName: lpTokenName,
                icon: lpTokenIcon,
                amount: formattedBalance,
              },
            ],
          }}
          stakedView={{
            title: t("deposited"),
            items: [
              {
                tokenName: lpTokenName,
                icon: lpTokenIcon,
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
      </div>
      <FarmFooter />
    </div>
  )
}

export default FarmPage
