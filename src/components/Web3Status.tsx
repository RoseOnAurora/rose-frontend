import { AppDispatch, AppState } from "../state"
import {
  Button,
  Center,
  Flex,
  Spinner,
  Stack,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react"
import { FaExclamationTriangle, FaWallet } from "react-icons/fa"
import React, {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  addConnectedWallet,
  removeConnectedWallet,
  updateSelectedWallet,
} from "../state/user"
import AccountDetails from "./AccountDetails"
import { AuroraIcon } from "../constants/icons"
import { ChainId } from "../constants"
import ConnectWallet from "./ConnectWallet"
import { Connector } from "@web3-react/types"
import { IconButtonPopover } from "./Popover"
import Identicon from "./Identicon"
import ModalWrapper from "./wrappers/ModalWrapper"
import SupportedChains from "./SupportedChains"
import { getWeb3Connection } from "../utils"
import { useDispatch } from "react-redux"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"
import { useWeb3React } from "@web3-react/core"

enum Web3ModalView {
  WALLETS,
  ACCOUNT,
  CONNECTING,
  CHAINS,
  ERROR,
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
      return ""
  }
}

const Web3Status = (): ReactElement => {
  // state
  const { account, chainId, connector } = useWeb3React()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalView, setModalView] = useState(Web3ModalView.ACCOUNT)
  const [retryConnector, setRetryConnetor] = useState<Connector>()
  const chainName = useMemo(() => chainIdToName(chainId), [chainId])
  const { connectedWallets, selectedWallet } = useSelector(
    (state: AppState) => state.user,
  )
  const { type } = getWeb3Connection(connector)

  // hooks
  const { t } = useTranslation()
  const padding = useBreakpointValue({ base: "20px", lg: "16px" })
  const color = useBreakpointValue({ base: "white", lg: "inherit" })
  const dispatch = useDispatch<AppDispatch>()

  // activation
  const handleActivation = useCallback(
    async (c: Connector) => {
      try {
        setModalView(Web3ModalView.CONNECTING)
        await c.activate()

        const { type } = getWeb3Connection(c)
        dispatch(updateSelectedWallet({ connectionType: type }))
      } catch (e) {
        const error = e as { code: string | number; message: string }
        console.debug("web3-react connection error", error)
        console.log(error)
        setModalView(Web3ModalView.ERROR)
        setRetryConnetor(c)
      }
    },
    [dispatch],
  )

  // deactivation
  const handleDeactivation = useCallback(
    async (c: Connector) => {
      if (c.deactivate) await c.deactivate()
      await c.resetState()

      dispatch(
        removeConnectedWallet({ connectionType: getWeb3Connection(c).type }),
      )
      dispatch(updateSelectedWallet(undefined))
    },
    [dispatch],
  )

  // try to update the selected wallet if we have other connected wallets
  useEffect(() => {
    const wallets = Object.values(connectedWallets)
    if (!selectedWallet && wallets.length) {
      dispatch(updateSelectedWallet(wallets[0]))
    }
  }, [connectedWallets, selectedWallet, dispatch])

  // update accounts
  useEffect(() => {
    if (account) {
      dispatch(addConnectedWallet({ connectionType: type, address: account }))
      dispatch(updateSelectedWallet({ connectionType: type, address: account }))
    } else {
      dispatch(updateSelectedWallet(undefined))
    }
  }, [type, account, dispatch])

  // always reset to account view
  useEffect(() => {
    if (modalOpen) {
      setModalView(
        account && chainName
          ? Web3ModalView.ACCOUNT
          : account && !chainName
          ? Web3ModalView.CHAINS
          : Web3ModalView.WALLETS,
      )
    }
  }, [account, chainName, modalOpen, chainId])

  return (
    <Flex alignItems="center" justifyContent="space-evenly">
      {account && chainName ? (
        <IconButtonPopover
          IconButtonProps={{
            "aria-label": "Connected Network",
            variant: "outline",
            size: "lg",
            title: chainIdToName(chainId),
            marginRight: "10px",
            w: "55px",
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
        w="fit-content"
        fontSize={{ base: "13px", lg: "15px" }}
        fontWeight={700}
        p={padding}
        color={color}
        onClick={(): void => setModalOpen(true)}
        rightIcon={
          account && chainName ? (
            <Identicon />
          ) : account && !chainName ? (
            <FaExclamationTriangle size="20px" />
          ) : (
            <FaWallet size="20px" />
          )
        }
      >
        {account && chainName ? (
          <Text fontWeight="inherit">
            {account.substring(0, 6)}...
            {account.substring(account.length - 4, account.length)}
          </Text>
        ) : account && !chainName ? (
          t("unsupported")
        ) : (
          t("connectWallet")
        )}
      </Button>
      <ModalWrapper
        isOpen={modalOpen}
        onClose={(): void => setModalOpen(false)}
        modalHeader={
          account && chainName
            ? t("account")
            : account && !chainName
            ? t("supportedChains")
            : modalView === Web3ModalView.CONNECTING
            ? "Connecting..."
            : modalView === Web3ModalView.ERROR
            ? "Error"
            : t("connectWallet")
        }
        isCentered
        preserveScrollBarGap
      >
        {modalView === Web3ModalView.CHAINS ? (
          <SupportedChains
            openOptions={() => setModalView(Web3ModalView.WALLETS)}
          />
        ) : modalView === Web3ModalView.ACCOUNT ? (
          <AccountDetails
            openOptions={() => setModalView(Web3ModalView.WALLETS)}
            deactivate={async (c: Connector) => {
              setModalView(Web3ModalView.WALLETS)
              await handleDeactivation(c)
              setModalOpen(false)
            }}
          />
        ) : modalView === Web3ModalView.WALLETS ? (
          <ConnectWallet onActivation={handleActivation} />
        ) : modalView === Web3ModalView.CONNECTING ? (
          <Center>
            <Spinner />
          </Center>
        ) : (
          <Stack spacing={5}>
            <Text>The connection attempt failed. Please try again</Text>
            <Button
              w="full"
              fontSize={{ base: "13px", lg: "15px" }}
              variant="outline"
              onClick={() => handleActivation(retryConnector || connector)}
            >
              Try Again
            </Button>
            <Flex justifySelf="start">
              <Button
                fontSize={{ base: "13px", lg: "15px" }}
                variant="ghost"
                onClick={() => setModalView(Web3ModalView.WALLETS)}
              >
                Back to wallet options
              </Button>
            </Flex>
          </Stack>
        )}
      </ModalWrapper>
    </Flex>
  )
}

export default Web3Status
