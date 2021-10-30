import {
  // STABLECOIN_POOL_V2_NAME,
  // POOLS_MAP,
  PoolName,
  TRANSACTION_TYPES,
} from "../constants"
// import {
//   formatBNToPercentString,
//   getContract,
//   getTokenSymbolForPoolType,
// } from "../utils"
import { useEffect, useState } from "react"

import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import { Zero } from "@ethersproject/constants"
import { useActiveWeb3React } from "."
import { usePoolContract } from "./useContract"
import { useSelector } from "react-redux"

interface TokenShareType {
  percent: string
  symbol: string
  value: BigNumber
}

export type Partners = "keep" | "sharedStake" | "alchemix"
export interface PoolDataType {
  adminFee: BigNumber
  aParameter: BigNumber
  apy: BigNumber | null
  name: string
  reserve: BigNumber | null
  swapFee: BigNumber
  tokens: TokenShareType[]
  totalLocked: BigNumber
  utilization: BigNumber | null
  virtualPrice: BigNumber
  volume: BigNumber | null
  isPaused: boolean
  aprs: Partial<
    Record<
      Partners,
      {
        apr: BigNumber
        symbol: string
      }
    >
  >
  lpTokenPriceUSD: BigNumber
  lpToken: string
}

export interface UserShareType {
  lpTokenBalance: BigNumber
  name: PoolName // TODO: does this need to be on user share?
  share: BigNumber
  tokens: TokenShareType[]
  usdBalance: BigNumber
  underlyingTokensAmount: BigNumber
  amountsStaked: Partial<Record<Partners, BigNumber>>
}

export type PoolDataHookReturnType = [PoolDataType, UserShareType | null]

const emptyPoolData = {
  adminFee: Zero,
  aParameter: Zero,
  apy: null,
  name: "",
  reserve: null,
  swapFee: Zero,
  tokens: [],
  totalLocked: Zero,
  utilization: null,
  virtualPrice: Zero,
  volume: null,
  aprs: {},
  lpTokenPriceUSD: Zero,
  lpToken: "",
  isPaused: false,
} as PoolDataType

export default function usePoolData(
  poolName?: PoolName,
): PoolDataHookReturnType {
  const { account, library, chainId } = useActiveWeb3React()
  const poolContract = usePoolContract(poolName)
  const { lastTransactionTimes, swapStats } = useSelector(
    (state: AppState) => state.application,
  )
  const lastDepositTime = lastTransactionTimes[TRANSACTION_TYPES.DEPOSIT]
  const lastWithdrawTime = lastTransactionTimes[TRANSACTION_TYPES.WITHDRAW]
  const lastSwapTime = lastTransactionTimes[TRANSACTION_TYPES.SWAP]
  const lastMigrateTime = lastTransactionTimes[TRANSACTION_TYPES.MIGRATE]

  const [poolData] = useState<PoolDataHookReturnType>([
    {
      ...emptyPoolData,
      name: poolName || "",
    },
    null,
  ])

  useEffect(() => {
    async function getPoolData(): Promise<void> {
      if (
        poolName == null ||
        poolContract == null ||
        library == null ||
        chainId == null
      )
        return
      console.log("getting A")
      console.log(`pool.A() is ${(await poolContract.A()).toString()}`)
      // const POOL = POOLS_MAP[poolName]
      // const effectivePoolTokens = POOL.underlyingPoolTokens || POOL.poolTokens

      // setPoolData([emptyPoolData, null])
    }
    void getPoolData()
  }, [
    lastDepositTime,
    lastWithdrawTime,
    lastSwapTime,
    lastMigrateTime,
    poolContract,
    poolName,
    account,
    library,
    chainId,
    swapStats,
  ])

  return poolData
}
