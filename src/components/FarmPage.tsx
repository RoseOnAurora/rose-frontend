import ConfirmTransaction, {
  ConfirmTransactionProps,
  ModalType,
} from "./ConfirmTransaction"
import React, { ReactElement, useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import { commify, formatBNToShortString, formatBNToString } from "../utils"
import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import { Button } from "@chakra-ui/react"
import FarmFooter from "./FarmFooter"
import { FarmName } from "../constants"
import FarmTabs from "./FarmTabs"
import HarvestRewards from "./HarvestRewards"
import Modal from "./Modal"
import StakeDetails from "./StakeDetails"
import { getEtherscanLink } from "../utils/getEtherscanLink"
import styles from "./FarmPage.module.scss"
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
  const rewardsEarned = useEarnedRewards(farmName)
  const exit = useFarmExit(farmName)
  const getReward = useClaimReward(farmName)
  const [
    currentModal,
    setCurrentModal,
  ] = useState<ConfirmTransactionProps | null>(null)
  const { farmStats } = useSelector((state: AppState) => state.application)
  const tvl = farmStats?.[farmName]?.tvl
  const formattedTvl = tvl
    ? `$${formatBNToShortString(BigNumber.from(tvl), 18)}`
    : "-"
  const apr = farmStats?.[farmName]?.apr || "-"
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
          description:
            "Please choose between harvest or withdraw and harvest (claim everything from this farm).",
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
          {currentModal?.type === ModalType.APPROVE ? (
            <div className={styles.approveButtons}>
              <Button
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
      <StakeDetails
        balanceView={{
          title: t("balance"),
          tokenName: lpTokenName,
          icon: lpTokenIcon,
          amount: formattedBalance,
        }}
        stakedView={{
          title: t("deposited"),
          tokenName: lpTokenName,
          icon: lpTokenIcon,
          amount: formattedDeposited,
        }}
        stats={[
          {
            statLabel: "TVL",
            statValue: formattedTvl,
          },
          {
            statLabel: "APR",
            statValue: apr,
          },
        ]}
      />
      <HarvestRewards rewardBalance={rewardsEarned} handleModal={updateModal} />
      <FarmFooter />
    </div>
  )
}

export default FarmPage
