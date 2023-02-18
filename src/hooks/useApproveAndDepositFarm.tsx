/* eslint sort-imports: 0 */
/* eslint @typescript-eslint/no-unsafe-member-access: 0 */
/* eslint @typescript-eslint/no-unsafe-call: 0 */
/* eslint @typescript-eslint/no-explicit-any: 0 */
import { FarmName, TRANSACTION_TYPES } from "../constants"
import { useFarmContract, useLPTokenContractForFarm } from "./useContract"
import { BigNumber } from "@ethersproject/bignumber"
import { ContractReceipt } from "@ethersproject/contracts"
import { RoseStablesFarm } from "../../types/ethers-contracts/RoseStablesFarm"
import checkAndApproveTokenForTrade from "../utils/checkAndApproveTokenForTrade"
import { updateLastTransactionTimes } from "../state/application"
import { useDispatch } from "react-redux"
import useGasPrice from "./useGasPrice"
import { useWeb3React } from "@web3-react/core"

export function useApproveAndDepositFarm(
  farmName: FarmName,
): (amount: string) => Promise<ContractReceipt | void> {
  const dispatch = useDispatch()
  const farmContract = useFarmContract(farmName) as RoseStablesFarm
  const lpTokenContract = useLPTokenContractForFarm(farmName)
  const gasPrice = useGasPrice()
  const { account } = useWeb3React()
  return async function approveAndStake(
    amount: string,
  ): Promise<ContractReceipt | void> {
    try {
      if (!account) throw new Error("Wallet must be connected")
      if (!farmContract) throw new Error("Farm contract is not loaded")
      if (!lpTokenContract) throw new Error("LP Token contract is not loaded")

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
      throw e
    }
  }
}
