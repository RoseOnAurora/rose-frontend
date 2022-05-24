/* eslint @typescript-eslint/no-unsafe-member-access: 0 */
/* eslint @typescript-eslint/no-explicit-any: 0 */
import { SUPPORTED_CHAINS, SupportedChains } from "../constants"
import { toHex } from "../utils"
import { useCallback } from "react"

export default function useAddNetworkToMetamask(): (
  chainId: SupportedChains,
) => void {
  const { ethereum } = window

  const addNetwork = useCallback(
    async (chainId: SupportedChains) => {
      if (ethereum) {
        try {
          await ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [
              {
                chainId: toHex(chainId),
              },
            ],
          })
        } catch (error: any) {
          // This error code indicates that the chain has not been added to MetaMask.
          if (error.code === 4902) {
            await ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: toHex(chainId),
                  chainName: SUPPORTED_CHAINS[chainId].name,
                  rpcUrls: [SUPPORTED_CHAINS[chainId].rpc],
                },
              ],
            })
          }
        }
      }
    },
    [ethereum],
  )

  return addNetwork
}
