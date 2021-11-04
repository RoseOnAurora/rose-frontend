import { AddressZero, Zero } from "@ethersproject/constants"
import {
  ChainId,
  // STABLECOIN_POOL_V2_NAME,
  POOLS_MAP,
  PoolName,
  TRANSACTION_TYPES,
} from "../constants"
import { Contract, Provider } from "ethcall"
import {
  MulticallCall,
  MulticallContract,
  MulticallProvider,
} from "../types/ethcall"
import { formatBNToPercentString, getContract } from "../utils"
import { useEffect, useState } from "react"

import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import LPTOKEN_UNGUARDED_ABI from "../constants/abis/lpTokenUnguarded.json"
import { LpTokenUnguarded } from "../../types/ethers-contracts/LpTokenUnguarded"
import ROSE_STABLES_POOL from "../constants/abis/RoseStablesPool.json"
import { RoseStablesPool } from "../../types/ethers-contracts/RoseStablesPool"
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
  const { tokenPricesUSD, lastTransactionTimes, swapStats } = useSelector(
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
        tokenPricesUSD == null ||
        library == null ||
        chainId == null
      )
        return

      // TODO: move to utils
      function calculatePctOfTotalShare(lpTokenAmount: BigNumber): BigNumber {
        // returns the % of total lpTokens
        return lpTokenAmount
          .mul(BigNumber.from(10).pow(18))
          .div(
            totalLpTokenBalance.isZero()
              ? BigNumber.from("1")
              : totalLpTokenBalance,
          )
      }

      const POOL = POOLS_MAP[poolName]
      const effectivePoolTokens = POOL.underlyingPoolTokens || POOL.poolTokens
      const lpTokenContract = getContract(
        POOL.lpToken.addresses[chainId],
        LPTOKEN_UNGUARDED_ABI,
        library,
        account ?? undefined,
      ) as LpTokenUnguarded

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

      // get virtual price (failing in multicall, maybe because no liquidity yet?)
      let virtualPrice: BigNumber
      try {
        virtualPrice = await poolContract.get_virtual_price()
      } catch (e) {
        console.log(`couldn't fetch virtual price`)
        virtualPrice = Zero
      }

      // multicall: fetch A, fee, protocol_fee, token prices
      const multicallPoolContract = new Contract(
        poolContract.address,
        ROSE_STABLES_POOL,
      ) as MulticallContract<RoseStablesPool>
      const a: MulticallCall<unknown, BigNumber> = multicallPoolContract.A()
      const fee: MulticallCall<unknown, BigNumber> = multicallPoolContract.fee()
      const dai_balance: MulticallCall<
        unknown,
        BigNumber
      > = multicallPoolContract.balances(0)
      const usdc_balance: MulticallCall<
        unknown,
        BigNumber
      > = multicallPoolContract.balances(1)
      const usdt_balance: MulticallCall<
        unknown,
        BigNumber
      > = multicallPoolContract.balances(2)
      // TODO: make a struct instead of an unfriendly array
      const multicallResFormatted = await ethcallProvider.all(
        [a, fee, dai_balance, usdc_balance, usdt_balance],
        "latest",
      )
      // TODO: kinda hacky way of adjusting decimals, need to do this generically
      const tokenBalances = [
        multicallResFormatted[2],
        multicallResFormatted[3].mul(BigNumber.from(10).pow(12)),
        multicallResFormatted[4].mul(BigNumber.from(10).pow(12)),
      ]

      // get lp token balance and total supply
      // TODO: use multicall
      const [userLpTokenBalance, totalLpTokenBalance] = await Promise.all([
        lpTokenContract.balanceOf(account || AddressZero),
        lpTokenContract.totalSupply(),
      ])

      // calculate sum of token balances
      const tokenBalancesSum: BigNumber = tokenBalances.reduce((sum, b) =>
        sum.add(b),
      )
      const tokenBalancesUSD = effectivePoolTokens.map((token, i) => {
        // use another token to estimate USD price of meta LP tokens
        const balance = tokenBalances[i]
        return balance
          .mul(parseUnits(String(tokenPricesUSD[token.symbol] || 0), 18))
          .div(BigNumber.from(10).pow(18))
      })
      const tokenBalancesUSDSum: BigNumber = tokenBalancesUSD.reduce((sum, b) =>
        sum.add(b),
      )
      const lpTokenPriceUSD = tokenBalancesSum.isZero()
        ? Zero
        : tokenBalancesUSDSum
            .mul(BigNumber.from(10).pow(18))
            .div(tokenBalancesSum)

      // calculate user share of pool
      const userShare = calculatePctOfTotalShare(userLpTokenBalance)
      const userPoolTokenBalances = tokenBalances.map((balance) => {
        return userShare.mul(balance).div(BigNumber.from(10).pow(18))
      })
      const userPoolTokenBalancesSum: BigNumber = userPoolTokenBalances.reduce(
        (sum, b) => sum.add(b),
      )
      const userPoolTokenBalancesUSD = tokenBalancesUSD.map((balance) => {
        return userShare.mul(balance).div(BigNumber.from(10).pow(18))
      })
      const userPoolTokenBalancesUSDSum: BigNumber = userPoolTokenBalancesUSD.reduce(
        (sum, b) => sum.add(b),
      )

      // format pool token balances and user pool tokens
      const poolTokens = effectivePoolTokens.map((token, i) => ({
        symbol: token.symbol,
        percent: formatBNToPercentString(
          tokenBalances[i]
            .mul(10 ** 5)
            .div(
              totalLpTokenBalance.isZero()
                ? BigNumber.from("1")
                : tokenBalancesSum,
            ),
          5,
        ),
        value: tokenBalances[i],
      }))
      const userPoolTokens = effectivePoolTokens.map((token, i) => ({
        symbol: token.symbol,
        percent: formatBNToPercentString(
          tokenBalances[i]
            .mul(10 ** 5)
            .div(
              totalLpTokenBalance.isZero()
                ? BigNumber.from("1")
                : tokenBalancesSum,
            ),
          5,
        ),
        value: userPoolTokenBalances[i],
      }))

      // set final structs stored in state
      const poolData = {
        ...emptyPoolData,
        name: poolName,
        tokens: poolTokens,
        reserve: tokenBalancesUSDSum,
        totalLocked: totalLpTokenBalance,
        aParameter: multicallResFormatted[0],
        swapFee: multicallResFormatted[1],
        virtualPrice,
        lpTokenPriceUSD,
        lpToken: POOL.lpToken.symbol,
      }
      const userShareData = account
        ? {
            name: poolName,
            share: userShare,
            underlyingTokensAmount: userPoolTokenBalancesSum,
            usdBalance: userPoolTokenBalancesUSDSum,
            tokens: userPoolTokens,
            lpTokenBalance: userLpTokenBalance,
            amountsStaked: {},
          }
        : null

      setPoolData([poolData, userShareData])
    }
    void getPoolData()
  }, [
    lastDepositTime,
    lastWithdrawTime,
    lastSwapTime,
    lastMigrateTime,
    poolContract,
    tokenPricesUSD,
    poolName,
    account,
    library,
    chainId,
    swapStats,
  ])

  return poolData
}
