import { ContractReceipt } from "@ethersproject/contracts"
import { RoseStablesFarm } from "../../types/ethers-contracts/RoseStablesFarm"
import { TRANSACTION_TYPES } from "../constants"
import { updateLastTransactionTimes } from "../state/application"
import { useActiveWeb3React } from "."
import { useDispatch } from "react-redux"
import { useRoseStablesFarmContract } from "./useContract"

export default function useFarmExit(): () => Promise<ContractReceipt | void> {
  const farmContract = useRoseStablesFarmContract() as RoseStablesFarm
  const { account } = useActiveWeb3React()
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
    }
  }
}
