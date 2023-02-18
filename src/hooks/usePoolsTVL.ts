import { ChainId, POOLS_MAP, PoolName, PoolTypes } from "../constants"
import { Contract, Provider } from "ethcall"
import { MulticallContract, MulticallProvider } from "../types/ethcall"
import { useEffect, useState } from "react"

import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import LPTOKEN_UNGUARDED_ABI from "../constants/abis/lpTokenUnguarded.json"
import { LpTokenUnguarded } from "../../types/ethers-contracts/LpTokenUnguarded"
import { parseUnits } from "@ethersproject/units"
import { useSelector } from "react-redux"
import { useWeb3React } from "@web3-react/core"

export default function usePoolTVLs(): { [poolName in PoolName]?: BigNumber } {
  const { chainId, provider } = useWeb3React()
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
      if (!provider || !chainId) return
      const ethcallProvider = new Provider() as MulticallProvider

      await ethcallProvider.init(provider)

      switch (chainId) {
        case ChainId.AURORA_TESTNET:
          ethcallProvider.multicallAddress =
            "0x508B1508AAd923fB24F6d13cD74Ac640fD8B66E8"
          break
        case ChainId.AURORA_MAINNET:
          ethcallProvider.multicallAddress =
            "0x49eb1F160e167aa7bA96BdD88B6C1f2ffda5212A"
          break
        case ChainId.MUMBAI:
          ethcallProvider.multicallAddress =
            "0x08411ADd0b5AA8ee47563b146743C13b3556c9Cc"
      }

      const pools = Object.values(POOLS_MAP).filter(
        (p) => !!p.lpToken.addresses[chainId as ChainId],
      )
      const supplyCalls = pools
        .map((p) => {
          return new Contract(
            p.lpToken.addresses[chainId as ChainId],
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
  }, [chainId, provider, tokenPricesUSD, poolTvls])
  return poolTvls
}
