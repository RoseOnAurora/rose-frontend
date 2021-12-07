import { Token } from "../constants"
import { imageIconToUrl } from "../utils"
import { useActiveWeb3React } from "./index"
import { useCallback } from "react"

export default function useAddTokenToMetamask(
  token: Token | undefined,
): () => Promise<void> {
  const { library, chainId } = useActiveWeb3React()

  const addToken = useCallback(async (): Promise<void> => {
    if (library && window.ethereum && token && chainId) {
      try {
        await window.ethereum.request({
          method: "wallet_watchAsset",
          params: {
            //@ts-ignore // need this for incorrect ethers provider type
            type: "ERC20",
            options: {
              address: token.addresses[chainId],
              symbol: token.symbol,
              decimals: token.decimals,
              image: imageIconToUrl(token.icon),
            },
          },
        })
      } catch (e) {
        console.log(e)
      }
    }
  }, [library, token, chainId])

  return addToken
}
