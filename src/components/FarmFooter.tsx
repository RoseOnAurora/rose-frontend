import React, { ReactElement } from "react"
import BackButton from "./BackButton"
import { BigNumber } from "@ethersproject/bignumber"
import Button from "./Button"
import { Zero } from "@ethersproject/constants"
import styles from "./FarmFooter.module.scss"
import { useTranslation } from "react-i18next"

interface Props {
  deposited: BigNumber
}

const FarmFooter = (props: Props): ReactElement => {
  const { t } = useTranslation()
  return (
    <div className={styles.farmFooter}>
      <BackButton
        route="/pools"
        wrapperClass={styles.goBack}
        buttonText="Go back to pools"
      />
      <Button
        kind="secondary"
        size="xlarge"
        disabled={props.deposited.lte(Zero)}
      >
        {t("withdrawAndHarvest")}
      </Button>
    </div>
  )
}

export default FarmFooter
