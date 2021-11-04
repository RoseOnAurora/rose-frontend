import React, { ReactElement } from "react"
import { Button } from "@chakra-ui/react"
import styles from "./HarvestRewards.module.scss"
import { useTranslation } from "react-i18next"

interface Props {
  rewardBalance: string
}

const HarvestRewards = ({ rewardBalance }: Props): ReactElement => {
  const { t } = useTranslation()
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
        >
          {t("harvestReward")}
        </Button>
      </div>
    </div>
  )
}

export default HarvestRewards
