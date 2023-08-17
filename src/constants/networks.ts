import { ChainId } from "."
import { SupportedChainId } from "./chains"

const NETWORK_URL =
  process.env.REACT_APP_NETWORK_URL ?? "https://mainnet.aurora.dev"

export const NETWORK_CHAIN_ID: number = parseInt(
  process.env.REACT_APP_CHAIN_ID ?? "1313161554",
)

export const RPC_URLS: { [chainId in SupportedChainId]: string } = {
  [ChainId.AURORA_MAINNET]: NETWORK_URL,
  [ChainId.MAINNET]: "https://eth.drpc.org",
}
