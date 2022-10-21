import {
  injectedConnection,
  networkConnection,
  walletconnectConnection,
} from "../constants/connection"
import { MetaMask } from "@web3-react/metamask"
import { Network } from "@web3-react/network"
import { WalletConnect } from "@web3-react/walletconnect"
import { Web3Connection } from "../types/web3"

const useWeb3Connections = (): [
  Web3Connection<MetaMask>,
  Web3Connection<WalletConnect>,
  Web3Connection<Network>,
] => {
  return [injectedConnection, walletconnectConnection, networkConnection]
}

export default useWeb3Connections
