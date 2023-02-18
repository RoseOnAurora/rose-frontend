import { SUPPORTED_CHAINS, SupportedChainId } from "../constants/chains"
import { toHex } from "../utils"
import { useCallback } from "react"
import { useWeb3React } from "@web3-react/core"

export default function useAddNetworkToMetamask(): (
  chainId: SupportedChainId,
) => Promise<void> {
  const { connector } = useWeb3React()

  const addNetwork = useCallback(
    async (chainId: SupportedChainId) => {
      if (connector.provider) {
        try {
          await connector.provider.request({
            method: "wallet_switchEthereumChain",
            params: [
              {
                chainId: toHex(chainId),
              },
            ],
          })
        } catch (e) {
          // This error code indicates that the chain has not been added to MetaMask.
          const { code } = e as { code: number }
          if (code === 4902) {
            await connector.provider.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: toHex(chainId),
                  chainName: SUPPORTED_CHAINS[chainId].name,
                  rpcUrls: SUPPORTED_CHAINS[chainId].rpc,
                  nativeCurrency: SUPPORTED_CHAINS[chainId].currency,
                },
              ],
            })
          }
        }
      }
    },
    [connector.provider],
  )

  return addNetwork
}
