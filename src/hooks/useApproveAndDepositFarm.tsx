import { PoolName, TRANSACTION_TYPES } from "../constants"
import { useLPTokenContract, useRoseStablesFarmContract } from "./useContract"
import { BigNumber } from "@ethersproject/bignumber"
import { ContractReceipt } from "@ethersproject/contracts"
import { RoseStablesFarm } from "../../types/ethers-contracts/RoseStablesFarm"
import { Zero } from "@ethersproject/constants"
import checkAndApproveTokenForTrade from "../utils/checkAndApproveTokenForTrade"
import { updateLastTransactionTimes } from "../state/application"
import { useActiveWeb3React } from "."
import { useDispatch } from "react-redux"

export function useApproveAndDepositFarm(
  poolName: PoolName,
): (amount: string) => Promise<ContractReceipt | void> {
  const dispatch = useDispatch()
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
      dispatch(
        updateLastTransactionTimes({
          [TRANSACTION_TYPES.DEPOSIT]: Date.now(),
        }),
      )
      return receipt
    } catch (e) {
      console.error(e)
    }
  }
}
