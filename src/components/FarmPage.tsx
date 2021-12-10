import ConfirmTransaction, {
  ConfirmTransactionProps,
  ModalType,
} from "./ConfirmTransaction"
import React, { ReactElement, useState } from "react"
import { commify, formatBNToString } from "../utils"
import { BigNumber } from "@ethersproject/bignumber"
import { Button } from "@chakra-ui/react"
import FarmDetails from "./FarmDetails"
import FarmFooter from "./FarmFooter"
import { FarmName } from "../constants"
import FarmTabs from "./FarmTabs"
import HarvestRewards from "./HarvestRewards"
import Modal from "./Modal"
import styles from "./FarmPage.module.scss"
import useClaimReward from "../hooks/useClaimReward"
import useEarnedRewards from "../hooks/useEarnedRewards"
import useFarmExit from "../hooks/useFarmExit"
import { useTranslation } from "react-i18next"

interface Props {
  lpTokenName: string
  lpTokenIcon: string
  balance: BigNumber
  deposited: BigNumber
  farmName: FarmName
}

const FarmPage = (props: Props): ReactElement => {
  const formattedBalance = commify(formatBNToString(props.balance, 18, 5))
  const formattedDeposited = commify(formatBNToString(props.deposited, 18, 5))
  const rewardsEarned = useEarnedRewards(props.farmName)
  const exit = useFarmExit(props.farmName)
  const getReward = useClaimReward(props.farmName)
  const [
    currentModal,
    setCurrentModal,
  ] = useState<ConfirmTransactionProps | null>(null)

  const { t } = useTranslation()

  const updateModal = (modalType: ModalType, tx?: string): void => {
    switch (modalType) {
      case ModalType.CONFIRM:
        setCurrentModal({ type: ModalType.CONFIRM })
        break
      case ModalType.SUCCESS:
        setCurrentModal({
          type: ModalType.SUCCESS,
          title: t("successTitle"),
          description: t("txConfirmed", { tx }),
        })
        break
      case ModalType.FAILED:
        setCurrentModal({
          type: ModalType.FAILED,
          title: t("failedTitle"),
          description: t("txFailed", { tx }),
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
        <ConfirmTransaction
          description={currentModal?.description}
          title={currentModal?.title}
          type={currentModal?.type}
        >
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
                    updateModal(ModalType.FAILED, t("harvestRewards"))
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
                    updateModal(ModalType.FAILED, t("withdrawAndHarvest"))
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
      <FarmDetails
        balance={formattedBalance}
        deposited={formattedDeposited}
        lpTokenIcon={props.lpTokenIcon}
        lpTokenName={props.lpTokenName}
      />
      <HarvestRewards rewardBalance={rewardsEarned} handleModal={updateModal} />
      <FarmFooter />
    </div>
  )
}

export default FarmPage
