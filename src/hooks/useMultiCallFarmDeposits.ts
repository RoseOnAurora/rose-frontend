import { BLOCK_TIME, ChainId, FARMS_MAP } from "../constants"
import { Contract, Provider } from "ethcall"
import { MulticallContract, MulticallProvider } from "../types/ethcall"
import { BigNumber } from "@ethersproject/bignumber"
import ROSE_STABLES_FARM_ABI from "../constants/abis/RoseStablesFarm.json"
import { RoseStablesFarm } from "../../types/ethers-contracts/RoseStablesFarm"
import usePoller from "./usePoller"
import { useState } from "react"
import { useWeb3React } from "@web3-react/core"

export const useMultiCallFarmDeposits = (): {
  [farmName: string]: BigNumber
} | null => {
  const { account, chainId, provider } = useWeb3React()
  const [balances, setBalances] = useState<{ [farmName: string]: BigNumber }>(
    {},
  )

  const ethcallProvider = new Provider() as MulticallProvider

  usePoller((): void => {
    async function pollFarmBalances(): Promise<void> {
      if (!provider || !chainId || !account) return

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

      const farms = Object.entries(FARMS_MAP).filter(
        ([, f]) => !!f.addresses[chainId as ChainId],
      )

      const balanceCalls = farms
        .map(([, f]) => {
          return new Contract(
            f.addresses[chainId as ChainId],
            ROSE_STABLES_FARM_ABI.abi,
          ) as MulticallContract<RoseStablesFarm>
        })
        .map((c) => c.balanceOf(account))
      const balances = await ethcallProvider.all(balanceCalls, "latest")
      setBalances(
        farms.reduce(
          (acc, [name], i) => ({
            ...acc,
            [name]: balances[i],
          }),
          {},
        ),
      )
    }
    if (account) {
      void pollFarmBalances()
    }
  }, BLOCK_TIME)

  return balances
}
