import { useEffect, useState } from "react"
import { AppState } from "../state"
import { TRANSACTION_TYPES } from "../constants"
import fetchLastStakedTime from "../utils/fetchBlockTransactions"
import { useActiveWeb3React } from "."
import { useSelector } from "react-redux"

export default function useLastStakedTime(): string | undefined {
  const { account, chainId } = useActiveWeb3React()

  const [lastStakedTime, setLastStakedTime] = useState<string | undefined>(
    undefined,
  )

  const { lastTransactionTimes } = useSelector(
    (state: AppState) => state.application,
  )
  const lastStakeTxn = lastTransactionTimes[TRANSACTION_TYPES.STAKE]

  useEffect(() => {
    if (!account || !chainId) return
    fetchLastStakedTime(account, chainId)
      .then((stakedTime) => {
        setLastStakedTime(stakedTime)
      })
      .catch((err) => console.log(err))
  }, [account, chainId, lastStakeTxn])

  return lastStakedTime
}
