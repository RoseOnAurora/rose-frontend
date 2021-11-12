import React, { ReactElement } from "react"
import { Button } from "@chakra-ui/react"
import { ModalType } from "./ConfirmTransaction"
import styles from "./HarvestRewards.module.scss"
import useClaimReward from "../hooks/useClaimReward"
import { useTranslation } from "react-i18next"

interface Props {
  rewardBalance: string
  handleModal: (modalType: ModalType, tx?: string | undefined) => void
}

const HarvestRewards = ({
  rewardBalance,
  handleModal,
}: Props): ReactElement => {
  const { t } = useTranslation()
  const getReward = useClaimReward()
  return (
    <div className={styles.harvestRewards}>
      <div className={styles.harvestTitle}>
        <h4 className={styles.title}>{t("rewards")}</h4>
      </div>
      <div className={styles.rewardBalance}>
        <h4 className={styles.title}>{rewardBalance}</h4>
      </div>
      <div className={styles.buttonWrapper}>
        <Button
          variant="primary"
          size="lg"
          width="270px"
          disabled={+rewardBalance <= 0}
          onClick={async () => {
            handleModal(ModalType.CONFIRM)
            const receipt = await getReward()
            if (receipt?.status) {
              handleModal(ModalType.SUCCESS, t("harvestRewards"))
            } else {
              handleModal(ModalType.FAILED, t("harvestRewards"))
            }
          }}
        >
          {t("harvestReward")}
        </Button>
      </div>
    </div>
  )
}

export default HarvestRewards
