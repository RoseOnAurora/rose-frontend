import React, { ReactElement } from "react"
import { Button } from "@chakra-ui/react"
import { SUPPORTED_CHAINS } from "../constants"
import styles from "./SupportedChains.module.scss"
import useAddNetworkToMetamask from "../hooks/useAddNetworkToMetamask"
import { useTranslation } from "react-i18next"

export default function SupportedChains(): ReactElement {
  const { t } = useTranslation()
  const addNetwork = useAddNetworkToMetamask()
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
            <div className={styles.chainInfo}>
              <p>
                <i>{val.rpc}</i>
              </p>
              <div className={styles.addNetwork}>
                <Button
                  variant="light"
                  size="md"
                  width="150px"
                  onClick={() => addNetwork(+key)}
                >
                  {t("addToWallet")}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
