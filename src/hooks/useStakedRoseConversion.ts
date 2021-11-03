import { ROSE_CONTRACT_ADDRESSES, SROSE_CONTRACT_ADDRESSES } from "../constants"
import { useEffect, useState } from "react"

import { AddressZero } from "@ethersproject/constants"
import ERC20_ABI from "../constants/abis/erc20.json"
import { Erc20 } from "../../types/ethers-contracts/Erc20"
import STROSE_ABI from "../constants/abis/stRose.json"
import { getContract } from "../utils"
import { useActiveWeb3React } from "."

export default function useRoseConversionRateData(): [string] {
  const { account, library, chainId } = useActiveWeb3React()

  const [roseConversionData, setRoseConversionData] = useState<[string]>(["1"])

  useEffect(() => {
    async function getConversionRateData(): Promise<void> {
      if (library == null || chainId == null) return

      const roseContract = getContract(
        ROSE_CONTRACT_ADDRESSES[chainId],
        ERC20_ABI,
        library,
        account ?? undefined,
      ) as Erc20
      const stRoseContract = getContract(
        SROSE_CONTRACT_ADDRESSES[chainId],
        STROSE_ABI.abi,
        library,
        account ?? undefined,
      ) as Erc20

      // get lp token balance and total supply
      // TODO: use multicall
      const [stRoseBalance, totalStRoseSupply] = await Promise.all([
        roseContract.balanceOf(
          SROSE_CONTRACT_ADDRESSES[chainId] || AddressZero,
        ),
        stRoseContract.totalSupply(),
      ])

      const conversionRate = String(
        Number(stRoseBalance.div(totalStRoseSupply).toString()).toFixed(2),
      )

      setRoseConversionData([conversionRate])
    }
    void getConversionRateData()
  }, [account, library, chainId])

  return roseConversionData
}
