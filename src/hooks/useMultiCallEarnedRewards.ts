import {
  BLOCK_TIME,
  ChainId,
  FARMS_MAP,
  ROSE,
  UST_METAPOOL_FARM_NAME,
} from "../constants"
import { Contract, Provider } from "ethcall"
import { MulticallContract, MulticallProvider } from "../types/ethcall"
import { BigNumber } from "@ethersproject/bignumber"
import ROSE_STABLES_FARM_ABI from "../constants/abis/RoseStablesFarm.json"
import { RoseStablesFarm } from "../../types/ethers-contracts/RoseStablesFarm"
import { Zero } from "@ethersproject/constants"
import { useFarmContract } from "./useContract"
import usePoller from "./usePoller"
import { useState } from "react"
import { useWeb3React } from "@web3-react/core"

export const useMultiCallEarnedRewards = (): {
  [farmName: string]: BigNumber
} | null => {
  const { account, chainId, provider } = useWeb3React()
  const [rewards, setRewards] = useState<{ [farmName: string]: BigNumber }>({})
  const farmContractDualReward = useFarmContract(UST_METAPOOL_FARM_NAME)
  const ethcallProvider = new Provider() as MulticallProvider

  usePoller((): void => {
    async function pollEarnedRewards(): Promise<void> {
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
        .map((c) => c.earned(account, ROSE.addresses[chainId as ChainId]))
      const dualReward = await farmContractDualReward?.earned(
        account,
        "0xC4bdd27c33ec7daa6fcfd8532ddB524Bf4038096",
      )
      const rewards = await ethcallProvider.all(balanceCalls, "latest")
      setRewards(
        farms.reduce(
          (acc, [name], i) => ({
            ...acc,
            [name]: rewards[i],
          }),
          { dualReward: dualReward || Zero },
        ),
      )
    }
    if (account) {
      void pollEarnedRewards()
    }
  }, BLOCK_TIME)

  return rewards
}
