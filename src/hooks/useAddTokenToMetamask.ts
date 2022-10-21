import { ChainId, Token } from "../constants"
import { imageIconToUrl } from "../utils"
import { useCallback } from "react"
import { useWeb3React } from "@web3-react/core"

export default function useAddTokenToMetamask(
  token: Token | undefined,
): () => Promise<void> {
  const { provider, chainId } = useWeb3React()

  const addToken = useCallback(async (): Promise<void> => {
    if (provider && window.ethereum && token && chainId) {
      try {
        await window.ethereum.request({
          method: "wallet_watchAsset",
          params: {
            //@ts-ignore // need this for incorrect ethers provider type
            type: "ERC20",
            options: {
              address: token.addresses[chainId as ChainId],
              symbol: token.symbol,
              decimals: token.decimals,
              image: imageIconToUrl(token.icon),
            },
          },
        })
      } catch (e) {
        console.debug(e)
      }
    }
  }, [provider, token, chainId])

  return addToken
}
