import { BigNumber } from "@ethersproject/bignumber"
import { ContractReceipt } from "@ethersproject/contracts"
import { StRose } from "../../types/ethers-contracts/StRose"
import { useActiveWeb3React } from "."
import { useStRoseContract } from "./useContract"

export function useApproveAndUnstake(): (
  amount: string,
) => Promise<ContractReceipt | void> {
  const stRoseContract = useStRoseContract() as StRose
  const { account } = useActiveWeb3React()
  return async function approveAndUnstake(
    amount: string,
  ): Promise<ContractReceipt | void> {
    try {
      if (!account) throw new Error("Wallet must be connected")
      if (!stRoseContract) throw new Error("Contracts are not loaded")
      const amountToUnStake = BigNumber.from(amount)
      if (amountToUnStake.isZero()) return
      const tx = await stRoseContract.burn(account, amountToUnStake)
      return await tx.wait()
    } catch (e) {
      console.error(e)
    }
  }
}
