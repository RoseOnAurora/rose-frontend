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
import { useActiveWeb3React } from "."
import { useFarmContract } from "./useContract"
import usePoller from "./usePoller"
import { useState } from "react"

export const useMultiCallEarnedRewards = (): {
  [farmName: string]: BigNumber
} | null => {
  const { account, chainId, library } = useActiveWeb3React()
  const [rewards, setRewards] = useState<{ [farmName: string]: BigNumber }>({})
  const farmContractDualReward = useFarmContract(UST_METAPOOL_FARM_NAME)
  const ethcallProvider = new Provider() as MulticallProvider

  usePoller((): void => {
    async function pollEarnedRewards(): Promise<void> {
      if (!library || !chainId || !account) return

      await ethcallProvider.init(library)
      // override the contract address when using aurora
      if (chainId == ChainId.AURORA_TESTNET) {
        ethcallProvider.multicallAddress =
          "0x508B1508AAd923fB24F6d13cD74Ac640fD8B66E8"
      } else if (chainId == ChainId.AURORA_MAINNET) {
        ethcallProvider.multicallAddress =
          "0x49eb1F160e167aa7bA96BdD88B6C1f2ffda5212A"
      }

      const balanceCalls = Object.values(FARMS_MAP)
        .map((farm) => {
          return new Contract(
            farm.addresses[chainId],
            ROSE_STABLES_FARM_ABI.abi,
          ) as MulticallContract<RoseStablesFarm>
        })
        .map((c) => c.earned(account, ROSE.addresses[chainId]))
      const dualReward = await farmContractDualReward?.earned(
        account,
        "0xC4bdd27c33ec7daa6fcfd8532ddB524Bf4038096",
      )
      const rewards = await ethcallProvider.all(balanceCalls, "latest")
      setRewards(
        Object.keys(FARMS_MAP).reduce(
          (acc, farmName, i) => ({
            ...acc,
            [farmName]: rewards[i],
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
