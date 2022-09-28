import { Button, Flex, Stack, Text } from "@chakra-ui/react"
import { ErrorObj, SUPPORTED_WALLETS } from "../constants"
import React, { ReactElement } from "react"
import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core"
import { find, map } from "lodash"
import useChakraToast, { TransactionType } from "../hooks/useChakraToast"
import { UserRejectedRequestError as InjectedUserRejectedRequestError } from "@web3-react/injected-connector"
import { UserRejectedRequestError } from "@web3-react/walletconnect-connector"
import { useTranslation } from "react-i18next"

interface Props {
  onClose: () => void
}

function ConnectWallet({ onClose }: Props): ReactElement {
  const { t } = useTranslation()
  const toast = useChakraToast()
  const { activate } = useWeb3React()

  return (
    <Stack spacing="20px">
      {map(SUPPORTED_WALLETS, ({ Icon, connector, name }, index) => (
        <Button
          key={index}
          variant="outline"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          fontSize="18px"
          rightIcon={<Icon w="10" h="10" />}
          onClick={(): void => {
            toast.transactionPending({
              txnType: TransactionType.CONNECT,
            })
            activate(connector, undefined, true)
              .then(() => {
                const { name } =
                  find(SUPPORTED_WALLETS, ["connector", connector]) || {}
                toast.transactionSuccess({
                  txnType: TransactionType.CONNECT,
                  description: `Connected with ${name || "unknown connector"}.`,
                })
              })
              .catch((error: ErrorObj) => {
                if (error instanceof UnsupportedChainIdError) {
                  void activate(connector) // a little janky...can't use setError because the connector isn't set
                } else if (
                  error instanceof InjectedUserRejectedRequestError ||
                  error instanceof UserRejectedRequestError
                ) {
                  toast.transactionWarning({
                    title: `${TransactionType.CONNECT} Transaction Aborted!`,
                    description: "User rejected the request.",
                  })
                } else {
                  toast.transactionFailed({
                    txnType: TransactionType.CONNECT,
                    error,
                  })
                }
              })
            onClose()
          }}
        >
          {name}
        </Button>
      ))}
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
