/* eslint-disable */
import {
  BRIDGE_CONTRACT_ADDRESSES,
  BTC_POOL_NAME,
  BUSD,
  BUSD_METAPOOL_FARM_NAME,
  BUSD_METAPOOL_NAME,
  DAI,
  FARMS_MAP,
  FRAX,
  FRAX_METAPOOL_NAME,
  FRAX_METAPOOL_FARM_NAME,
  MAI_METAPOOL_NAME,
  UST_METAPOOL_FARM_NAME,
  FRAX_STABLES_LP_POOL_NAME,
  FarmName,
  POOLS_MAP,
  PoolName,
  ROSE,
  ROSE_CONTRACT_ADDRESSES,
  ROSE_FRAX_NLP_FARM_NAME,
  ROSE_PAD_NLP_FARM_NAME,
  SROSE,
  SROSE_CONTRACT_ADDRESSES,
  STABLECOIN_POOL_V2_NAME,
  STABLECOIN_SWAP_V2_TOKEN,
  STABLES_FARM_NAME,
  STAKED_ROSE_LP_POOL_NAME,
  SWAP_MIGRATOR_USD_CONTRACT_ADDRESSES,
  SYNTHETIX_CONTRACT_ADDRESSES,
  SYNTHETIX_EXCHANGE_RATES_CONTRACT_ADDRESSES,
  Token,
  USDC,
  USDT,
  isLegacySwapABIPool,
  isMetaPool,
  UST_METAPOOL_NAME,
  UST,
  MAI,
  MAI_METAPOOL_FARM_NAME,
  BorrowMarketName,
  BORROW_MARKET_MAP,
} from "../constants"

import VASE_ABI from "../constants/abis/Vase.json"
import { Vase } from "../../types/ethers-contracts/Vase"
import BRIDGE_CONTRACT_ABI from "../constants/abis/bridge.json"
import { Bridge } from "../../types/ethers-contracts/Bridge"
import GARDEN_ABI from "../constants/abis/Garden.json"
import { Contract } from "@ethersproject/contracts"
import ERC20_ABI from "../constants/abis/erc20.json"
import MULTIMINTER_ABI from "../constants/abis/multiminter.json"
import { Erc20 } from "../../types/ethers-contracts/Erc20"
import FRAX_META_POOL_ABI from "../constants/abis/FraxMetaPool.json"
import { FraxMetaPool } from "../../types/ethers-contracts/FraxMetaPool"
import META_SWAP_DEPOSIT_ABI from "../constants/abis/metaSwapDeposit.json"
import MIGRATOR_USD_CONTRACT_ABI from "../constants/abis/swapMigratorUSD.json"
import { MetaSwapDeposit } from "../../types/ethers-contracts/MetaSwapDeposit"
import ORACLE_ABI from "../constants/abis/Oracle.json"
import { Oracle } from "../../types/ethers-contracts/Oracle"
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
import { Garden } from "../../types/ethers-contracts/Garden"

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

// TO-DO: update ABI and replace function with generic getContract call
export function useFarmContract(farmName: FarmName): RoseStablesFarm | null {
  const { chainId, account, library } = useActiveWeb3React()
  return useMemo(() => {
    if (!farmName || !library || !chainId) return null
    try {
      const farm = FARMS_MAP[farmName]
      if (typeof farm.addresses === undefined) return null
      switch (farmName) {
        case STABLES_FARM_NAME:
          return getContract(
            farm.addresses[chainId],
            JSON.stringify(ROSE_STABLES_FARM_ABI.abi),
            library,
            account ?? undefined,
          ) as RoseStablesFarm
        case FRAX_METAPOOL_FARM_NAME:
          return getContract(
            farm.addresses[chainId],
            JSON.stringify(ROSE_STABLES_FARM_ABI.abi),
            library,
            account ?? undefined,
          ) as RoseStablesFarm
        case UST_METAPOOL_FARM_NAME:
          return getContract(
            farm.addresses[chainId],
            JSON.stringify(ROSE_STABLES_FARM_ABI.abi),
            library,
            account ?? undefined,
          ) as RoseStablesFarm
        case ROSE_PAD_NLP_FARM_NAME:
          return getContract(
            farm.addresses[chainId],
            JSON.stringify(ROSE_STABLES_FARM_ABI.abi),
            library,
            account ?? undefined,
          ) as RoseStablesFarm
        case ROSE_FRAX_NLP_FARM_NAME:
          return getContract(
            farm.addresses[chainId],
            JSON.stringify(ROSE_STABLES_FARM_ABI.abi),
            library,
            account ?? undefined,
          ) as RoseStablesFarm
        case BUSD_METAPOOL_FARM_NAME:
          return getContract(
            farm.addresses[chainId],
            JSON.stringify(ROSE_STABLES_FARM_ABI.abi),
            library,
            account ?? undefined,
          ) as RoseStablesFarm
        case MAI_METAPOOL_FARM_NAME:
          return getContract(
            farm.addresses[chainId],
            JSON.stringify(ROSE_STABLES_FARM_ABI.abi),
            library,
            account ?? undefined,
          ) as RoseStablesFarm
        // case SROSE_FARM_NAME:
        //   return getContract(
        //     farm.addresses[chainId],
        //     JSON.stringify(ROSE_STABLES_FARM_ABI.abi),
        //     library,
        //     account ?? undefined,
        //   ) as RoseStablesFarm
        default:
          return null
      }
    } catch (error) {
      console.error("Failed to get contract", error)
      return null
    }
  }, [chainId, library, account, farmName])
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

export function useGardenContract(
  borrowMarket: BorrowMarketName,
): Garden | null {
  const { chainId } = useActiveWeb3React()
  const contractAddress = chainId
    ? BORROW_MARKET_MAP[borrowMarket].gardenAddresses[chainId]
    : undefined
  return useContract(contractAddress, JSON.stringify(GARDEN_ABI)) as Garden
}

export function useVaseContract(
  borrowMarket: BorrowMarketName,
): Vase | null {
  const { chainId } = useActiveWeb3React()
  const contractAddress = chainId
    ? BORROW_MARKET_MAP[borrowMarket].vaseAddresses[chainId]
    : undefined
  return useContract(contractAddress, JSON.stringify(VASE_ABI)) as Vase
}

export function useCollateralContract(
  borrowMarket: BorrowMarketName,
): Erc20 | null {
  const { chainId } = useActiveWeb3React()
  const contractAddress = chainId
    ? BORROW_MARKET_MAP[borrowMarket].collateralToken.addresses[chainId]
    : undefined
  return useContract(contractAddress, JSON.stringify(ERC20_ABI)) as Erc20
}

export function useBorrowContract(
  borrowMarket: BorrowMarketName,
): Erc20 | null {
  const { chainId } = useActiveWeb3React()
  const contractAddress = chainId
    ? BORROW_MARKET_MAP[borrowMarket].borrowToken.addresses[chainId]
    : undefined
  return useContract(contractAddress, JSON.stringify(ERC20_ABI)) as Erc20
}

export function useOracleContract(
  borrowMarket: BorrowMarketName,
): Oracle | null {
  const { chainId } = useActiveWeb3React()
  const contractAddress = chainId
    ? BORROW_MARKET_MAP[borrowMarket].oracleAddresses[chainId]
    : undefined
  return useContract(contractAddress, JSON.stringify(ORACLE_ABI)) as Oracle
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
        case FRAX_METAPOOL_NAME:
          return getContract(
            pool.addresses[chainId],
            JSON.stringify(FRAX_META_POOL_ABI),
            library,
            account ?? undefined,
          ) as FraxMetaPool
        case UST_METAPOOL_NAME:
          return getContract(
            pool.addresses[chainId],
            JSON.stringify(FRAX_META_POOL_ABI),
            library,
            account ?? undefined,
          ) as FraxMetaPool
        case BUSD_METAPOOL_NAME:
          return getContract(
            pool.addresses[chainId],
            JSON.stringify(FRAX_META_POOL_ABI),
            library,
            account ?? undefined,
          ) as FraxMetaPool
        case MAI_METAPOOL_NAME:
          return getContract(
            pool.addresses[chainId],
            JSON.stringify(FRAX_META_POOL_ABI),
            library,
            account ?? undefined,
          ) as FraxMetaPool
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
        case FRAX_METAPOOL_NAME:
          return getContract(
            pool.lpToken.addresses[chainId],
            JSON.stringify(ROSE_FRAX_LP_ABI),
            library,
            account ?? undefined,
          ) as RoseFraxLP
        case UST_METAPOOL_NAME:
          return getContract(
            pool.lpToken.addresses[chainId],
            JSON.stringify(ROSE_FRAX_LP_ABI),
            library,
            account ?? undefined,
          ) as RoseFraxLP
        case BUSD_METAPOOL_NAME:
          return getContract(
            pool.lpToken.addresses[chainId],
            JSON.stringify(ROSE_FRAX_LP_ABI),
            library,
            account ?? undefined,
          ) as RoseFraxLP
        case MAI_METAPOOL_NAME:
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

export function useLPTokenContractForFarm(
  farmName: FarmName,
): RoseStablesLP | RoseFraxLP | null {
  const { chainId, account, library } = useActiveWeb3React()
  return useMemo(() => {
    if (!farmName || !library || !chainId) return null
    try {
      const farm = FARMS_MAP[farmName]
      // use RoseFraxLP for a standard farm with 18 decimals each
      switch (farmName) {
        case STABLES_FARM_NAME:
          return getContract(
            farm.lpToken.addresses[chainId],
            JSON.stringify(ROSE_STABLES_LP_ABI),
            library,
            account ?? undefined,
          ) as RoseStablesLP
        case FRAX_METAPOOL_FARM_NAME:
          return getContract(
            farm.lpToken.addresses[chainId],
            JSON.stringify(ROSE_FRAX_LP_ABI),
            library,
            account ?? undefined,
          ) as RoseFraxLP
        case UST_METAPOOL_FARM_NAME:
          return getContract(
            farm.lpToken.addresses[chainId],
            JSON.stringify(ROSE_FRAX_LP_ABI),
            library,
            account ?? undefined,
          ) as RoseFraxLP
        case ROSE_PAD_NLP_FARM_NAME:
          return getContract(
            farm.lpToken.addresses[chainId],
            JSON.stringify(ROSE_FRAX_LP_ABI),
            library,
            account ?? undefined,
          ) as RoseFraxLP
        case ROSE_FRAX_NLP_FARM_NAME:
          return getContract(
            farm.lpToken.addresses[chainId],
            JSON.stringify(ROSE_FRAX_LP_ABI),
            library,
            account ?? undefined,
          ) as RoseFraxLP
        case BUSD_METAPOOL_FARM_NAME:
          return getContract(
            farm.lpToken.addresses[chainId],
            JSON.stringify(ROSE_FRAX_LP_ABI),
            library,
            account ?? undefined,
          ) as RoseFraxLP
        case MAI_METAPOOL_FARM_NAME:
          return getContract(
            farm.lpToken.addresses[chainId],
            JSON.stringify(ROSE_FRAX_LP_ABI),
            library,
            account ?? undefined,
          ) as RoseFraxLP
        // case SROSE_FARM_NAME:
        //   return getContract(
        //     farm.lpToken.addresses[chainId],
        //     JSON.stringify(ROSE_FRAX_LP_ABI),
        //     library,
        //     account ?? undefined,
        //   ) as RoseFraxLP
        default:
          return null
      }
    } catch (error) {
      console.error("Failed to get contract", error)
      return null
    }
  }, [chainId, library, account, farmName])
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
  const roseContract = useTokenContract(ROSE) as Erc20
  const stroseContract = useTokenContract(SROSE) as Erc20
  const ustContract = useTokenContract(UST) as Erc20
  const busdContract = useTokenContract(BUSD) as Erc20
  const maiContract = useTokenContract(MAI) as Erc20

  return useMemo(() => {
    if (
      ![
        daiContract,
        usdcContract,
        usdtContract,
        roseStablesLPContract,
        stroseContract,
        ustContract,
        roseContract,
        fraxContract,
        busdContract,
        maiContract,
      ].some(Boolean)
    )
      return null
    return {
      [DAI.symbol]: daiContract,
      [USDC.symbol]: usdcContract,
      [USDT.symbol]: usdtContract,
      [FRAX.symbol]: fraxContract,
      [STABLECOIN_SWAP_V2_TOKEN.symbol]: roseStablesLPContract,
      [ROSE.symbol]: roseContract,
      [SROSE.symbol]: stroseContract,
      [UST.symbol]: ustContract,
      [BUSD.symbol]: busdContract,
      [MAI.symbol]: maiContract,
    }
  }, [
    daiContract,
    usdcContract,
    usdtContract,
    roseStablesLPContract,
    fraxContract,
    roseContract,
    stroseContract,
    ustContract,
    busdContract,
  ])
}

export function useTestnetMinterContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  const contractAddress = "0xb007167714e2940013EC3bb551584130B7497E22"
  return useContract(contractAddress, MULTIMINTER_ABI) as Contract
}
