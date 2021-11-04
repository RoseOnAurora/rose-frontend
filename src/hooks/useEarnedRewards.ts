import { useRoseContract, useRoseStablesFarmContract } from "./useContract"
import { BLOCK_TIME } from "../constants"
import { Zero } from "@ethersproject/constants"
import { formatBNToString } from "../utils"
import { useActiveWeb3React } from "."
import usePoller from "./usePoller"
import { useState } from "react"

export default function useEarnedRewards(): string {
  const { account } = useActiveWeb3React()

  const [rewardsEarned, setRewardsEarned] = useState<string>("0.0")
  const roseContract = useRoseContract()
  const farmContract = useRoseStablesFarmContract()

  usePoller(() => {
    async function pollRewards(): Promise<void> {
      if (!account) throw new Error("Wallet must be connected")
      if (!farmContract || !roseContract)
        throw new Error("Contracts are not loaded")

      const earned = await farmContract.earned(account, roseContract.address)

      setRewardsEarned(formatBNToString(earned || Zero, 18, 6))
    }
    if (account) {
      void pollRewards()
    }
  }, BLOCK_TIME)

  return rewardsEarned
}
