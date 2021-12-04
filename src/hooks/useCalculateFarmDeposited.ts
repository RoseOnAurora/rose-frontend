import { FarmName, TRANSACTION_TYPES } from "../constants"
import { useEffect, useState } from "react"
import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import { Zero } from "@ethersproject/constants"
import { useActiveWeb3React } from "."
import { useFarmContract } from "./useContract"
import { useSelector } from "react-redux"

export default function useCalculateFarmDeposited(
  balance: BigNumber | undefined,
  farmName: FarmName,
): BigNumber {
  const { account } = useActiveWeb3React()

  const [depositedBalance, setDepositedBalance] = useState<BigNumber>(Zero)
  const farmContract = useFarmContract(farmName)
  const { lastTransactionTimes } = useSelector(
    (state: AppState) => state.application,
  )
  const lastDepositTime = lastTransactionTimes[TRANSACTION_TYPES.DEPOSIT]
  const lastWithdrawTime = lastTransactionTimes[TRANSACTION_TYPES.WITHDRAW]

  useEffect(() => {
    async function calculateDeposit(): Promise<void> {
      if (!account || !farmContract) {
        setDepositedBalance(Zero)
        return
      }

      const deposited = await farmContract.balanceOf(account)

      setDepositedBalance(deposited || Zero)
    }
    void calculateDeposit()
  }, [account, farmContract, lastDepositTime, lastWithdrawTime, balance])

  return depositedBalance
}
