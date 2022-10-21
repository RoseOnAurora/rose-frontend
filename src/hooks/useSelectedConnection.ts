import { AppState } from "../state"
import { Web3Connection } from "../types/web3"
import { getWeb3Connection } from "../utils"
import { useMemo } from "react"
import { useSelector } from "react-redux"

const useSelectedConnection = (): Web3Connection | undefined => {
  const selectedWallet = useSelector(
    (state: AppState) => state.user.selectedWallet,
  )

  return useMemo(() => {
    if (selectedWallet) {
      return getWeb3Connection(selectedWallet.connectionType)
    }
  }, [selectedWallet])
}

export default useSelectedConnection
