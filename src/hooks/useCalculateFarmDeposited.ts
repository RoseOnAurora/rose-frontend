import { useEffect, useState } from "react"
import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import { TRANSACTION_TYPES } from "../constants"
import { Zero } from "@ethersproject/constants"
import { useActiveWeb3React } from "."
import { useRoseStablesFarmContract } from "./useContract"
import { useSelector } from "react-redux"

export default function useCalculateFarmDeposited(): BigNumber {
  const { account } = useActiveWeb3React()

  const [depositedBalance, setDepositedBalance] = useState<BigNumber>(Zero)
  const farmContract = useRoseStablesFarmContract()
  const { lastTransactionTimes } = useSelector(
    (state: AppState) => state.application,
  )
  const lastDepositTime = lastTransactionTimes[TRANSACTION_TYPES.DEPOSIT]
  const lastWithdrawTime = lastTransactionTimes[TRANSACTION_TYPES.WITHDRAW]

  useEffect(() => {
    async function calculateDeposit(): Promise<void> {
      if (!account) throw new Error("Wallet must be connected")
      if (!farmContract) throw new Error("Farm contract is not loaded")

      const deposited = await farmContract.balanceOf(account)

      setDepositedBalance(deposited || Zero)
    }
    void calculateDeposit()
  }, [account, farmContract, lastDepositTime, lastWithdrawTime])

  return depositedBalance
}
