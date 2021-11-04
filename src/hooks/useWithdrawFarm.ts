import { BigNumber } from "@ethersproject/bignumber"
import { ContractReceipt } from "@ethersproject/contracts"
import { RoseStablesFarm } from "../../types/ethers-contracts/RoseStablesFarm"
import { TRANSACTION_TYPES } from "../constants"
import { updateLastTransactionTimes } from "../state/application"
import { useActiveWeb3React } from "."
import { useDispatch } from "react-redux"
import { useRoseStablesFarmContract } from "./useContract"

export function useWithdrawFarm(): (
  amount: string,
) => Promise<ContractReceipt | void> {
  const dispatch = useDispatch()
  const farmContract = useRoseStablesFarmContract() as RoseStablesFarm
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
    }
  }
}
