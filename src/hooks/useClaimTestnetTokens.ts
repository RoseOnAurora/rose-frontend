/* eslint-disable */
import { ContractReceipt } from "@ethersproject/contracts"
import { TRANSACTION_TYPES } from "../constants"
import { updateLastTransactionTimes } from "../state/application"
import { useActiveWeb3React } from "."
import { useDispatch } from "react-redux"
import { useTestnetMinterContract } from "./useContract"

export default function useMultiMinter(): () => Promise<ContractReceipt | void> {
  const minterContract = useTestnetMinterContract()
  const { account } = useActiveWeb3React()
  const dispatch = useDispatch()
  return async function claimTestnetTokens(): Promise<ContractReceipt | void> {
    try {
      if (!account) throw new Error("Wallet must be connected")
      if (!minterContract) throw new Error("Minter contract is not loaded")

      const tx = await minterContract.claimTokens()
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
