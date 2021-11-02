import "./SuccessTransaction.scss"

import React, { ReactElement } from "react"
import { useTranslation } from "react-i18next"

function SuccessTransaction(): ReactElement {
  const { t } = useTranslation()

  return (
    <div className="successTransaction">
      <h3>{t("Success!")}</h3>
    </div>
  )
}

export default SuccessTransaction
