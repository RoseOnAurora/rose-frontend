import { AuroraIcon, PolygonIcon } from "./icons"
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

export type SupportedChainId = ChainId.AURORA_MAINNET | ChainId.POLYGON
export const SUPPORTED_CHAINS: {
  [chainId in SupportedChainId]: ChainInfo
} = {
  [ChainId.AURORA_MAINNET]: {
    name: "Aurora Mainnet",
    rpc: ["https://mainnet.aurora.dev"],
    currency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    Icon: AuroraIcon,
  },
  [ChainId.POLYGON]: {
    name: "Polygon",
    rpc: ["https://rpc-mainnet.maticvigil.com"],
    currency: {
      name: "Matic",
      symbol: "MATIC",
      decimals: 18,
    },
    Icon: PolygonIcon,
  },
}
