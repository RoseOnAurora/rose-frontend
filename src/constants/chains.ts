import { AuroraIcon, EthIcon } from "./icons"
import { ComponentWithAs, IconProps } from "@chakra-ui/react"
import { ChainId } from "."

export interface ChainInfo {
  name: string
  rpc: string[]
  currency: {
    name: string
    symbol: string
    decimals: number
  }
  Icon?: ComponentWithAs<"svg", IconProps>
}

export type SupportedChainId = ChainId.AURORA_MAINNET | ChainId.MAINNET
export const SUPPORTED_CHAINS: {
  [chainId in SupportedChainId]: ChainInfo
} = {
  [ChainId.AURORA_MAINNET]: {
    name: "Aurora",
    rpc: ["https://mainnet.aurora.dev"],
    currency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    Icon: AuroraIcon,
  },
  [ChainId.MAINNET]: {
    name: "Ethereum",
    rpc: ["https://eth.drpc.org"],
    currency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    Icon: EthIcon,
  },
}
