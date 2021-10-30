import {
  ChainId,
  // STABLECOIN_POOL_V2_NAME,
  // POOLS_MAP,
  PoolName,
  TRANSACTION_TYPES,
} from "../constants"
import { Contract, Provider } from "ethcall"
import {
  MulticallCall,
  MulticallContract,
  MulticallProvider,
} from "../types/ethcall"
// import {
//   formatBNToPercentString,
//   getContract,
//   getTokenSymbolForPoolType,
// } from "../utils"
import { useEffect, useState } from "react"

import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import ROSE_STABLES_POOL from "../constants/abis/RoseStablesPool.json"
import { RoseStablesPool } from "../../types/ethers-contracts/RoseStablesPool"
import { Zero } from "@ethersproject/constants"
import { parseUnits } from "@ethersproject/units"
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

  const [poolData, setPoolData] = useState<PoolDataHookReturnType>([
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
      // const POOL = POOLS_MAP[poolName]
      // const effectivePoolTokens = POOL.underlyingPoolTokens || POOL.poolTokens

      const ethcallProvider = new Provider() as MulticallProvider
      await ethcallProvider.init(library)
      // override the contract address when using aurora
      if (chainId == ChainId.AURORA_TESTNET) {
        ethcallProvider.multicallAddress =
          "0x508B1508AAd923fB24F6d13cD74Ac640fD8B66E8"
      } else if (chainId == ChainId.AURORA_MAINNET) {
        ethcallProvider.multicallAddress =
          "0x49eb1F160e167aa7bA96BdD88B6C1f2ffda5212A"
      }

      // get virtual price (failing, maybe because no liquidity yet?)
      // console.log(
      //   `pool.get_virtual_price() is ${(
      //     await poolContract.get_virtual_price()
      //   ).toString()}
      // `,
      // )

      // multicall: fetch A, fee, protocol_fee, virtual price
      const multicallPoolContract = new Contract(
        poolContract.address,
        ROSE_STABLES_POOL,
      ) as MulticallContract<RoseStablesPool>
      const a: MulticallCall<unknown, BigNumber> = multicallPoolContract.A()
      const fee: MulticallCall<unknown, BigNumber> = multicallPoolContract.fee()
      const protocol_fee: MulticallCall<
        unknown,
        BigNumber
      > = multicallPoolContract.protocol_fee()
      // const virtualPrice: MulticallCall<
      //   unknown,
      //   BigNumber
      // > = multicallPoolContract.get_virtual_price()
      const multicallRes = await ethcallProvider.all(
        [a, fee, protocol_fee],
        "latest",
      )
      console.log(`multicallRes is ${JSON.stringify(multicallRes)}`)
      const multicallResFormatted = multicallRes.map((res, i) => {
        return parseUnits((1).toFixed(2), 2)
          .mul(multicallRes[i])
          .div(BigNumber.from(10).pow(2)) //1e18
      })

      const poolData = {
        ...emptyPoolData,
        name: poolName,
        aParameter: multicallResFormatted[0],
        adminFee: multicallResFormatted[2],
        swapFee: multicallResFormatted[1],
        // virtualPrice: multicallResFormatted[3],
      }

      setPoolData([poolData, null])
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
