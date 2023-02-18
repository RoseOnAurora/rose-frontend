/* eslint @typescript-eslint/no-unsafe-member-access: 0 */
/* eslint @typescript-eslint/no-unsafe-call: 0 */
/* eslint @typescript-eslint/no-explicit-any: 0 */
import { useRoseContract, useStRoseContract } from "./useContract"
import { BigNumber } from "@ethersproject/bignumber"
import { ContractReceipt } from "@ethersproject/contracts"
import { Erc20 } from "../../types/ethers-contracts/Erc20"
import { StRose } from "../../types/ethers-contracts/StRose"
import { TRANSACTION_TYPES } from "../constants"
import checkAndApproveTokenForTrade from "../utils/checkAndApproveTokenForTrade"
import { updateLastTransactionTimes } from "../state/application"
import { useDispatch } from "react-redux"
import useGasPrice from "./useGasPrice"
import { useWeb3React } from "@web3-react/core"

export function useApproveAndStake(): (
  amount: string,
) => Promise<ContractReceipt | void> {
  const roseContract = useRoseContract() as Erc20
  const stRoseContract = useStRoseContract() as StRose
  const { account } = useWeb3React()
  const gasPrice = useGasPrice()
  const dispatch = useDispatch()
  return async function approveAndStake(
    amount: string,
    onApprovalTransactionStart?: () => void,
  ): Promise<ContractReceipt | void> {
    try {
      if (!account) throw new Error("Wallet must be connected")
      if (!roseContract || !stRoseContract)
        throw new Error("Rose contract is not loaded")

      const amountToStake = BigNumber.from(amount)
      await checkAndApproveTokenForTrade(
        roseContract,
        stRoseContract.address,
        account,
        amountToStake,
        true,
        gasPrice,
        {
          onTransactionStart: () => {
            onApprovalTransactionStart?.()
            return undefined
          },
        },
      )
      const tx = await stRoseContract.mint(amountToStake)
      const receipt = await tx.wait()
      dispatch(
        updateLastTransactionTimes({
          [TRANSACTION_TYPES.STAKE]: Date.now(),
        }),
      )
      return receipt
    } catch (e) {
      const error = e as { code: number; message: string }
      throw error
    }
  }
}
