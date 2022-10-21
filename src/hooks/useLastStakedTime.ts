import { useEffect, useState } from "react"
import { AppState } from "../state"
import { TRANSACTION_TYPES } from "../constants"
import fetchLastStakedTime from "../utils/fetchBlockTransactions"
import { useSelector } from "react-redux"
import { useWeb3React } from "@web3-react/core"

export default function useLastStakedTime(): string | undefined {
  const { account, chainId } = useWeb3React()

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
