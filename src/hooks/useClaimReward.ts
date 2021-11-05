import { ContractReceipt } from "@ethersproject/contracts"
import { RoseStablesFarm } from "../../types/ethers-contracts/RoseStablesFarm"
import { useActiveWeb3React } from "."
import { useRoseStablesFarmContract } from "./useContract"

export default function useClaimReward(): () => Promise<ContractReceipt | void> {
  const farmContract = useRoseStablesFarmContract() as RoseStablesFarm
  const { account } = useActiveWeb3React()
  return async function claimReward(): Promise<ContractReceipt | void> {
    try {
      if (!account) throw new Error("Wallet must be connected")
      if (!farmContract) throw new Error("Rose Farm contract is not loaded")

      const tx = await farmContract.getReward()
      return await tx.wait()
    } catch (e) {
      console.error(e)
    }
  }
}
