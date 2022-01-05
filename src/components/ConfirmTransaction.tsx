import "./ConfirmTransaction.scss"

import React, { ReactElement, ReactNode } from "react"
import { Text } from "@chakra-ui/react"
import classNames from "classnames"
import loadingGif from "../assets/loading.gif"
import { useTranslation } from "react-i18next"

export enum ModalType {
  APPROVE = "approve",
  CONFIRM = "confirm",
  FAILED = "failed",
  SUCCESS = "success",
  REVIEW = "review",
}
export interface ConfirmTransactionProps {
  title?: string
  type?: ModalType
  description?: string
  children?: ReactNode
}
function ConfirmTransaction({
  title = "confirmTransaction",
  type = ModalType.CONFIRM,
  description = "",
  children,
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
      {children}
    </div>
  )
}

export default ConfirmTransaction
