import { AppDispatch, AppState } from "../state"
import { activateConnection, getWeb3Connection } from "../utils"
import { useDispatch, useSelector } from "react-redux"
import { Web3Connection } from "../types/web3"
import { networkConnection } from "../constants/connection"
import { updateSelectedWallet } from "../state/user"
import { useEffect } from "react"

const useEagerlyConnect = (): void => {
  const dispatch = useDispatch<AppDispatch>()

  const selectedWallet = useSelector(
    (state: AppState) => state.user.selectedWallet,
  )

  let selectedConnection: Web3Connection | undefined
  if (selectedWallet) {
    try {
      selectedConnection = getWeb3Connection(selectedWallet.connectionType)
    } catch {
      dispatch(updateSelectedWallet(undefined))
    }
  }

  useEffect(() => {
    void activateConnection(networkConnection.connector)

    if (selectedConnection) {
      void activateConnection(selectedConnection.connector)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}

export default useEagerlyConnect
