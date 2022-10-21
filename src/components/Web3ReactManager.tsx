import React, { ReactElement } from "react"
import { Web3ReactProvider } from "@web3-react/core"
import useEagerlyConnect from "../hooks/useEagerlyConnect"
import useSelectedConnection from "../hooks/useSelectedConnection"
import useWeb3Connections from "../hooks/useWeb3Connections"

const WrappedWeb3ReactProvider = ({
  children,
}: React.PropsWithChildren): ReactElement => {
  // try to eagerly connect first
  useEagerlyConnect()

  // get web3 connections
  const web3Connections = useWeb3Connections()

  // get the selected connection
  const selectedConnection = useSelectedConnection()

  // return the web3 provider
  return (
    <Web3ReactProvider
      connectors={web3Connections.map(({ connector, hooks }) => [
        connector,
        hooks,
      ])}
      connectorOverride={selectedConnection?.connector}
    >
      {children}
    </Web3ReactProvider>
  )
}

export default WrappedWeb3ReactProvider
