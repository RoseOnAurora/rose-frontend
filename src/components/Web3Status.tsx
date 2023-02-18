import { AppDispatch, AppState } from "../state"
import {
  Button,
  Center,
  Flex,
  IconButton,
  Spinner,
  Stack,
  Text,
  VStack,
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
import { SUPPORTED_CHAINS, SupportedChainId } from "../constants/chains"
import {
  addConnectedWallet,
  removeConnectedWallet,
  updateSelectedWallet,
} from "../state/user"
import AccountDetails from "./AccountDetails"
import { ChainId } from "../constants"
import ConnectWallet from "./ConnectWallet"
import { Connector } from "@web3-react/types"
import { HiSwitchHorizontal } from "react-icons/hi"
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
  DISCONNECTING,
  SWITCH_CHAIN,
  CHAINS,
  ERROR,
}

function chainIdToName(chainId?: number | undefined, account?: string) {
  if (typeof chainId == undefined || !account) {
    return ""
  }
  switch (chainId) {
    case ChainId.AURORA_MAINNET:
      return "Aurora"
    case ChainId.POLYGON:
      return "Polygon"
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
  const chainName = useMemo(
    () => chainIdToName(chainId, account),
    [chainId, account],
  )
  const { connectedWallets, selectedWallet } = useSelector(
    (state: AppState) => state.user,
  )
  const { type } = getWeb3Connection(connector)

  const Icon = useMemo(
    () => SUPPORTED_CHAINS[chainId as SupportedChainId]?.Icon,
    [chainId],
  )

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
        setModalView(Web3ModalView.ACCOUNT)
        const { type } = getWeb3Connection(c)
        dispatch(updateSelectedWallet({ connectionType: type }))
      } catch (e) {
        const error = e as { code: string | number; message: string }
        console.debug("web3-react connection error", error)
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
        modalView === Web3ModalView.CHAINS || (account && !chainName)
          ? Web3ModalView.CHAINS
          : account && chainName
          ? Web3ModalView.ACCOUNT
          : Web3ModalView.WALLETS,
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, chainName, modalOpen])

  return (
    <Flex alignItems="center" justifyContent="space-evenly">
      {account && chainName ? (
        <IconButtonPopover
          IconButtonProps={{
            "aria-label": "Connected Network",
            variant: "outline",
            size: "lg",
            title: chainIdToName(chainId, account),
            marginRight: "10px",
            w: "55px",
            borderRadius: "20px",
            icon: Icon && <Icon />,
          }}
          PopoverBodyContent={
            <Flex alignItems="center" gap={2}>
              <VStack spacing={1} alignItems="self-start">
                <Text color="gray.300" fontSize="14px" fontWeight={400}>
                  You are connected on the
                </Text>
                <Flex alignItems="center" marginTop="5px" gap="8px">
                  <Text fontSize="19px" fontWeight={700}>
                    {chainIdToName(chainId, account)} Network
                  </Text>
                  {Icon && <Icon />}
                </Flex>
              </VStack>
              <IconButton
                variant="outline"
                borderRadius="10px"
                m="5px"
                title="Switch Chain"
                icon={<HiSwitchHorizontal />}
                aria-label="switch chain"
                onClick={() => {
                  setModalView(Web3ModalView.CHAINS)
                  setModalOpen(true)
                }}
              />
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
          modalView === Web3ModalView.SWITCH_CHAIN
            ? t("switchChains")
            : modalView === Web3ModalView.DISCONNECTING
            ? t("disconnect")
            : modalView === Web3ModalView.CONNECTING
            ? "Connecting..."
            : modalView === Web3ModalView.ERROR
            ? "Error"
            : modalView === Web3ModalView.WALLETS
            ? t("connectWallet")
            : modalView === Web3ModalView.CHAINS || (account && !chainName)
            ? t("supportedChains")
            : account && chainName
            ? t("account")
            : "Unknown"
        }
        isCentered
        preserveScrollBarGap
      >
        {modalView === Web3ModalView.WALLETS ? (
          <ConnectWallet onActivation={handleActivation} />
        ) : modalView === Web3ModalView.ACCOUNT ? (
          <AccountDetails
            openOptions={() => setModalView(Web3ModalView.WALLETS)}
            deactivate={async (c: Connector) => {
              setModalView(Web3ModalView.DISCONNECTING)
              await handleDeactivation(c)
              setModalOpen(false)
            }}
          />
        ) : modalView === Web3ModalView.CONNECTING ||
          modalView === Web3ModalView.SWITCH_CHAIN ||
          modalView === Web3ModalView.DISCONNECTING ? (
          <Center>
            <Spinner />
          </Center>
        ) : modalView === Web3ModalView.CHAINS || (account && !chainName) ? (
          <SupportedChains
            openOptions={() => {
              setModalView(Web3ModalView.WALLETS)
            }}
            onSwitchChainStart={() => setModalView(Web3ModalView.SWITCH_CHAIN)}
            onSwitchChainSuccess={() => setModalView(Web3ModalView.ACCOUNT)}
            onSwitchChainFail={() => setModalView(Web3ModalView.ERROR)}
          />
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
                onClick={() => {
                  setModalView(Web3ModalView.WALLETS)
                }}
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
