import { ContractReceipt } from "@ethersproject/contracts"
import { FarmName } from "../constants"
import { useFarmContract } from "./useContract"
import { useWeb3React } from "@web3-react/core"

export default function useClaimReward(
  farmName: FarmName,
): () => Promise<ContractReceipt | void> {
  const farmContract = useFarmContract(farmName)
  const { account } = useWeb3React()
  return async function claimReward(): Promise<ContractReceipt | void> {
    try {
      if (!account) throw new Error("Wallet must be connected")
      if (!farmContract) throw new Error("Rose Farm contract is not loaded")

      const tx = await farmContract.getReward()
      return await tx.wait()
    } catch (e) {
      const error = e as { code: number; message: string }
      throw error
    }
  }
}
