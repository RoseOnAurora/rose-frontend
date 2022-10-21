import { FarmName, TRANSACTION_TYPES } from "../constants"
import { ContractReceipt } from "@ethersproject/contracts"
import { updateLastTransactionTimes } from "../state/application"
import { useDispatch } from "react-redux"
import { useFarmContract } from "./useContract"
import { useWeb3React } from "@web3-react/core"

export default function useFarmExit(
  farmName: FarmName,
): () => Promise<ContractReceipt | void> {
  const farmContract = useFarmContract(farmName)
  const { account } = useWeb3React()
  const dispatch = useDispatch()
  return async function exitFarm(): Promise<ContractReceipt | void> {
    try {
      if (!account) throw new Error("Wallet must be connected")
      if (!farmContract) throw new Error("Rose Farm contract is not loaded")

      const tx = await farmContract.exit()
      const receipt = await tx.wait()
      dispatch(
        updateLastTransactionTimes({
          [TRANSACTION_TYPES.WITHDRAW]: Date.now(),
        }),
      )
      return receipt
    } catch (e) {
      console.error(e)
      throw e
    }
  }
}
