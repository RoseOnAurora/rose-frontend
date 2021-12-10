import { BLOCK_TIME, FarmName } from "../constants"
import { useFarmContract, useRoseContract } from "./useContract"
import { Zero } from "@ethersproject/constants"
import { formatBNToString } from "../utils"
import { useActiveWeb3React } from "."
import usePoller from "./usePoller"
import { useState } from "react"

export default function useEarnedRewards(farmName: FarmName): string {
  const { account } = useActiveWeb3React()

  const [rewardsEarned, setRewardsEarned] = useState<string>("0.0")
  const roseContract = useRoseContract()
  const farmContract = useFarmContract(farmName)

  usePoller(() => {
    async function pollRewards(): Promise<void> {
      if (!account) throw new Error("Wallet must be connected")
      if (!farmContract || !roseContract)
        throw new Error("Contracts are not loaded")

      const earned = await farmContract.earned(account, roseContract.address)

      setRewardsEarned(formatBNToString(earned || Zero, 18, 5))
    }
    if (account) {
      void pollRewards()
    }
  }, BLOCK_TIME)

  return rewardsEarned
}
