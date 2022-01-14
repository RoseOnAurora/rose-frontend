import React, { ReactElement } from "react"
import AnimatingNumber from "./AnimateNumber"
import { Button } from "@chakra-ui/react"
import { ModalType } from "./ConfirmTransaction"
import styles from "./HarvestRewards.module.scss"
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
  return (
    <div className={styles.harvestRewards}>
      <div className={styles.harvestRewardsContainer}>
        <div className={styles.harvestTitle}>
          <h4 className={styles.title}>{t("rewards")}</h4>
        </div>
        <div className={styles.rewardBalance}>
          <AnimatingNumber
            value={+rewardBalance}
            precision={+rewardBalance ? 5 : 1}
          ></AnimatingNumber>
          <h4 className={styles.title}>&nbsp;ROSE</h4>
        </div>
        <div className={styles.buttonWrapper}>
          <Button
            variant="primary"
            size="lg"
            width="270px"
            disabled={+rewardBalance <= 0}
            onClick={() => handleModal(ModalType.APPROVE)}
          >
            {t("harvestRewards")}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default HarvestRewards
