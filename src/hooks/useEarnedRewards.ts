import { BLOCK_TIME, FarmName } from "../constants"
import { useFarmContract, useRoseContract } from "./useContract"
import { Zero } from "@ethersproject/constants"
import { formatBNToString } from "../utils"
import usePoller from "./usePoller"
import { useState } from "react"
import { useWeb3React } from "@web3-react/core"

interface EarnedRewards {
  roseRewards: string
  totalRewards?: string
  dualRewards?: string
}

export default function useEarnedRewards(
  farmName: FarmName,
  dualRewardAddress?: string,
): EarnedRewards {
  const { account } = useWeb3React()

  const [rewardsEarned, setRewardsEarned] = useState<EarnedRewards>({
    roseRewards: "",
    totalRewards: "",
    dualRewards: "",
  })
  const roseContract = useRoseContract()
  const farmContract = useFarmContract(farmName)

  usePoller(() => {
    async function pollRewards(): Promise<void> {
      if (!account) throw new Error("Wallet must be connected")
      if (!farmContract || !roseContract)
        throw new Error("Contracts are not loaded")

      const roseEarned = await farmContract.earned(
        account,
        roseContract.address,
      )

      setRewardsEarned((prevState) => ({
        ...prevState,
        roseRewards: formatBNToString(roseEarned || Zero, 18),
      }))

      if (dualRewardAddress) {
        const dualRewardEarned = await farmContract.earned(
          account,
          dualRewardAddress,
        )
        setRewardsEarned((prevState) => ({
          ...prevState,
          dualRewards: formatBNToString(dualRewardEarned || Zero, 18),
        }))
        setRewardsEarned((prevState) => ({
          ...prevState,
          totalRewards: formatBNToString(
            dualRewardEarned.add(roseEarned) || Zero,
            18,
          ),
        }))
      }
    }
    if (account) {
      void pollRewards()
    }
  }, BLOCK_TIME)

  return rewardsEarned
}
