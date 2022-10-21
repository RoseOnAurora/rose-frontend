import { Button, Flex, Link, Stack, Text } from "@chakra-ui/react"
import { MetamaskIcon, WalletConnectIcon } from "../constants/icons"
import React, { ReactElement } from "react"
import {
  injectedConnection,
  walletconnectConnection,
} from "../constants/connection"
import { isIE, isMobile, isSafari } from "react-device-detect"
import { Connector } from "@web3-react/types"
import { getIsMetamaskWallet } from "../utils"
import { useTranslation } from "react-i18next"

interface Props {
  onActivation: (c: Connector) => Promise<void>
}

function ConnectWallet({ onActivation }: Props): ReactElement {
  // state
  const isMetamaskWallet = getIsMetamaskWallet()
  const requiresMetamaskInstall =
    !isMetamaskWallet && !isMobile && !isIE && !isSafari
  const isMetamaskWalletBrowser = isMetamaskWallet && isMobile

  // hooks
  const { t } = useTranslation()

  return (
    <Stack spacing="20px">
      {requiresMetamaskInstall ? (
        <Button
          as={Link}
          variant="outline"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          fontSize="18px"
          rightIcon={<MetamaskIcon w="10" h="10" />}
          href="https://metamask.io/"
          title="Install Metamask"
          target="_blank"
          rel="noreferrer"
        >
          Install Metamask
        </Button>
      ) : isMetamaskWallet ? (
        <Button
          variant="outline"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          fontSize="18px"
          rightIcon={<MetamaskIcon w="10" h="10" />}
          onClick={() => onActivation(injectedConnection.connector)}
          title="Activate Metamask"
        >
          Metamask Wallet
        </Button>
      ) : null}
      {!isMetamaskWalletBrowser && (
        <Button
          variant="outline"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          fontSize="18px"
          rightIcon={<WalletConnectIcon w="10" h="10" />}
          onClick={() => onActivation(walletconnectConnection.connector)}
          title="Activate WalletConnect"
        >
          WalletConnect
        </Button>
      )}
      <Flex alignItems="center" justifyContent="start" gap={3} pt={2} pl={2}>
        <Text as="i" fontSize="15px" color="gray.300" fontWeight={400}>
          {t("dontHaveWallet")}
        </Text>
        <Button
          as="a"
          color="red.500"
          fontWeight={700}
          fontSize="16px"
          variant="unstyled"
          display="flex"
          alignItems="center"
          href="https://ethereum.org/en/wallets/"
          target="_blank"
          rel="noreferrer"
        >
          {t("getWallet")}
        </Button>
      </Flex>
    </Stack>
  )
}

export default ConnectWallet
