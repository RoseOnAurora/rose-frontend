import "./ConfirmTransaction.scss"

import React, { ReactElement } from "react"
import { Text } from "@chakra-ui/react"
import classNames from "classnames"
import loadingGif from "../assets/loading.gif"
import { useTranslation } from "react-i18next"

export enum ModalType {
  CONFIRM = "confirm",
  FAILED = "failed",
  SUCCESS = "success",
}
export interface ConfirmTransactionProps {
  title?: string
  type?: ModalType
  description?: string
}
function ConfirmTransaction({
  title = "confirmTransaction",
  type = ModalType.CONFIRM,
  description = "",
}: ConfirmTransactionProps): ReactElement {
  const { t } = useTranslation()

  return (
    <div className="confirmTransaction">
      <h3
        className={classNames(
          { failed: type === ModalType.FAILED },
          { success: type === ModalType.SUCCESS },
        )}
      >
        {t(title)}
      </h3>
      {description ? <Text>{description}</Text> : null}
      {type === ModalType.CONFIRM ? (
        <img src={loadingGif} alt="loading..." className="loadingGif" />
      ) : null}
    </div>
  )
}

export default ConfirmTransaction
