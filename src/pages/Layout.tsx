import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Center,
  Flex,
  Spinner,
} from "@chakra-ui/react"
import { Outlet, useLocation } from "react-router-dom"
import React, { ReactElement, Suspense } from "react"
import { ChainId } from "../constants"
import { EthIcon } from "../constants/icons"
import Footer from "../components/nav/Footer"
import Header from "../components/nav/Header"
import { SUPPORTED_CHAINS } from "../constants/chains"
import useAddNetworkToMetamask from "../hooks/useAddNetworkToMetamask"
import { useWeb3React } from "@web3-react/core"

const Layout = ({
  children,
}: React.PropsWithChildren<unknown>): ReactElement => {
  const { pathname } = useLocation()
  const { chainId = 0, account } = useWeb3React()
  const addNetwork = useAddNetworkToMetamask()

  return (
    <Box minH="100vh" bg="bgDark" color="white" fontSize="16px" pb="300px">
      <Suspense
        fallback={
          <Center h="100vh">
            <Spinner size="xl" color="red.400" />
          </Center>
        }
      >
        {account && !(chainId in SUPPORTED_CHAINS) && (
          <Alert variant="top-accent" status="error">
            <AlertIcon />
            <AlertTitle>Unsupported Chain</AlertTitle>
            <AlertDescription>
              Your experience may be degraded.
            </AlertDescription>
          </Alert>
        )}
        {account && chainId !== ChainId.MAINNET && (
          <Alert
            variant="top-accent"
            status="info"
            flexWrap="wrap"
            alignItems={{ base: "start", md: "center" }}
            flexDir={{ base: "column", md: "row" }}
            gap={6}
          >
            <Flex align="center" flexWrap="wrap">
              <AlertIcon />
              <EthIcon fontSize="21px" mr={1} />
              <AlertTitle>Ethereum Mainnet is now supported!</AlertTitle>
              <AlertDescription>
                Switch to Mainnet and try out our new Earn Product.
              </AlertDescription>
            </Flex>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => addNetwork(ChainId.MAINNET)}
            >
              Switch to Ethereum
            </Button>
          </Alert>
        )}
        <Header activeTab={pathname} />
        {children}
        <Footer />
        <Outlet />
      </Suspense>
    </Box>
  )
}

export default Layout
