import { MetaMask } from "@web3-react/metamask"
import { useCallback } from "react"
import { useWeb3React } from "@web3-react/core"

const useSwitchAccounts = (): (() => Promise<void>) => {
  const { connector } = useWeb3React()

  const switchAccounts = useCallback(async () => {
    if (connector instanceof MetaMask) {
      await connector.provider?.request({
        method: "wallet_requestPermissions",
        params: [
          {
            eth_accounts: {},
          },
        ],
      })
    }
  }, [connector])

  return switchAccounts
}

export default useSwitchAccounts
