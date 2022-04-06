import {
  BORROW_MARKET_MAP,
  BRIDGE_CONTRACT_ADDRESSES,
  BUSD,
  BorrowMarketName,
  DAI,
  FARMS_MAP,
  FRAX,
  FarmName,
  MAI,
  POOLS_MAP,
  PoolName,
  ROSE,
  ROSE_CONTRACT_ADDRESSES,
  RUSD,
  RosePool,
  SROSE,
  SROSE_CONTRACT_ADDRESSES,
  STABLECOIN_SWAP_V2_TOKEN,
  SWAP_MIGRATOR_USD_CONTRACT_ADDRESSES,
  SYNTHETIX_CONTRACT_ADDRESSES,
  SYNTHETIX_EXCHANGE_RATES_CONTRACT_ADDRESSES,
  Token,
  USDC,
  USDT,
  UST,
  isMetaPool,
} from "../constants"

import BRIDGE_CONTRACT_ABI from "../constants/abis/bridge.json"
import { Bridge } from "../../types/ethers-contracts/Bridge"
import { Contract } from "@ethersproject/contracts"
import ERC20_ABI from "../constants/abis/erc20.json"
import { Erc20 } from "../../types/ethers-contracts/Erc20"
import GARDEN_ABI from "../constants/abis/Garden.json"
import { Garden } from "../../types/ethers-contracts/Garden"
import LPTOKEN_UNGUARDED_ABI from "../constants/abis/lpTokenUnguarded.json"
import { LpTokenUnguarded } from "../../types/ethers-contracts/LpTokenUnguarded"
import MIGRATOR_USD_CONTRACT_ABI from "../constants/abis/swapMigratorUSD.json"
import MULTIMINTER_ABI from "../constants/abis/multiminter.json"
import ORACLE_ABI from "../constants/abis/Oracle.json"
import { Oracle } from "../../types/ethers-contracts/Oracle"
import ROSE_META_POOL_ABI from "../constants/abis/RoseMetaPool.json"
import ROSE_STABLES_FARM_ABI from "../constants/abis/RoseStablesFarm.json"
import ROSE_STABLES_POOL_ABI from "../constants/abis/RoseStablesPool.json"
import { RoseStablesFarm } from "../../types/ethers-contracts/RoseStablesFarm"
import { RoseStablesLP } from "../../types/ethers-contracts/RoseStablesLP"
import SROSE_ABI from "../constants/abis/stRose.json"
import SYNTHETIX_EXCHANGE_RATE_CONTRACT_ABI from "../constants/abis/synthetixExchangeRate.json"
import SYNTHETIX_NETWORK_TOKEN_CONTRACT_ABI from "../constants/abis/synthetixNetworkToken.json"
import { StRose } from "../../types/ethers-contracts/StRose"
import { SwapMigratorUSD } from "../../types/ethers-contracts/SwapMigratorUSD"
import { SynthetixExchangeRate } from "../../types/ethers-contracts/SynthetixExchangeRate"
import { SynthetixNetworkToken } from "../../types/ethers-contracts/SynthetixNetworkToken"
import VASE_ABI from "../constants/abis/Vase.json"
import { Vase } from "../../types/ethers-contracts/Vase"
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

export function useFarmContract(farmName: FarmName): RoseStablesFarm | null {
  const { chainId } = useActiveWeb3React()
  const contractAddress = chainId
    ? FARMS_MAP[farmName].addresses[chainId]
    : undefined
  return useContract(
    contractAddress,
    JSON.stringify(ROSE_STABLES_FARM_ABI.abi),
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

export function useGardenContract(
  borrowMarket: BorrowMarketName,
): Garden | null {
  const { chainId } = useActiveWeb3React()
  const contractAddress = chainId
    ? BORROW_MARKET_MAP[borrowMarket].gardenAddresses[chainId]
    : undefined
  return useContract(contractAddress, JSON.stringify(GARDEN_ABI)) as Garden
}

export function useVaseContract(borrowMarket: BorrowMarketName): Vase | null {
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

export function usePoolContract(poolName?: PoolName): RosePool | null {
  const { chainId } = useActiveWeb3React()
  const contractAddress =
    chainId && poolName ? POOLS_MAP[poolName].addresses[chainId] : undefined
  return useContract(
    contractAddress,
    JSON.stringify(
      isMetaPool(poolName) ? ROSE_META_POOL_ABI : ROSE_STABLES_POOL_ABI,
    ),
  ) as RosePool
}

export function useLPTokenContract(
  poolName: PoolName,
): LpTokenUnguarded | null {
  const { chainId } = useActiveWeb3React()
  const contractAddress = chainId
    ? POOLS_MAP[poolName].lpToken.addresses[chainId]
    : undefined
  return useContract(
    contractAddress,
    JSON.stringify(LPTOKEN_UNGUARDED_ABI),
  ) as LpTokenUnguarded
}

export function useLPTokenContractForFarm(
  farmName: FarmName,
): LpTokenUnguarded | null {
  const { chainId } = useActiveWeb3React()
  const contractAddress = chainId
    ? FARMS_MAP[farmName].lpToken.addresses[chainId]
    : undefined
  return useContract(
    contractAddress,
    JSON.stringify(LPTOKEN_UNGUARDED_ABI),
  ) as LpTokenUnguarded
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
  const rusdContract = useTokenContract(RUSD) as Erc20

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
        rusdContract,
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
      [RUSD.symbol]: rusdContract,
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
    maiContract,
    rusdContract,
  ])
}

export function useTestnetMinterContract(): Contract | null {
  const contractAddress = "0x2cecd376F19218e9964970d0986ceD32c151BA5a"
  return useContract(contractAddress, MULTIMINTER_ABI) as Contract
}
