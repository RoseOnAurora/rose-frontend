import {
  BRIDGE_CONTRACT_ADDRESSES,
  BTC_POOL_NAME,
  DAI,
  FRAX,
  FRAX_STABLES_LP_POOL_NAME,
  POOLS_MAP,
  PoolName,
  ROSE_CONTRACT_ADDRESSES,
  ROSE_FARM_STABLES_ADDRESSES,
  SROSE_CONTRACT_ADDRESSES,
  STABLECOIN_POOL_V2_NAME,
  STABLECOIN_SWAP_V2_TOKEN,
  STAKED_ROSE_LP_POOL_NAME,
  SWAP_MIGRATOR_USD_CONTRACT_ADDRESSES,
  SYNTHETIX_CONTRACT_ADDRESSES,
  SYNTHETIX_EXCHANGE_RATES_CONTRACT_ADDRESSES,
  Token,
  USDC,
  USDT,
  isLegacySwapABIPool,
  isMetaPool,
} from "../constants"

import BRIDGE_CONTRACT_ABI from "../constants/abis/bridge.json"
import { Bridge } from "../../types/ethers-contracts/Bridge"
import { Contract } from "@ethersproject/contracts"
import ERC20_ABI from "../constants/abis/erc20.json"
import { Erc20 } from "../../types/ethers-contracts/Erc20"
import META_SWAP_DEPOSIT_ABI from "../constants/abis/metaSwapDeposit.json"
import MIGRATOR_USD_CONTRACT_ABI from "../constants/abis/swapMigratorUSD.json"
import { MetaSwapDeposit } from "../../types/ethers-contracts/MetaSwapDeposit"
import ROSE_FRAX_LP_ABI from "../constants/abis/RoseFraxLP.json"
import ROSE_FRAX_POOL_ABI from "../constants/abis/RoseFraxPool.json"
import ROSE_STABLES_FARM_ABI from "../constants/abis/RoseStablesFarm.json"
import ROSE_STABLES_LP_ABI from "../constants/abis/RoseStablesLP.json"
import ROSE_STABLES_POOL_ABI from "../constants/abis/RoseStablesPool.json"
import { RoseFraxLP } from "../../types/ethers-contracts/RoseFraxLP"
import { RoseFraxPool } from "../../types/ethers-contracts/RoseFraxPool"
import { RoseStablesFarm } from "../../types/ethers-contracts/RoseStablesFarm"
import { RoseStablesLP } from "../../types/ethers-contracts/RoseStablesLP"
import { RoseStablesPool } from "../../types/ethers-contracts/RoseStablesPool"
import SROSE_ABI from "../constants/abis/stRose.json"
import SWAP_FLASH_LOAN_ABI from "../constants/abis/swapFlashLoan.json"
import SWAP_FLASH_LOAN_NO_WITHDRAW_FEE_ABI from "../constants/abis/swapFlashLoanNoWithdrawFee.json"
import SWAP_GUARDED_ABI from "../constants/abis/swapGuarded.json"
import SYNTHETIX_EXCHANGE_RATE_CONTRACT_ABI from "../constants/abis/synthetixExchangeRate.json"
import SYNTHETIX_NETWORK_TOKEN_CONTRACT_ABI from "../constants/abis/synthetixNetworkToken.json"
import { StRose } from "../../types/ethers-contracts/StRose"
import { SwapFlashLoan } from "../../types/ethers-contracts/SwapFlashLoan"
import { SwapFlashLoanNoWithdrawFee } from "../../types/ethers-contracts/SwapFlashLoanNoWithdrawFee"
import { SwapGuarded } from "../../types/ethers-contracts/SwapGuarded"
import { SwapMigratorUSD } from "../../types/ethers-contracts/SwapMigratorUSD"
import { SynthetixExchangeRate } from "../../types/ethers-contracts/SynthetixExchangeRate"
import { SynthetixNetworkToken } from "../../types/ethers-contracts/SynthetixNetworkToken"
import { getContract } from "../utils"
import { useActiveWeb3React } from "./index"
import { useMemo } from "react"

// returns null on errors
function useContract(
  address: string | undefined,
  ABI: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  withSignerIfPossible = true,
): Contract | null {
  const { library, account } = useActiveWeb3React()

  return useMemo(() => {
    if (!address || !ABI || !library) return null
    try {
      return getContract(
        address,
        ABI,
        library,
        withSignerIfPossible && account ? account : undefined,
      )
    } catch (error) {
      console.error("Failed to get contract", error)
      return null
    }
  }, [address, ABI, library, withSignerIfPossible, account])
}

export function useRoseStablesFarmContract(): RoseStablesFarm | null {
  const { chainId } = useActiveWeb3React()
  const contractAddress: string | undefined = chainId
    ? ROSE_FARM_STABLES_ADDRESSES[chainId]
    : undefined
  return useContract(
    contractAddress,
    ROSE_STABLES_FARM_ABI.abi,
  ) as RoseStablesFarm
}

export function useRoseContract(): Erc20 | null {
  const { chainId } = useActiveWeb3React()
  const contractAddress = chainId ? ROSE_CONTRACT_ADDRESSES[chainId] : undefined
  return useContract(contractAddress, ERC20_ABI) as Erc20
}

export function useStRoseContract(): StRose | null {
  const { chainId } = useActiveWeb3React()
  const contractAddress = chainId
    ? SROSE_CONTRACT_ADDRESSES[chainId]
    : undefined
  return useContract(contractAddress, SROSE_ABI.abi) as StRose
}

export function useSwapMigratorUSDContract(): SwapMigratorUSD | null {
  const { chainId } = useActiveWeb3React()
  const contractAddress = chainId
    ? SWAP_MIGRATOR_USD_CONTRACT_ADDRESSES[chainId]
    : undefined
  return useContract(
    contractAddress,
    MIGRATOR_USD_CONTRACT_ABI,
  ) as SwapMigratorUSD
}

export function useBridgeContract(): Bridge | null {
  const { chainId } = useActiveWeb3React()
  const contractAddress = chainId
    ? BRIDGE_CONTRACT_ADDRESSES[chainId]
    : undefined
  return useContract(contractAddress, BRIDGE_CONTRACT_ABI) as Bridge
}

export function useSynthetixContract(): SynthetixNetworkToken | null {
  const { chainId } = useActiveWeb3React()
  const contractAddress = chainId
    ? SYNTHETIX_CONTRACT_ADDRESSES[chainId]
    : undefined
  return useContract(
    contractAddress,
    SYNTHETIX_NETWORK_TOKEN_CONTRACT_ABI,
  ) as SynthetixNetworkToken
}

export function useSynthetixExchangeRatesContract(): SynthetixExchangeRate | null {
  const { chainId } = useActiveWeb3React()
  const contractAddress = chainId
    ? SYNTHETIX_EXCHANGE_RATES_CONTRACT_ADDRESSES[chainId]
    : undefined
  return useContract(
    contractAddress,
    SYNTHETIX_EXCHANGE_RATE_CONTRACT_ABI,
  ) as SynthetixExchangeRate
}

export function useTokenContract(
  t: Token,
  withSignerIfPossible?: boolean,
): Contract | null {
  const { chainId } = useActiveWeb3React()
  const tokenAddress = chainId ? t.addresses[chainId] : undefined
  return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible)
}

export function usePoolContract(poolName?: PoolName): Contract | null {
  const { chainId, account, library } = useActiveWeb3React()
  return useMemo(() => {
    if (!poolName || !library || !chainId) return null
    try {
      const pool = POOLS_MAP[poolName]
      if (typeof pool.addresses === undefined) return null
      // use RoseFraxPool for a standard pool with 2 assets with 18 decimals each
      switch (poolName) {
        case STABLECOIN_POOL_V2_NAME:
          return getContract(
            pool.addresses[chainId],
            JSON.stringify(ROSE_STABLES_POOL_ABI),
            library,
            account ?? undefined,
          ) as RoseStablesPool
        case FRAX_STABLES_LP_POOL_NAME:
          return getContract(
            pool.addresses[chainId],
            JSON.stringify(ROSE_FRAX_POOL_ABI),
            library,
            account ?? undefined,
          ) as RoseFraxPool
        case STAKED_ROSE_LP_POOL_NAME:
          return getContract(
            pool.addresses[chainId],
            JSON.stringify(ROSE_FRAX_POOL_ABI),
            library,
            account ?? undefined,
          ) as RoseFraxPool
        default:
          return null
      }
    } catch (error) {
      console.error("Failed to get contract", error)
      return null
    }
  }, [chainId, library, account, poolName])
}

export function useSwapContract<T extends PoolName>(
  poolName?: T,
): T extends typeof BTC_POOL_NAME
  ? SwapGuarded | null
  : SwapFlashLoan | SwapFlashLoanNoWithdrawFee | MetaSwapDeposit | null
export function useSwapContract(
  poolName?: PoolName,
):
  | SwapGuarded
  | SwapFlashLoan
  | SwapFlashLoanNoWithdrawFee
  | MetaSwapDeposit
  | null {
  const { chainId, account, library } = useActiveWeb3React()
  return useMemo(() => {
    if (!poolName || !library || !chainId) return null
    try {
      const pool = POOLS_MAP[poolName]
      if (poolName === BTC_POOL_NAME) {
        return getContract(
          pool.addresses[chainId],
          SWAP_GUARDED_ABI,
          library,
          account ?? undefined,
        ) as SwapGuarded
      } else if (isLegacySwapABIPool(poolName)) {
        return getContract(
          pool.addresses[chainId],
          SWAP_FLASH_LOAN_ABI,
          library,
          account ?? undefined,
        ) as SwapFlashLoan
      } else if (isMetaPool(poolName)) {
        return getContract(
          pool.addresses[chainId],
          META_SWAP_DEPOSIT_ABI,
          library,
          account ?? undefined,
        ) as MetaSwapDeposit
      } else if (pool) {
        return getContract(
          pool.addresses[chainId],
          SWAP_FLASH_LOAN_NO_WITHDRAW_FEE_ABI,
          library,
          account ?? undefined,
        ) as SwapFlashLoanNoWithdrawFee
      } else {
        return null
      }
    } catch (error) {
      console.error("Failed to get contract", error)
      return null
    }
  }, [chainId, library, account, poolName])
}

export function useLPTokenContract(
  poolName: PoolName,
): RoseStablesLP | RoseFraxLP | null {
  const { chainId, account, library } = useActiveWeb3React()
  return useMemo(() => {
    if (!poolName || !library || !chainId) return null
    try {
      const pool = POOLS_MAP[poolName]
      // use RoseFraxLP for a standard pool with 2 assets with 18 decimals each
      switch (poolName) {
        case STABLECOIN_POOL_V2_NAME:
          return getContract(
            pool.lpToken.addresses[chainId],
            JSON.stringify(ROSE_STABLES_LP_ABI),
            library,
            account ?? undefined,
          ) as RoseStablesLP
        case FRAX_STABLES_LP_POOL_NAME:
          return getContract(
            pool.lpToken.addresses[chainId],
            JSON.stringify(ROSE_FRAX_LP_ABI),
            library,
            account ?? undefined,
          ) as RoseFraxLP
        case STAKED_ROSE_LP_POOL_NAME:
          return getContract(
            pool.lpToken.addresses[chainId],
            JSON.stringify(ROSE_FRAX_LP_ABI),
            library,
            account ?? undefined,
          ) as RoseFraxLP
        default:
          return null
      }
    } catch (error) {
      console.error("Failed to get contract", error)
      return null
    }
  }, [chainId, library, account, poolName])
}

interface AllContractsObject {
  [x: string]: RoseStablesLP | Erc20 | null
}
export function useAllContracts(): AllContractsObject | null {
  const daiContract = useTokenContract(DAI) as Erc20
  const usdcContract = useTokenContract(USDC) as Erc20
  const usdtContract = useTokenContract(USDT) as Erc20
  const fraxContract = useTokenContract(FRAX) as Erc20
  const roseStablesLPContract = useTokenContract(
    STABLECOIN_SWAP_V2_TOKEN,
  ) as RoseStablesLP

  return useMemo(() => {
    if (
      ![daiContract, usdcContract, usdtContract, roseStablesLPContract].some(
        Boolean,
      )
    )
      return null
    return {
      [DAI.symbol]: daiContract,
      [USDC.symbol]: usdcContract,
      [USDT.symbol]: usdtContract,
      [FRAX.symbol]: fraxContract,
      [STABLECOIN_SWAP_V2_TOKEN.symbol]: roseStablesLPContract,
    }
  }, [
    daiContract,
    usdcContract,
    usdtContract,
    roseStablesLPContract,
    fraxContract,
  ])
}
