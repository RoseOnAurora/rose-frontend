import { useLPTokenContract, useRoseStablesFarmContract } from "./useContract"
import { BigNumber } from "@ethersproject/bignumber"
import { ContractReceipt } from "@ethersproject/contracts"
import { PoolName } from "../constants"
import { RoseStablesFarm } from "../../types/ethers-contracts/RoseStablesFarm"
import { Zero } from "@ethersproject/constants"
import checkAndApproveTokenForTrade from "../utils/checkAndApproveTokenForTrade"
import { useActiveWeb3React } from "."

export function useApproveAndFarm(
  poolName: PoolName,
): (amount: string) => Promise<ContractReceipt | void> {
  const farmContract = useRoseStablesFarmContract() as RoseStablesFarm
  const lpTokenContract = useLPTokenContract(poolName)
  const { account } = useActiveWeb3React()
  return async function approveAndStake(
    amount: string,
  ): Promise<ContractReceipt | void> {
    try {
      if (!account) throw new Error("Wallet must be connected")
      if (!farmContract || !lpTokenContract)
        throw new Error("Rose contract is not loaded")
      const gasPrice = Zero
      const amountToStake = BigNumber.from(amount)
      await checkAndApproveTokenForTrade(
        lpTokenContract,
        farmContract.address,
        account,
        amountToStake,
        true,
        gasPrice,
        {
          onTransactionError: (error) => {
            console.error(error)
            throw new Error("Your transaction could not be completed")
          },
        },
      )
      const tx = await farmContract.stake(amountToStake)
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
