import "./Web3Status.scss"

import React, { ReactElement, useEffect, useState } from "react"
import AccountDetails from "./AccountDetails"
import ConnectWallet from "./ConnectWallet"
import Identicon from "./Identicon"
import Modal from "./Modal"
import { useTranslation } from "react-i18next"
import { useWeb3React } from "@web3-react/core"

const WALLET_VIEWS = {
  OPTIONS: "options",
  ACCOUNT: "account",
}

function chainIdToName(chainId: number | undefined) {
  if (typeof chainId == undefined) {
    return ""
  }
  switch (chainId) {
    case 1313161555:
      return "Aurora Testnet"
      break
    case 1313161554:
      return "Aurora Mainnet"
      break
    default:
      return "Unknown Network"
  }
}

const Web3Status = (): ReactElement => {
  const { account, chainId } = useWeb3React()
  const [modalOpen, setModalOpen] = useState(false)
  const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT)
  const { t } = useTranslation()

  // always reset to account view
  useEffect(() => {
    if (modalOpen) {
      setWalletView(WALLET_VIEWS.ACCOUNT)
    }
  }, [modalOpen])

  return (
    <div className="walletStatus">
      <button type="button" onClick={(): void => setModalOpen(true)}>
        {account ? (
          <div className="hasAccount">
            <div className="network">{chainIdToName(chainId)}</div>
            <span className="address">
              {account.substring(0, 6)}...
              {account.substring(account.length - 4, account.length)}
            </span>

            <Identicon />
          </div>
        ) : (
          <div className="noAccount">{t("connectWallet")}</div>
        )}
      </button>
      <Modal isOpen={modalOpen} onClose={(): void => setModalOpen(false)}>
        {account && walletView === WALLET_VIEWS.ACCOUNT ? (
          <AccountDetails
            openOptions={() => setWalletView(WALLET_VIEWS.OPTIONS)}
          />
        ) : (
          <ConnectWallet onClose={(): void => setModalOpen(false)} />
        )}
      </Modal>
    </div>
  )
}

export default Web3Status
