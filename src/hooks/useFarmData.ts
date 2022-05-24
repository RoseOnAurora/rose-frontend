import { AddressZero, Zero } from "@ethersproject/constants"
import { FARMS_MAP, FarmName, TRANSACTION_TYPES } from "../constants"
import { useEffect, useState } from "react"
import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import LPTOKEN_UNGUARDED_ABI from "../constants/abis/lpTokenUnguarded.json"
import { LpTokenUnguarded } from "../../types/ethers-contracts/LpTokenUnguarded"
import { getContract } from "../utils"
import { useActiveWeb3React } from "."
import { useSelector } from "react-redux"

export interface FarmDataType {
  lpTokenBalance: BigNumber
}

export type FarmDataHookReturnType = FarmDataType

const emptyFarmData = {
  lpTokenBalance: Zero,
} as FarmDataType

export default function useFarmData(
  farmName: FarmName,
): FarmDataHookReturnType {
  const { account, library, chainId } = useActiveWeb3React()
  const { lastTransactionTimes } = useSelector(
    (state: AppState) => state.application,
  )
  const lastDepositTime = lastTransactionTimes[TRANSACTION_TYPES.DEPOSIT]
  const lastWithdrawTime = lastTransactionTimes[TRANSACTION_TYPES.WITHDRAW]

  const [farmData, setFarmData] =
    useState<FarmDataHookReturnType>(emptyFarmData)

  useEffect(() => {
    async function getFarmData(): Promise<void> {
      if (library == null || chainId == null) return

      const FARM = FARMS_MAP[farmName]

      const lpTokenContract = getContract(
        FARM.lpToken.addresses[chainId],
        LPTOKEN_UNGUARDED_ABI,
        library,
        account ?? undefined,
      ) as LpTokenUnguarded
      let userLpTokenBalance: BigNumber
      if (account && account != AddressZero && account != null) {
        console.log(
          `Getting user LPToken balance for account ${account?.toString()}`,
        )
        try {
          userLpTokenBalance = await lpTokenContract.balanceOf(
            account || AddressZero,
          )
        } catch (e) {
          console.log(e)
        }
      }

      setFarmData((prevState) => ({
        ...prevState,
        lpTokenBalance: userLpTokenBalance,
      }))
    }
    void getFarmData()
  }, [lastDepositTime, lastWithdrawTime, farmName, account, library, chainId])

  return farmData
}
