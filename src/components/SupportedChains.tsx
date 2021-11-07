import React, { ReactElement } from "react"
import { SUPPORTED_CHAINS } from "../constants"
import styles from "./SupportedChains.module.scss"
import { useTranslation } from "react-i18next"

export default function SupportedChains(): ReactElement {
  const { t } = useTranslation()
  return (
    <div className={styles.supportedChains}>
      <h3>{t("supportedChains")}</h3>
      <div className={styles.chainList}>
        {Object.entries(SUPPORTED_CHAINS).map(([key, val], index) => (
          <div key={index} className={styles.chain}>
            <div className={styles.chainInfo}>
              <h4>{val.name}</h4>
              <span>{key}</span>
            </div>
            <p>
              <i>{val.rpc}</i>
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
