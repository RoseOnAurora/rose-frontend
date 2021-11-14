import React, { ReactElement } from "react"
import { Button } from "@chakra-ui/react"
import { SUPPORTED_CHAINS } from "../constants"
import { isMobile } from "react-device-detect"
import styles from "./SupportedChains.module.scss"
import useAddNetworkToMetamask from "../hooks/useAddNetworkToMetamask"
import { useTranslation } from "react-i18next"

interface Props {
  openOptions: () => void
}

export default function SupportedChains({ openOptions }: Props): ReactElement {
  const { t } = useTranslation()
  const addNetwork = useAddNetworkToMetamask()
  return (
    <div className={styles.supportedChains}>
      <h3>{t("supportedChains")}</h3>
      <h5>{t("supportedChainsDescription")}</h5>
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
              {isMobile ? null : (
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
              )}
            </div>
          </div>
        ))}
      </div>
      <button
        className={styles.textStyle}
        onClick={() => {
          openOptions()
        }}
      >
        {/* change Icon */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={styles.buttonGroupIcon}
        >
          <g clipPath="url(#clip1)">
            <path d="M6.07194 14.0719C6.19014 14.1901 6.35016 14.2568 6.5168 14.2574C6.68343 14.2579 6.84304 14.1922 6.9605 14.0747L13.2552 7.78006L13.2659 11.2235C13.2693 11.3883 13.3372 11.5455 13.4551 11.6613C13.573 11.7772 13.7313 11.8424 13.8961 11.8429C14.0608 11.8434 14.2188 11.7792 14.3359 11.6641C14.453 11.549 14.52 11.3922 14.5223 11.2274L14.5065 6.26722C14.5061 6.14303 14.4688 6.02154 14.3995 5.91808C14.3301 5.81462 14.2318 5.73384 14.1169 5.68595C14.0021 5.63805 13.8758 5.62518 13.754 5.64897C13.6323 5.67275 13.5206 5.73212 13.433 5.81959L6.06916 13.1834C5.9517 13.3008 5.88601 13.4605 5.88653 13.6271C5.88705 13.7937 5.95374 13.9537 6.07194 14.0719ZM10.2919 2.6785L2.92808 10.0423C2.84046 10.1298 2.72873 10.1891 2.60699 10.2129C2.48525 10.2367 2.35897 10.2238 2.24409 10.1759C2.12922 10.128 2.0309 10.0473 1.96156 9.9438C1.89221 9.84034 1.85496 9.71885 1.85449 9.59466L1.83869 4.63443C1.83698 4.55101 1.8519 4.46819 1.88258 4.3908C1.91326 4.31341 1.95908 4.243 2.01737 4.18368C2.07566 4.12435 2.14526 4.07731 2.2221 4.04529C2.29894 4.01327 2.38148 3.99691 2.46491 3.99717C2.54833 3.99743 2.63098 4.01431 2.70802 4.04681C2.78506 4.07931 2.85495 4.12679 2.91362 4.18648C2.97228 4.24616 3.01854 4.31686 3.04971 4.39445C3.08087 4.47203 3.0963 4.55495 3.09512 4.63836L3.10588 8.08182L9.40054 1.78716C9.518 1.6697 9.6776 1.604 9.84424 1.60452C10.0109 1.60505 10.1709 1.67174 10.2891 1.78994C10.4073 1.90814 10.474 2.06816 10.4745 2.23479C10.475 2.40143 10.4093 2.56103 10.2919 2.6785Z" />
          </g>
          <defs>
            <clipPath id="clip1">
              <rect width="16" height="16" />
            </clipPath>
          </defs>
        </svg>
        {t("changeAccount")}
      </button>
    </div>
  )
}
