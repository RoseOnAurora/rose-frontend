import { ChainId, POOLS_MAP, PoolName, PoolTypes } from "../constants"
import { Contract, Provider } from "ethcall"
import { MulticallContract, MulticallProvider } from "../types/ethcall"
import { useEffect, useState } from "react"

import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import LPTOKEN_UNGUARDED_ABI from "../constants/abis/lpTokenUnguarded.json"
import { LpTokenUnguarded } from "../../types/ethers-contracts/LpTokenUnguarded"
import { parseUnits } from "@ethersproject/units"
import { useActiveWeb3React } from "."
import { useSelector } from "react-redux"

export default function usePoolTVLs(): { [poolName in PoolName]?: BigNumber } {
  const { chainId, library } = useActiveWeb3React()
  const { tokenPricesUSD } = useSelector((state: AppState) => state.application)
  const [poolTvls, setPoolTvls] = useState<{
    [poolName in PoolName]?: BigNumber
  }>({})

  useEffect(() => {
    if (
      Object.keys(poolTvls).length > 0 && // only run once
      tokenPricesUSD?.BTC &&
      tokenPricesUSD?.ETH
    )
      return
    async function fetchTVLs() {
      if (!library || !chainId) return
      const ethcallProvider = new Provider() as MulticallProvider

      await ethcallProvider.init(library)
      // override the contract address when using aurora
      if (chainId == ChainId.AURORA_TESTNET) {
        ethcallProvider.multicallAddress =
          "0x508B1508AAd923fB24F6d13cD74Ac640fD8B66E8"
      } else if (chainId == ChainId.AURORA_MAINNET) {
        ethcallProvider.multicallAddress =
          "0x49eb1F160e167aa7bA96BdD88B6C1f2ffda5212A"
      }

      const pools = Object.values(POOLS_MAP)
      const supplyCalls = pools
        .map((p) => {
          return new Contract(
            p.lpToken.addresses[chainId],
            LPTOKEN_UNGUARDED_ABI,
          ) as MulticallContract<LpTokenUnguarded>
        })
        .map((c) => c.totalSupply())

      try {
        const tvls = await ethcallProvider.all(supplyCalls, "latest")
        const tvlsUSD = pools.map((pool, i) => {
          const tvlAmount = tvls[i]
          let tokenValue = 0
          if (pool.type === PoolTypes.BTC) {
            tokenValue = tokenPricesUSD?.BTC || 0
          } else if (pool.type === PoolTypes.ETH) {
            tokenValue = tokenPricesUSD?.ETH || 0
          } else {
            tokenValue = 1 // USD
          }
          return parseUnits(tokenValue.toFixed(2), 2)
            .mul(tvlAmount)
            .div(BigNumber.from(10).pow(2)) //1e18
        })
        setPoolTvls((prevState) => {
          return pools.reduce(
            (acc, pool, i) => ({
              ...acc,
              [pool.name]: tvlsUSD[i],
            }),
            prevState,
          )
        })
      } catch (e) {
        console.error(e)
      }
    }
    void fetchTVLs()
  }, [chainId, library, tokenPricesUSD, poolTvls])
  return poolTvls
}
