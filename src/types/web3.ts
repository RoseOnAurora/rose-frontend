import { ComponentWithAs, IconProps } from "@chakra-ui/react"
import { Connector } from "@web3-react/types"
import { Web3ReactHooks } from "@web3-react/core"

/**
 * Supported Web3 connection types
 */
export enum ConnectionType {
  INJECTED = "INJECTED",
  WALLET_CONNECT = "WALLET_CONNECT",
  NETWORK = "NETWORK",
}

/**
 * Web3 connection interface
 * - type of connection
 * - the connector being used (i.e. metamask/injected)
 * - hooks to do stuff (i.e. determine if connection is active)
 * - human-readable name of the connection
 */
export interface Web3Connection<T = Connector> {
  type: ConnectionType
  connector: T
  hooks: Web3ReactHooks
  name: string
  Icon: ComponentWithAs<"svg", IconProps> | null
}
