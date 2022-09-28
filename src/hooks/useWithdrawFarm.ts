import { FarmName, TRANSACTION_TYPES } from "../constants"
import { BigNumber } from "@ethersproject/bignumber"
import { ContractReceipt } from "@ethersproject/contracts"
import { updateLastTransactionTimes } from "../state/application"
import { useActiveWeb3React } from "."
import { useDispatch } from "react-redux"
import { useFarmContract } from "./useContract"

export function useWithdrawFarm(
  farmName: FarmName,
): (amount: string) => Promise<ContractReceipt | void> {
  const dispatch = useDispatch()
  const farmContract = useFarmContract(farmName)
  const { account } = useActiveWeb3React()
  return async function approveAndStake(
    amount: string,
  ): Promise<ContractReceipt | void> {
    try {
      if (!account) throw new Error("Wallet must be connected")
      if (!farmContract) throw new Error("Rose contract is not loaded")
      const amountToWithdraw = BigNumber.from(amount)
      const tx = await farmContract.withdraw(amountToWithdraw)
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
