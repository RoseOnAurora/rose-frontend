import React, { ReactElement } from "react"
import BackButton from "./BackButton"
import { BigNumber } from "@ethersproject/bignumber"
import Button from "./Button"
import { ContractReceipt } from "@ethersproject/contracts"
import { ModalType } from "./ConfirmTransaction"
import { Zero } from "@ethersproject/constants"
import styles from "./FarmFooter.module.scss"
import { useTranslation } from "react-i18next"

interface Props {
  deposited: BigNumber
  handler: () => Promise<ContractReceipt | void>
  handleModal: (modalType: ModalType, tx?: string | undefined) => void
}

const FarmFooter = (props: Props): ReactElement => {
  const { t } = useTranslation()
  const { deposited, handler, handleModal } = props
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
        disabled={deposited.lte(Zero)}
        onClick={async () => {
          handleModal(ModalType.CONFIRM)
          const receipt = await handler()
          if (receipt?.status) {
            handleModal(ModalType.SUCCESS, t("withdrawAndHarvest"))
          } else {
            handleModal(ModalType.FAILED, t("withdrawAndHarvest"))
          }
        }}
      >
        {t("withdrawAndHarvest")}
      </Button>
    </div>
  )
}

export default FarmFooter
