import ConfirmTransaction, {
  ConfirmTransactionProps,
  ModalType,
} from "./ConfirmTransaction"
import React, { ReactElement, useState } from "react"
import { commify, formatBNToString } from "../utils"
import { BigNumber } from "@ethersproject/bignumber"
import FarmDetails from "./FarmDetails"
import FarmFooter from "./FarmFooter"
import FarmTabs from "./FarmTabs"
import HarvestRewards from "./HarvestRewards"
import Modal from "./Modal"
import { PoolName } from "../constants"
import styles from "./FarmPage.module.scss"
import useEarnedRewards from "../hooks/useEarnedRewards"
import useFarmExit from "../hooks/useFarmExit"
import { useTranslation } from "react-i18next"

interface Props {
  lpTokenName: string
  lpTokenIcon: string
  balance: BigNumber
  deposited: BigNumber
  poolName: PoolName
}

const FarmPage = (props: Props): ReactElement => {
  const formattedBalance = commify(formatBNToString(props.balance, 18, 6))
  const formattedDeposited = commify(formatBNToString(props.deposited, 18, 6))
  const rewardsEarned = useEarnedRewards()
  const exit = useFarmExit()
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
        />
      </Modal>
      <FarmTabs {...props} handleModal={updateModal} />
      <FarmDetails
        balance={formattedBalance}
        deposited={formattedDeposited}
        lpTokenIcon={props.lpTokenIcon}
        lpTokenName={props.lpTokenName}
      />
      <HarvestRewards rewardBalance={rewardsEarned} handleModal={updateModal} />
      <FarmFooter
        deposited={props.deposited}
        hasRewards={+rewardsEarned > 0}
        handler={exit}
        handleModal={updateModal}
      ></FarmFooter>
    </div>
  )
}

export default FarmPage
