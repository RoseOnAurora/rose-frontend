import "./Web3Status.scss"

import { Box, Button, Flex, Icon } from "@chakra-ui/react"
import { FaExclamationTriangle, FaWallet } from "react-icons/fa"
import React, { ReactElement, useEffect, useState } from "react"
import AccountDetails from "./AccountDetails"
import { AppState } from "../state"
import { ChainId } from "../constants"
import ConnectWallet from "./ConnectWallet"
import { IconButtonPopover } from "./Popover"
import Identicon from "./Identicon"
import Modal from "./Modal"
import SupportedChains from "./SupportedChains"
import { injected } from "../connectors"
import { useSelector } from "react-redux"
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
    case ChainId.AURORA_TESTNET:
      return "Aurora Testnet"
    case ChainId.AURORA_MAINNET:
      return "Aurora"
    default:
      return "Unknown Network"
  }
}

const Web3Status = (): ReactElement => {
  const { account, chainId, error } = useWeb3React()
  const [modalOpen, setModalOpen] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false)
  void injected.isAuthorized().then((isAuthorized) => {
    setWalletConnected(isAuthorized)
  })
  const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT)
  const { t } = useTranslation()
  const { userDarkMode } = useSelector((state: AppState) => state.user)

  // always reset to account view
  useEffect(() => {
    if (modalOpen) {
      setWalletView(WALLET_VIEWS.ACCOUNT)
    }
  }, [modalOpen])

  return (
    <div className="walletStatus">
      {account ? (
        <IconButtonPopover
          IconButtonProps={{
            "aria-label": "Connected Network",
            variant: "outline",
            size: "md",
            title: chainIdToName(chainId),
            marginRight: "10px",
            icon: (
              <Icon viewBox="-5 -1 37 37">
                <path
                  d="M15 2.292a3.317 3.317 0 012.981 1.841l9.375 18.75a3.333 3.333 0 01-2.981 4.825H5.625a3.333 3.333 0 01-2.98-4.825l9.374-18.75A3.317 3.317 0 0115 2.292M15 0a5.625 5.625 0 00-5.031 3.108L.594 21.858A5.625 5.625 0 005.625 30h18.75a5.625 5.625 0 005.03-8.142l-9.374-18.75A5.625 5.625 0 0015 0z"
                  stroke={userDarkMode ? "rgba(120,214,75)" : "rgba(70,164,25)"}
                  fill={userDarkMode ? "rgba(120,214,75)" : "rgba(70,164,25)"}
                />
              </Icon>
            ),
          }}
          PopoverBodyContent={
            <Flex flexDirection="column">
              <Flex justifyContent="space-between" fontSize="15px">
                You are connected on the
              </Flex>
              <Flex
                fontSize="21px"
                fontWeight="700"
                alignItems="center"
                marginTop="5px"
              >
                <Box>{chainIdToName(chainId)} Network &nbsp;</Box>
                <Icon viewBox="-5 -1 37 37">
                  <path
                    d="M15 2.292a3.317 3.317 0 012.981 1.841l9.375 18.75a3.333 3.333 0 01-2.981 4.825H5.625a3.333 3.333 0 01-2.98-4.825l9.374-18.75A3.317 3.317 0 0115 2.292M15 0a5.625 5.625 0 00-5.031 3.108L.594 21.858A5.625 5.625 0 005.625 30h18.75a5.625 5.625 0 005.03-8.142l-9.374-18.75A5.625 5.625 0 0015 0z"
                    stroke={
                      userDarkMode ? "rgba(120,214,75)" : "rgba(70,164,25)"
                    }
                    fill={userDarkMode ? "rgba(120,214,75)" : "rgba(70,164,25)"}
                  />
                </Icon>
              </Flex>
            </Flex>
          }
        />
      ) : null}
      <Button
        variant="outline"
        lineHeight="unset"
        size="md"
        onClick={(): void => setModalOpen(true)}
        rightIcon={
          account ? (
            <Identicon />
          ) : error || walletConnected ? (
            <FaExclamationTriangle size="20px" />
          ) : (
            <FaWallet size="20px" />
          )
        }
      >
        {account ? (
          <span className="userAddress">
            {account.substring(0, 6)}...
            {account.substring(account.length - 4, account.length)}
          </span>
        ) : error || walletConnected ? (
          t("unsupported")
        ) : (
          t("connectWallet")
        )}
      </Button>
      <Modal isOpen={modalOpen} onClose={(): void => setModalOpen(false)}>
        {account && walletView === WALLET_VIEWS.ACCOUNT ? (
          <AccountDetails
            openOptions={() => setWalletView(WALLET_VIEWS.OPTIONS)}
          />
        ) : (error || walletConnected) &&
          walletView !== WALLET_VIEWS.OPTIONS ? (
          <SupportedChains
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
