import { Button, Flex, Text, useBreakpointValue } from "@chakra-ui/react"
import { FaExclamationTriangle, FaWallet } from "react-icons/fa"
import React, { ReactElement, useEffect, useState } from "react"
import AccountDetails from "./AccountDetails"
import { AuroraIcon } from "../constants/icons"
import { ChainId } from "../constants"
import ConnectWallet from "./ConnectWallet"
import { IconButtonPopover } from "./Popover"
import Identicon from "./Identicon"
import ModalWrapper from "./wrappers/ModalWrapper"
import SupportedChains from "./SupportedChains"
import { injected } from "../connectors"
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
  const padding = useBreakpointValue({ base: "20px", lg: "16px" })
  const color = useBreakpointValue({ base: "white", lg: "inherit" })

  // always reset to account view
  useEffect(() => {
    if (modalOpen) {
      setWalletView(WALLET_VIEWS.ACCOUNT)
    }
  }, [modalOpen])

  return (
    <Flex alignItems="center" justifyContent="space-evenly">
      {account ? (
        <IconButtonPopover
          IconButtonProps={{
            "aria-label": "Connected Network",
            variant: "outline",
            size: "lg",
            title: chainIdToName(chainId),
            marginRight: "10px",
            w: "60px",
            borderRadius: "20px",
            icon: <AuroraIcon />,
          }}
          PopoverBodyContent={
            <Flex flexDirection="column">
              <Text color="gray.300" fontSize="14px" fontWeight={400}>
                You are connected on the
              </Text>
              <Flex alignItems="center" marginTop="5px" gap="8px">
                <Text fontSize="19px" fontWeight={700}>
                  {chainIdToName(chainId)} Network
                </Text>
                <AuroraIcon />
              </Flex>
            </Flex>
          }
        />
      ) : null}
      <Button
        variant="primary"
        boxShadow="0px 5px 10px rgba(220, 51, 24, 0.5)"
        lineHeight="unset"
        size="lg"
        fontWeight={700}
        p={padding}
        color={color}
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
          <Text fontWeight="inherit">
            {account.substring(0, 6)}...
            {account.substring(account.length - 4, account.length)}
          </Text>
        ) : error || walletConnected ? (
          t("unsupported")
        ) : (
          t("connectWallet")
        )}
      </Button>
      <ModalWrapper
        isOpen={modalOpen}
        onClose={(): void => setModalOpen(false)}
        modalHeader={
          account && walletView === WALLET_VIEWS.ACCOUNT
            ? t("account")
            : (error || walletConnected) && walletView !== WALLET_VIEWS.OPTIONS
            ? t("supportedChains")
            : t("connectWallet")
        }
        isCentered
        preserveScrollBarGap
      >
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
      </ModalWrapper>
    </Flex>
  )
}

export default Web3Status
