import { useCallback, useEffect, useState } from "react"
import { BigNumber } from "@ethersproject/bignumber"
import { Zero } from "@ethersproject/constants"
import { useWeb3React } from "@web3-react/core"

const useGasPrice = (): BigNumber => {
  const [gasPrice, setGasPrice] = useState<BigNumber>(Zero)
  const { provider } = useWeb3React()

  const fetchGasPrice = useCallback(async (): Promise<
    BigNumber | undefined
  > => {
    // TODO: implement gas selections
    if (provider) {
      return await provider.getGasPrice()
    }
  }, [provider])

  useEffect(() => {
    fetchGasPrice()
      .then((val) => {
        if (val) setGasPrice(val)
      })
      .catch((e) => console.debug(e))
  }, [fetchGasPrice])

  return gasPrice
}

export default useGasPrice
