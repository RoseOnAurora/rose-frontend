import "./FailedTransaction.scss"

import React, { ReactElement } from "react"
import { Text } from "@chakra-ui/react"
import { useTranslation } from "react-i18next"

interface Props {
  failedDescription: string
}
function FailedTransaction({ failedDescription }: Props): ReactElement {
  const { t } = useTranslation()

  return (
    <div className="failedTransaction">
      <h3>{t("Transaction Failed.")}</h3>
      <Text>{failedDescription}</Text>
    </div>
  )
}

export default FailedTransaction
