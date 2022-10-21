import { ConnectionType, Web3Connection } from "../types/web3"
import { MetamaskIcon, WalletConnectIcon } from "./icons"
import { NETWORK_CHAIN_ID, RPC_URLS } from "./networks"
import { MetaMask } from "@web3-react/metamask"
import { Network } from "@web3-react/network"
import { WalletConnect } from "@web3-react/walletconnect"
import { initializeConnector } from "@web3-react/core"

/**
 * Metamask (aka injected) initialization
 */
const [injected, injectedHooks] = initializeConnector<MetaMask>(
  (actions) => new MetaMask({ actions }),
)

// the injected web3 connection
export const injectedConnection: Web3Connection<MetaMask> = {
  type: ConnectionType.INJECTED,
  connector: injected,
  hooks: injectedHooks,
  name: "Metamask Wallet",
  Icon: MetamaskIcon,
}

/**
 * WalletConnect initialization
 */
const [walletconnect, walletconnectHooks] = initializeConnector<WalletConnect>(
  (actions) =>
    new WalletConnect({
      actions,
      options: {
        rpc: RPC_URLS,
        qrcode: true,
      },
    }),
)

// the walletconnect web3 connection
export const walletconnectConnection: Web3Connection<WalletConnect> = {
  type: ConnectionType.WALLET_CONNECT,
  connector: walletconnect,
  hooks: walletconnectHooks,
  name: "WalletConnect",
  Icon: WalletConnectIcon,
}

/**
 * Network connection
 */
const [network, networkHooks] = initializeConnector<Network>(
  (actions) =>
    new Network({
      actions,
      urlMap: RPC_URLS,
      defaultChainId: NETWORK_CHAIN_ID,
    }),
)

// the network web3 connection
export const networkConnection: Web3Connection<Network> = {
  type: ConnectionType.NETWORK,
  connector: network,
  hooks: networkHooks,
  name: "Network",
  Icon: null, // network doesnt need an icon
}

// all connections
export const CONNECTIONS = [
  networkConnection,
  injectedConnection,
  walletconnectConnection,
]
