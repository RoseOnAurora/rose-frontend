import { BigNumber } from "@ethersproject/bignumber"
import { ContractReceipt } from "@ethersproject/contracts"
import { RoseStablesFarm } from "../../types/ethers-contracts/RoseStablesFarm"
import { useActiveWeb3React } from "."
import { useRoseStablesFarmContract } from "./useContract"

export function useWithdrawFarm(): (
  amount: string,
) => Promise<ContractReceipt | void> {
  const farmContract = useRoseStablesFarmContract() as RoseStablesFarm
  const { account } = useActiveWeb3React()
  return async function approveAndStake(
    amount: string,
  ): Promise<ContractReceipt | void> {
    try {
      if (!account) throw new Error("Wallet must be connected")
      if (!farmContract) throw new Error("Rose contract is not loaded")
      const balance = await farmContract.balanceOf(account)
      console.log("BALANCE BEFORE: ", balance)
      const amountToWithdraw = BigNumber.from(amount)
      const tx = await farmContract.withdraw(amountToWithdraw)
      console.log(tx)
      console.log("total supply ", await farmContract.totalSupply())
      const receipt = await tx.wait()
      const b = await farmContract.balanceOf(account)
      console.log("BALANCE AFTER: ", b)
      console.log("RECEIPT: ", receipt)
      return receipt
    } catch (e) {
      console.error(e)
    }
  }
}
