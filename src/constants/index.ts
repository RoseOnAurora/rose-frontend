import {
  BorrowFilterFields,
  BorrowSortFields,
  PoolFilterFields,
  PoolSortFields,
} from "../state/user"
import { BigNumber } from "@ethersproject/bignumber"
import { RoseMetaPool } from "../../types/ethers-contracts/RoseMetaPool"
import { RoseStablesPool } from "../../types/ethers-contracts/RoseStablesPool"
import atustLogo from "../assets/icons/atust.svg"
import busdLogo from "../assets/icons/busd.svg"
import daiLogo from "../assets/icons/dai.svg"
import fraxLogo from "../assets/icons/frax.svg"
import maiLogo from "../assets/icons/mai.svg"
import nearLogo from "../assets/icons/near_icon.svg"
import roseAtust from "../assets/icons/rose-atust.svg"
import roseBusdLogo from "../assets/icons/rose-busd.svg"
import roseFraxLogo from "../assets/icons/rose-frax.svg"
import roseLogo from "../assets/icons/rose.svg"
import roseMaiLogo from "../assets/icons/rose-mai.svg"
import rusdLogo from "../assets/icons/rusd.svg"
import sRoseLogo from "../assets/icons/srose.svg"
import usdcLogo from "../assets/icons/usdc.svg"
import usdtLogo from "../assets/icons/usdt.svg"
import wbtcLogo from "../assets/icons/wbtc.svg"
import wethLogo from "../assets/icons/weth.svg"

// POOL NAMES
export const STABLECOIN_POOL_V2_NAME = "Stables Pool"
export const FRAX_STABLES_LP_POOL_NAME = "Frax Pool (outdated)"
export const FRAX_METAPOOL_NAME = "Frax Pool"
export const STAKED_ROSE_LP_POOL_NAME = "stRose Pool"
export const UST_METAPOOL_NAME = "UST Pool"
export const BUSD_METAPOOL_NAME = "BUSD Pool"
export const MAI_METAPOOL_NAME = "MAI Pool"
export const RUSD_METAPOOL_NAME = "RUSD Pool"

// FARM NAMES
export const STABLES_FARM_NAME = "Stables Farm"
export const FRAX_METAPOOL_FARM_NAME = "Frax Farm"
export const UST_METAPOOL_FARM_NAME = "UST Farm"
export const ROSE_PAD_NLP_FARM_NAME = "ROSE/PAD PLP Farm"
export const ROSE_FRAX_NLP_FARM_NAME = "ROSE/FRAX PLP Farm"
export const SROSE_FARM_NAME = "stRose Farm"
export const BUSD_METAPOOL_FARM_NAME = "BUSD Farm"
export const MAI_METAPOOL_FARM_NAME = "MAI Farm"
export const RUSD_METAPOOL_FARM_NAME = "RUSD Farm"

// BORROW MARKET NAMES
export const NEAR_MARKET_NAME = "NEAR"
export const STROSE_MARKET_NAME = "stROSE"
export const UST_MARKET_NAME = "UST"
export const USDC_MARKET_NAME = "USDC"
export const USDT_MARKET_NAME = "USDT"
export const wETH_MARKET_NAME = "wETH"
export const wBTC_MARKET_NAME = "wBTC"
export const NEAR_WL_PROXIMITY_MARKET_NAME = "NEAR / Proximity (WL)"

export type PoolName =
  | typeof STABLECOIN_POOL_V2_NAME
  | typeof FRAX_STABLES_LP_POOL_NAME
  | typeof FRAX_METAPOOL_NAME
  | typeof UST_METAPOOL_NAME
  | typeof STAKED_ROSE_LP_POOL_NAME
  | typeof UST_METAPOOL_NAME
  | typeof BUSD_METAPOOL_NAME
  | typeof MAI_METAPOOL_NAME
  | typeof RUSD_METAPOOL_NAME

export type FarmName =
  | typeof STABLES_FARM_NAME
  | typeof FRAX_METAPOOL_FARM_NAME
  | typeof UST_METAPOOL_FARM_NAME
  | typeof ROSE_PAD_NLP_FARM_NAME
  | typeof ROSE_FRAX_NLP_FARM_NAME
  | typeof BUSD_METAPOOL_FARM_NAME
  | typeof MAI_METAPOOL_FARM_NAME
  | typeof RUSD_METAPOOL_FARM_NAME

export type BorrowMarketName =
  | typeof NEAR_MARKET_NAME
  | typeof UST_MARKET_NAME
  | typeof USDC_MARKET_NAME
  | typeof USDT_MARKET_NAME
  | typeof wETH_MARKET_NAME
  | typeof wBTC_MARKET_NAME

export enum ChainId {
  HARDHAT = 31337,
  AURORA_TESTNET = 1313161555,
  AURORA_MAINNET = 1313161554,
  MUMBAI = 80001,
  POLYGON = 137,
}
export enum PoolTypes {
  BTC,
  ETH,
  USD,
  OTHER,
}

export class Token {
  readonly addresses: { [chainId in ChainId]: string }
  readonly decimals: number
  readonly symbol: string
  readonly name: string
  readonly icon: string
  readonly geckoId: string
  readonly isSynthetic: boolean
  readonly isLPToken: boolean

  constructor(
    addresses: { [chainId in ChainId]: string },
    decimals: number,
    symbol: string,
    geckoId: string,
    name: string,
    icon: string,
    isSynthetic = false,
    isLPToken = false,
  ) {
    this.addresses = addresses
    this.decimals = decimals
    this.symbol = symbol
    this.geckoId = geckoId
    this.name = name
    this.icon = icon
    this.isSynthetic = isSynthetic
    this.isLPToken = isLPToken
  }
}

export const STABLECOIN_SWAP_V2_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.HARDHAT]: "0xbf9fBFf01664500A33080Da5d437028b07DFcC55",
  [ChainId.AURORA_TESTNET]: "0x2Ec594949EC5CaEb1430B61FE20aEEe6655756ed",
  [ChainId.AURORA_MAINNET]: "0xc90dB0d8713414d78523436dC347419164544A3f",
  [ChainId.MUMBAI]: "0x6089adcDf1EA0D683223984Fc09Da27caF438FbC",
  [ChainId.POLYGON]: "",
}

export const FRAX_STABLES_LP_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "0x2E7d99fF3a89937339dDC651EdbA6e564B751bE7",
  [ChainId.AURORA_MAINNET]: "0xd812cc1fc1e0a56560796C746B1247e2bd4F31f2",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const FRAX_METAPOOL_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "0xfbC22278A96299D91d41C453234d97b4F5Eb9B2d",
  [ChainId.AURORA_MAINNET]: "0xa34315F1ef49392387Dd143f4578083A9Bd33E94",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const UST_METAPOOL_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "0x1B8f7ac4acCa4ede18848203a54E57DF104C6f30",
  [ChainId.AURORA_MAINNET]: "0x8fe44f5cce02D5BE44e3446bBc2e8132958d22B8",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const BUSD_METAPOOL_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "0xD6cb7Bb7D63f636d1cA72A1D3ed6f7F67678068a",
  [ChainId.AURORA_MAINNET]: "0xD6cb7Bb7D63f636d1cA72A1D3ed6f7F67678068a",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const MAI_METAPOOL_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "0x65a761136815B45A9d78d9781d22d47247B49D23", // TO-DO: need to add testnet
  [ChainId.AURORA_MAINNET]: "0x65a761136815B45A9d78d9781d22d47247B49D23",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const RUSD_METAPOOL_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "0x9ADE30cdd031B35ABBC607496b99480805B579D4",
  [ChainId.AURORA_MAINNET]: "0x79B0a67a4045A7a8DC04b17456F4fe15339cBA34",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const STAKED_ROSE_POOL_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "0x7e27881A7eABb81D0e32e03C498f97517Cb75470",
  [ChainId.AURORA_MAINNET]: "0x36685AfD221622942Df61979d72a0064a17EF291",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const STABLECOIN_SWAP_V2_TOKEN_CONTRACT_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.HARDHAT]: "0xC863F1F636fddce400E7515eCBDAbbEc4d1E0390",
  [ChainId.AURORA_TESTNET]: "0xFDE5214eF60617fb63A688C9C51cF5262254B4b7",
  [ChainId.AURORA_MAINNET]: "0xfF79D5bff48e1C01b722560D6ffDfCe9FC883587",
  [ChainId.MUMBAI]: "0x22123280e5cC4E3a49842c8d2B3444a04Ea153Ad",
  [ChainId.POLYGON]: "",
}

export const FRAX_STABLES_LP_TOKEN_CONTRACT_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "0xC604298cAf81dEeFd245343e7c891b4C8860CB0E",
  [ChainId.AURORA_MAINNET]: "0xbB5279353d88A25F099A334Ba49CDCb1CF4b5A7c",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const FRAX_METAPOOL_LP_TOKEN_CONTRACT_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "0x4EE6eCAD1c2Dae9f525404De8555724e3c35d07B",
  [ChainId.AURORA_MAINNET]: "0x4463A118A2fB34640ff8eF7Fe1B3abAcd4aC9fB7",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const UST_METAPOOL_LP_TOKEN_CONTRACT_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "0x1BCD872ECEf68C77465a8dADa1d915D7Af206bF5",
  [ChainId.AURORA_MAINNET]: "0x94A7644E4D9CA0e685226254f88eAdc957D3c263",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const ROSE_PAD_NLP_TOKEN_CONTRACT_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "0xC6C3cc84EabD4643C382C988fA2830657fc70a6B", // TO-DO: UPDATE
  [ChainId.AURORA_MAINNET]: "0xC6C3cc84EabD4643C382C988fA2830657fc70a6B",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const ROSE_FRAX_NLP_TOKEN_CONTRACT_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "0xeD4C231b98b474f7cAeCAdD2736e5ebC642ad707", // TO-DO: UPDATE
  [ChainId.AURORA_MAINNET]: "0xeD4C231b98b474f7cAeCAdD2736e5ebC642ad707",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const SROSE_LP_TOKEN_CONTRACT_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "0xcb2B566B1e643d068DE7DE76C5420A1c63ceD299",
  [ChainId.AURORA_MAINNET]: "0x7Ba8C17010a48283D38a4bd5f87EfEB5594c92f8",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const BUSD_METAPOOL_LP_TOKEN_CONTRACT_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "0x158f57CF9A4DBFCD1Bc521161d86AeCcFC5aF3Bc", // note: missing testnet deployment
  [ChainId.AURORA_MAINNET]: "0x158f57CF9A4DBFCD1Bc521161d86AeCcFC5aF3Bc",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const MAI_METAPOOL_LP_TOKEN_CONTRACT_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "0xA7ae42224Bf48eCeFc5f838C230EE339E5fd8e62", // note: missing testnet deployment
  [ChainId.AURORA_MAINNET]: "0xA7ae42224Bf48eCeFc5f838C230EE339E5fd8e62",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const STABLECOIN_SWAP_V2_TOKEN = new Token(
  STABLECOIN_SWAP_V2_TOKEN_CONTRACT_ADDRESSES,
  18,
  "RoseStablesLP",
  "tether", // tracking USDT for now, as we can't fetch price for RoseStablesLP
  "RoseStablesLP",
  roseLogo,
  false,
  true,
)

export const FRAX_STABLES_LP_TOKEN = new Token(
  FRAX_STABLES_LP_TOKEN_CONTRACT_ADDRESSES,
  18,
  "RoseFraxLP",
  "tether", // tracking tether: cannot fetch coingecko for LPs
  "Rose FRAX/StablesLP",
  roseFraxLogo,
  false,
  true,
)

export const FRAX_METAPOOL_LP_TOKEN = new Token(
  FRAX_METAPOOL_LP_TOKEN_CONTRACT_ADDRESSES,
  18,
  "RoseFraxLP",
  "tether", // tracking tether: cannot fetch coingecko for LPs
  "Rose FRAX/StablesLP",
  roseFraxLogo,
  false,
  true,
)

export const UST_METAPOOL_LP_TOKEN = new Token(
  UST_METAPOOL_LP_TOKEN_CONTRACT_ADDRESSES,
  18,
  "RoseUSTLP",
  "tether", // tracking tether: cannot fetch coingecko for LPs
  "Rose atUST/StablesLP",
  roseAtust,
  false,
  true,
)

export const ROSE_PAD_NLP_TOKEN = new Token(
  ROSE_PAD_NLP_TOKEN_CONTRACT_ADDRESSES,
  18,
  "RosePadNLP",
  "tether", // tracking tether: cannot fetch coingecko for LPs
  "ROSE/PAD PLP",
  roseLogo, // TO-DO: change to new logo
  false,
  true,
)

export const ROSE_FRAX_NLP_TOKEN = new Token(
  ROSE_FRAX_NLP_TOKEN_CONTRACT_ADDRESSES,
  18,
  "RoseFraxNLP",
  "tether", // tracking tether: cannot fetch coingecko for LPs
  "ROSE/FRAX PLP",
  roseFraxLogo, // TO-DO: change to new logo
  false,
  true,
)

export const SROSE_LP_TOKEN = new Token(
  SROSE_LP_TOKEN_CONTRACT_ADDRESSES,
  18,
  "StakedRoseLP",
  "tether", // tracking tether: cannot fetch coingecko for LPs
  "Rose ROSE/stROSE",
  sRoseLogo, // TO-DO: change to new logo
  false,
  true,
)

export const BUSD_METAPOOL_LP_TOKEN = new Token(
  BUSD_METAPOOL_LP_TOKEN_CONTRACT_ADDRESSES,
  18,
  "RoseBUSDLP",
  "tether", // tracking tether: cannot fetch coingecko for LPs
  "Rose/BUSD LP",
  roseBusdLogo,
  false,
  true,
)

export const MAI_METAPOOL_LP_TOKEN = new Token(
  MAI_METAPOOL_LP_TOKEN_CONTRACT_ADDRESSES,
  18,
  "RoseMAILP",
  "tether", // tracking tether: cannot fetch coingecko for LPs
  "Rose MAI/Stables",
  roseMaiLogo,
  false,
  true,
)

export const RUSD_LP_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "0x6703fbE3DE7Bc184C138015116C4Cc44FdC059F3",
  [ChainId.AURORA_MAINNET]: "0x56f87a0cB4713eB513BAf57D5E81750433F5fcB9",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const RUSD_LP_TOKEN = new Token(
  RUSD_LP_CONTRACT_ADDRESSES,
  18,
  "RoseRUSDLP",
  "tether", // tracking tether: cannot fetch coingecko for LPs
  "Rose RUSD/Stables",
  rusdLogo,
  false,
  true,
)

const DAI_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.HARDHAT]: "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0",
  [ChainId.AURORA_TESTNET]: "0x22EE86789837529E2F58Fd6D1dD6B0B26fc1e092",
  [ChainId.AURORA_MAINNET]: "0xe3520349F477A5F6EB06107066048508498A291b",
  [ChainId.MUMBAI]: "0x32dbDB1A71A33f2880C0156Ce4378d01289a8aB9",
  [ChainId.POLYGON]: "",
}
export const DAI = new Token(
  DAI_CONTRACT_ADDRESSES,
  18,
  "DAI",
  "dai",
  "Dai",
  daiLogo,
)

const USDC_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.HARDHAT]: "0x9A676e781A523b5d0C0e43731313A708CB607508",
  [ChainId.AURORA_TESTNET]: "0x84606Cf2905f7004D6164a7aC2884A36BC8a0A90",
  [ChainId.AURORA_MAINNET]: "0xB12BFcA5A55806AaF64E99521918A4bf0fC40802",
  [ChainId.MUMBAI]: "0xEe86Fe5EbbB958719b09769962a90ca69CC7C66F",
  [ChainId.POLYGON]: "",
}
export const USDC = new Token(
  USDC_CONTRACT_ADDRESSES,
  6,
  "USDC",
  "usd-coin",
  "USDC Coin",
  usdcLogo,
)

const USDT_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.HARDHAT]: "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1",
  [ChainId.AURORA_TESTNET]: "0x8547A073cbc7D4aF48aD061b9D005C06D55337F5",
  [ChainId.AURORA_MAINNET]: "0x4988a896b1227218e4A686fdE5EabdcAbd91571f",
  [ChainId.MUMBAI]: "0x16Fbf31F969C91506f1a17Fb2799b04D379f441f",
  [ChainId.POLYGON]: "",
}
export const USDT = new Token(
  USDT_CONTRACT_ADDRESSES,
  6,
  "USDT",
  "tether",
  "Tether",
  usdtLogo,
)

const FRAX_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.HARDHAT]: "0x851356ae760d987E095750cCeb3bC6014560891C",
  [ChainId.AURORA_TESTNET]: "0xBEc49fA140aCaA83533fB00A2BB19bDdd0290f25",
  [ChainId.AURORA_MAINNET]: "0xda2585430fef327ad8ee44af8f1f989a2a91a3d2",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}
export const FRAX = new Token(
  FRAX_CONTRACT_ADDRESSES,
  18,
  "FRAX",
  "frax",
  "Frax",
  fraxLogo,
)

const UST_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "0xFE643843B9F4CfF9bbd57Ac2150d95858a0dCDd6",
  [ChainId.AURORA_MAINNET]: "0x5ce9F0B6AFb36135b5ddBF11705cEB65E634A9dC",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const UST = new Token(
  UST_CONTRACT_ADDRESSES,
  18,
  "atUST",
  "terrausd",
  "UST Terra",
  atustLogo,
)

export const ROSE_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "0xfbBfA407fb908e4D58145762788062521C816332",
  [ChainId.AURORA_MAINNET]: "0xdcD6D4e2B3e1D1E1E6Fa8C21C8A323DcbecfF970",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const ROSE = new Token(
  ROSE_CONTRACT_ADDRESSES,
  18,
  "ROSE",
  "rose",
  "Rose Token",
  roseLogo,
)

export const SROSE_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "0x777764757A453327fBfb8f3a979C7F2E58c0F9aD",
  [ChainId.AURORA_MAINNET]: "0xe23d2289FBca7De725DC21a13fC096787A85e16F",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const SROSE = new Token(
  SROSE_CONTRACT_ADDRESSES,
  18,
  "stROSE",
  "strose",
  "Staked Rose Tokens",
  sRoseLogo,
)

export const BUSD_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "0x5C92A4A7f59A9484AFD79DbE251AD2380E589783", // note: no testnet deployment
  [ChainId.AURORA_MAINNET]: "0x5C92A4A7f59A9484AFD79DbE251AD2380E589783",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const BUSD = new Token(
  BUSD_CONTRACT_ADDRESSES,
  18,
  "abBUSD",
  "binance-usd",
  "BUSD BSC (Allbridge)",
  busdLogo,
)

export const MAI_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "0xdFA46478F9e5EA86d57387849598dbFB2e964b02", // note: no testnet deployment
  [ChainId.AURORA_MAINNET]: "0xdFA46478F9e5EA86d57387849598dbFB2e964b02",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const MAI = new Token(
  MAI_CONTRACT_ADDRESSES,
  18,
  "MAI",
  "tether",
  "MAI",
  maiLogo,
)

export const RUSD_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "0x444C98b60Fa3F8A74335EC8893b2f9CE5c83b1df",
  [ChainId.AURORA_MAINNET]: "0x19cc40283B057D6608C22F1D20F17e16C245642E",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const RUSD = new Token(
  RUSD_CONTRACT_ADDRESSES,
  18,
  "RUSD",
  "tether", // to-do: update
  "RoseUSD",
  rusdLogo,
)

export const NEAR_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "0x7A7486B50440F560fc45983b313E4078EB41080c",
  [ChainId.AURORA_MAINNET]: "0xC42C30aC6Cc15faC9bD938618BcaA1a1FaE8501d",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const NEAR = new Token(
  NEAR_CONTRACT_ADDRESSES,
  24,
  "NEAR",
  "near", // to-do: update
  "Near",
  nearLogo, // to-do: update
)

const WETH_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.HARDHAT]: "0x3Aa5ebB10DC797CAC828524e59A333d0A371443c",
  [ChainId.AURORA_TESTNET]: "", // TO-DO: update testnet
  [ChainId.AURORA_MAINNET]: "0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}
export const WETH = new Token(
  WETH_CONTRACT_ADDRESSES,
  18,
  "WETH",
  "ethereum",
  "WETH",
  wethLogo,
)

const WBTC_CONTRACT_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.HARDHAT]: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
  [ChainId.AURORA_TESTNET]: "", // TO-DO: missing testnet
  [ChainId.AURORA_MAINNET]: "0xf4eb217ba2454613b15dbdea6e5f22276410e89e",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}
export const WBTC = new Token(
  WBTC_CONTRACT_ADDRESSES,
  8,
  "WBTC",
  "wrapped-bitcoin",
  "WBTC",
  wbtcLogo,
)

export const ROSE_FARM_STABLES_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "0xd7aA8Cf4811b8faFb423085BD2f77C3883eA9Ea3",
  [ChainId.AURORA_MAINNET]: "0x52CACa9a2D52b27b28767d3649565774A3B991f3",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const FRAX_METAPOOL_FARM_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "0xD42912755319665397FF090fBB63B1a31aE87Cee",
  [ChainId.AURORA_MAINNET]: "0xB9D873cDc15e462f5414CCdFe618a679a47831b4",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const UST_METAPOOL_FARM_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "0xfcDB4564c18A9134002b9771816092C9693622e3",
  [ChainId.AURORA_MAINNET]: "0x56DE5E2c25828040330CEF45258F3FFBc090777C",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const ROSE_PAD_NLP_FARM_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "0xfF79D5bff48e1C01b722560D6ffDfCe9FC883587",
  [ChainId.AURORA_MAINNET]: "0x9b2aE7d53099Ec64e2f6df3B4151FFCf7205f788",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const ROSE_FRAX_NLP_FARM_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "0xd7Fd3210a40495ef13adeC5c4c591Fe7794b8b8a",
  [ChainId.AURORA_MAINNET]: "0x1B10bFCd6192edC573ced7Db7c7e403c7FAb8068",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const SROSE_FARM_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "0xA5BA452C32664b86c44556872F1a8011Bf35C6E8",
  [ChainId.AURORA_MAINNET]: "0x247c9DA96BfC4720580ee84E01566D79a8c901ca",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const BUSD_FARM_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "0x18A6115150A060F22Bacf62628169ee9b231368f", // note: missing testnet deployment
  [ChainId.AURORA_MAINNET]: "0x18A6115150A060F22Bacf62628169ee9b231368f",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const MAI_FARM_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "0x226991aADeEfDe03bF557eF067da95fc613aBfFc", // note: missing testnet deployment
  [ChainId.AURORA_MAINNET]: "0x226991aADeEfDe03bF557eF067da95fc613aBfFc",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const RUSD_FARM_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "0x9286d58C1c8d434Be809221923Cf4575f7A4d058", // note: missing testnet deployment
  [ChainId.AURORA_MAINNET]: "0x9286d58C1c8d434Be809221923Cf4575f7A4d058",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const FRAX_METAPOOL_DEPOSIT_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "0xC9a43158891282A2B1475592D5719c001986Aaec",
  [ChainId.AURORA_MAINNET]: "0x8a36Fd6F3502c60107E6711E4d98d933e4Da8EC3",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const UST_METAPOOL_DEPOSIT_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "0x4F44443271751576305F2f98CbB96B8992a170c0",
  [ChainId.AURORA_MAINNET]: "0x6df16C4C708089aB6c436e1be7f7062C0bA5C317",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const BUSD_METAPOOL_DEPOSIT_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "0x1685506373B560906d9ef0053F0Bc6C38370B6F1", // TO-DO: missing testnet deployment
  [ChainId.AURORA_MAINNET]: "0x1685506373B560906d9ef0053F0Bc6C38370B6F1",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const MAI_METAPOOL_DEPOSIT_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "0x81B2DF6Da4E944B0CE5B3f62473D8637b65c631C", // TO-DO: missing testnet deployment
  [ChainId.AURORA_MAINNET]: "0x81B2DF6Da4E944B0CE5B3f62473D8637b65c631C",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const RUSD_METAPOOL_DEPOSIT_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "0xA593Eabb3972A482b6Eee12D36c525963d8dDDe3",
  [ChainId.AURORA_MAINNET]: "0x2F9272Fd0972fefB81EBe5364F127D46B0ddba96",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const STROSE_GARDEN_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "0x68Ebc71035D25BC70ed7AeE27C4D3cE2657F31e6",
  [ChainId.AURORA_MAINNET]: "0xFfD696703f28753CE1F24bB35B9f7Ae4d966F9f0", // update mainnet
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const STROSE_ORACLE_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "0x0B9A63E27f61Af06D5DbE9bAaF3F9fF2467fBbf4",
  [ChainId.AURORA_MAINNET]: "0x0B9A63E27f61Af06D5DbE9bAaF3F9fF2467fBbf4", // update mainnet
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const UST_GARDEN_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "0xc0A8b9Dc636faF4d103d7Ff639362dC4198A0F5a",
  [ChainId.AURORA_MAINNET]: "0xe8F7F08D50e12145Cb722cfF861e6A9b43EADBA1",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const UST_ORACLE_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "0x2DDDDb9C47A6Bd5697CD047278a69606cCA61E6E",
  [ChainId.AURORA_MAINNET]: "0xAF5B0A58703A21995C918E7631731700442226FC",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const NEAR_WL_PROXIMITY_GARDEN_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "0x3f14a8A649206DD826f0cCAC310dbaf94C0d6bb3",
  [ChainId.AURORA_MAINNET]: "0xA94B88eceF32c6601b62c2C285fB65A8250B1409", // update mainnet
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const NEAR_GARDEN_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "0xa2A36C2E2bE75C33E32C0A6fDE402652700351fA",
  [ChainId.AURORA_MAINNET]: "0x64C922E3824ab40cbbEdd6C8092d148C283d3D3D",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const NEAR_ORACLE_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "0x0B680dbDCC07166CE5201E75FC5A20a650F5a3F2",
  [ChainId.AURORA_MAINNET]: "0x79c57C246794606c83AB32dc56e5cD2030FB552b",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const USDC_GARDEN_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "", // TO-DO: update testnet
  [ChainId.AURORA_MAINNET]: "0xfbAF3eBF228eB712b1267285787e51aDd70086bB",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

/** note: using this oracle for UST for the time being */
export const USDC_ORACLE_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "", // TO-DO: update testnet
  [ChainId.AURORA_MAINNET]: "0xdD170e697d7ADed472a9284f07576c3449284502",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const USDT_GARDEN_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "", // TO-DO: update testnet
  [ChainId.AURORA_MAINNET]: "0x0F44fCD177098Cb2B063B50f6C62e4F1E1f9d596",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const USDT_ORACLE_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "", // TO-DO: update testnet
  [ChainId.AURORA_MAINNET]: "0x55b9eD56737B161677dC5146873E643647Ba5a43",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const wBTC_GARDEN_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "", // TO-DO: update testnet
  [ChainId.AURORA_MAINNET]: "0x6bA5B45149996597d96e6dB19E4E1eFA81a6df97",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const wBTC_ORACLE_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "", // TO-DO: update testnet
  [ChainId.AURORA_MAINNET]: "0xBE46e430d336fC827d096Db044cBaEECE72e17bC",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const wETH_GARDEN_ADDRESSES: {
  [chainId in ChainId]: string
} = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "", // TO-DO: update testnet
  [ChainId.AURORA_MAINNET]: "0x084355FDd5fcfd55d60C5B8626756a6906576f13",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const wETH_ORACLE_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "", // TO-DO: update testnet
  [ChainId.AURORA_MAINNET]: "0x842AF8074Fa41583E3720821cF1435049cf93565",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const VASE_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.HARDHAT]: "",
  [ChainId.AURORA_TESTNET]: "0x6DFA09af86Ec9EB4185898ee9841A51682b5d384",
  [ChainId.AURORA_MAINNET]: "0xee793001Ce9Fa988712B15a59CCf5dC7d54b22FF",
  [ChainId.MUMBAI]: "",
  [ChainId.POLYGON]: "",
}

export const FRAX_STABLES_LP_POOL_TOKENS = [FRAX, STABLECOIN_SWAP_V2_TOKEN]
export const FRAX_METAPOOL_TOKENS = [FRAX, STABLECOIN_SWAP_V2_TOKEN]
export const STAKED_ROSE_POOL_TOKENS = [ROSE, SROSE]
export const UST_METAPOOL_TOKENS = [UST, STABLECOIN_SWAP_V2_TOKEN]
export const BUSD_METAPOOL_TOKENS = [BUSD, STABLECOIN_SWAP_V2_TOKEN]
export const MAI_METAPOOL_TOKENS = [MAI, STABLECOIN_SWAP_V2_TOKEN]
export const RUSD_METAPOOL_TOKENS = [RUSD, STABLECOIN_SWAP_V2_TOKEN]
export const STABLECOIN_POOL_TOKENS = [DAI, USDC, USDT]

export type Pool = {
  name: PoolName
  lpToken: Token
  poolTokens: Token[]
  isSynthetic: boolean
  addresses: { [chainId in ChainId]: string }
  type: PoolTypes
  route: string
  farmName: FarmName
  migration?: PoolName
  metaSwapAddresses?: { [chainId in ChainId]: string }
  underlyingPoolTokens?: Token[]
  underlyingPool?: PoolName
  isOutdated?: boolean // pool can be outdated but not have a migration target
}
export type PoolsMap = {
  [poolName: string]: Pool
}
export const POOLS_MAP: PoolsMap = {
  [STABLECOIN_POOL_V2_NAME]: {
    name: STABLECOIN_POOL_V2_NAME,
    addresses: STABLECOIN_SWAP_V2_ADDRESSES,
    lpToken: STABLECOIN_SWAP_V2_TOKEN,
    poolTokens: STABLECOIN_POOL_TOKENS,
    isSynthetic: false,
    type: PoolTypes.USD,
    route: "stables",
    farmName: STABLES_FARM_NAME,
  },
  [FRAX_STABLES_LP_POOL_NAME]: {
    name: FRAX_STABLES_LP_POOL_NAME,
    addresses: FRAX_STABLES_LP_ADDRESSES,
    lpToken: FRAX_STABLES_LP_TOKEN,
    poolTokens: FRAX_STABLES_LP_POOL_TOKENS,
    // underlyingPoolTokens: [...STABLECOIN_POOL_TOKENS, FRAX],
    isSynthetic: false,
    type: PoolTypes.USD,
    route: "frax-stableslp",
    farmName: FRAX_METAPOOL_FARM_NAME,
    isOutdated: true,
  },
  [FRAX_METAPOOL_NAME]: {
    name: FRAX_METAPOOL_NAME,
    addresses: FRAX_METAPOOL_ADDRESSES,
    lpToken: FRAX_METAPOOL_LP_TOKEN,
    poolTokens: FRAX_METAPOOL_TOKENS,
    underlyingPoolTokens: [FRAX, ...STABLECOIN_POOL_TOKENS], // frax first due to contract definition
    underlyingPool: STABLECOIN_POOL_V2_NAME,
    metaSwapAddresses: FRAX_METAPOOL_DEPOSIT_ADDRESSES,
    isSynthetic: false,
    type: PoolTypes.USD,
    route: "frax",
    farmName: FRAX_METAPOOL_FARM_NAME,
  },
  [UST_METAPOOL_NAME]: {
    name: UST_METAPOOL_NAME,
    addresses: UST_METAPOOL_ADDRESSES,
    lpToken: UST_METAPOOL_LP_TOKEN,
    poolTokens: UST_METAPOOL_TOKENS,
    underlyingPoolTokens: [UST, ...STABLECOIN_POOL_TOKENS],
    underlyingPool: STABLECOIN_POOL_V2_NAME,
    metaSwapAddresses: UST_METAPOOL_DEPOSIT_ADDRESSES,
    isSynthetic: false,
    type: PoolTypes.USD,
    route: "ust",
    farmName: UST_METAPOOL_FARM_NAME,
  },
  [BUSD_METAPOOL_NAME]: {
    name: BUSD_METAPOOL_NAME,
    addresses: BUSD_METAPOOL_ADDRESSES,
    lpToken: BUSD_METAPOOL_LP_TOKEN,
    poolTokens: BUSD_METAPOOL_TOKENS,
    underlyingPoolTokens: [BUSD, ...STABLECOIN_POOL_TOKENS],
    underlyingPool: STABLECOIN_POOL_V2_NAME,
    metaSwapAddresses: BUSD_METAPOOL_DEPOSIT_ADDRESSES,
    isSynthetic: false,
    type: PoolTypes.USD,
    route: "busd",
    farmName: BUSD_METAPOOL_FARM_NAME,
  },
  [MAI_METAPOOL_NAME]: {
    name: MAI_METAPOOL_NAME,
    addresses: MAI_METAPOOL_ADDRESSES,
    lpToken: MAI_METAPOOL_LP_TOKEN,
    poolTokens: MAI_METAPOOL_TOKENS,
    underlyingPoolTokens: [MAI, ...STABLECOIN_POOL_TOKENS],
    underlyingPool: STABLECOIN_POOL_V2_NAME,
    metaSwapAddresses: BUSD_METAPOOL_DEPOSIT_ADDRESSES,
    isSynthetic: false,
    type: PoolTypes.USD,
    route: "mai",
    farmName: MAI_METAPOOL_FARM_NAME,
  },
  [RUSD_METAPOOL_NAME]: {
    name: RUSD_METAPOOL_NAME,
    addresses: RUSD_METAPOOL_ADDRESSES,
    lpToken: RUSD_LP_TOKEN,
    poolTokens: RUSD_METAPOOL_TOKENS,
    underlyingPoolTokens: [RUSD, ...STABLECOIN_POOL_TOKENS],
    underlyingPool: STABLECOIN_POOL_V2_NAME,
    metaSwapAddresses: RUSD_METAPOOL_DEPOSIT_ADDRESSES,
    isSynthetic: false,
    type: PoolTypes.USD,
    route: "rusd",
    farmName: RUSD_METAPOOL_FARM_NAME,
  },
}

export type Farm = {
  name: FarmName
  lpToken: Token
  addresses: { [chainId in ChainId]: string }
  route: string
  isRose: boolean
  poolName: string
  poolUrl: string
}
export type FarmsMap = {
  [farmName in FarmName]: Farm
}
export const FARMS_MAP: FarmsMap = {
  [STABLES_FARM_NAME]: {
    name: STABLES_FARM_NAME,
    lpToken: STABLECOIN_SWAP_V2_TOKEN,
    addresses: ROSE_FARM_STABLES_ADDRESSES,
    poolUrl: "stables",
    route: "stables",
    isRose: true,
    poolName: STABLECOIN_POOL_V2_NAME,
  },
  [FRAX_METAPOOL_FARM_NAME]: {
    name: FRAX_METAPOOL_FARM_NAME,
    lpToken: FRAX_METAPOOL_LP_TOKEN,
    addresses: FRAX_METAPOOL_FARM_ADDRESSES,
    poolUrl: "frax",
    route: "frax",
    isRose: true,
    poolName: FRAX_METAPOOL_NAME,
  },
  [UST_METAPOOL_FARM_NAME]: {
    name: UST_METAPOOL_FARM_NAME,
    lpToken: UST_METAPOOL_LP_TOKEN,
    addresses: UST_METAPOOL_FARM_ADDRESSES,
    poolUrl: "ust",
    route: "ust",
    isRose: true,
    poolName: UST_METAPOOL_NAME,
  },
  [ROSE_PAD_NLP_FARM_NAME]: {
    name: ROSE_PAD_NLP_FARM_NAME,
    lpToken: ROSE_PAD_NLP_TOKEN,
    addresses: ROSE_PAD_NLP_FARM_ADDRESSES,
    poolUrl:
      "https://dex.nearpad.io/add/0xdcD6D4e2B3e1D1E1E6Fa8C21C8A323DcbecfF970/0x885f8CF6E45bdd3fdcDc644efdcd0AC93880c781",
    route: "rose-padnlp",
    isRose: false,
    poolName: "ROSE/PAD PLP Pool",
  },
  [ROSE_FRAX_NLP_FARM_NAME]: {
    name: ROSE_FRAX_NLP_FARM_NAME,
    lpToken: ROSE_FRAX_NLP_TOKEN,
    addresses: ROSE_FRAX_NLP_FARM_ADDRESSES,
    poolUrl:
      "https://dex.nearpad.io/add/0xdcD6D4e2B3e1D1E1E6Fa8C21C8A323DcbecfF970/0xDA2585430fEf327aD8ee44Af8F1f989a2A91A3d2",
    route: "rose-fraxnlp",
    isRose: false,
    poolName: "ROSE/FRAX PLP Pool",
  },
  [BUSD_METAPOOL_FARM_NAME]: {
    name: BUSD_METAPOOL_FARM_NAME,
    lpToken: BUSD_METAPOOL_LP_TOKEN,
    addresses: BUSD_FARM_ADDRESSES,
    poolUrl: "busd",
    route: "busd",
    isRose: true,
    poolName: BUSD_METAPOOL_NAME,
  },
  [MAI_METAPOOL_FARM_NAME]: {
    name: MAI_METAPOOL_FARM_NAME,
    lpToken: MAI_METAPOOL_LP_TOKEN,
    addresses: MAI_FARM_ADDRESSES,
    poolUrl: "mai",
    route: "mai",
    isRose: true,
    poolName: MAI_METAPOOL_FARM_NAME,
  },
  [RUSD_METAPOOL_FARM_NAME]: {
    name: RUSD_METAPOOL_FARM_NAME,
    lpToken: RUSD_LP_TOKEN,
    addresses: RUSD_FARM_ADDRESSES,
    poolUrl: "rusd",
    route: "rusd",
    isRose: true,
    poolName: RUSD_METAPOOL_NAME,
  },
}

export type BorrowMarket = {
  name: BorrowMarketName
  collateralToken: Token
  borrowToken: Token
  gardenAddresses: { [chainId in ChainId]: string }
  vaseAddresses: { [chainId in ChainId]: string }
  oracleAddresses: { [chainId in ChainId]: string }
  route: string
  isStable?: boolean
}

export type BorrowMarketMap = {
  [borrowMarketName in BorrowMarketName]: BorrowMarket
}

export const BORROW_MARKET_MAP: BorrowMarketMap = {
  [NEAR_MARKET_NAME]: {
    name: NEAR_MARKET_NAME,
    collateralToken: NEAR,
    borrowToken: RUSD,
    gardenAddresses: NEAR_GARDEN_ADDRESSES,
    vaseAddresses: VASE_ADDRESSES,
    oracleAddresses: NEAR_ORACLE_ADDRESSES,
    route: "near",
  },
  [UST_MARKET_NAME]: {
    name: UST_MARKET_NAME,
    collateralToken: UST,
    borrowToken: RUSD,
    gardenAddresses: UST_GARDEN_ADDRESSES,
    vaseAddresses: VASE_ADDRESSES,
    oracleAddresses: UST_ORACLE_ADDRESSES,
    route: "ust",
    isStable: true,
  },
  [USDC_MARKET_NAME]: {
    name: USDC_MARKET_NAME,
    collateralToken: USDC,
    borrowToken: RUSD,
    gardenAddresses: USDC_GARDEN_ADDRESSES,
    vaseAddresses: VASE_ADDRESSES,
    oracleAddresses: USDC_ORACLE_ADDRESSES,
    route: "usdc",
    isStable: true,
  },
  [USDT_MARKET_NAME]: {
    name: USDT_MARKET_NAME,
    collateralToken: USDT,
    borrowToken: RUSD,
    gardenAddresses: USDT_GARDEN_ADDRESSES,
    vaseAddresses: VASE_ADDRESSES,
    oracleAddresses: USDT_ORACLE_ADDRESSES,
    route: "usdt",
    isStable: true,
  },
  [wETH_MARKET_NAME]: {
    name: wETH_MARKET_NAME,
    collateralToken: WETH,
    borrowToken: RUSD,
    gardenAddresses: wETH_GARDEN_ADDRESSES,
    vaseAddresses: VASE_ADDRESSES,
    oracleAddresses: wETH_ORACLE_ADDRESSES,
    route: "weth",
  },
  [wBTC_MARKET_NAME]: {
    name: wBTC_MARKET_NAME,
    collateralToken: WBTC,
    borrowToken: RUSD,
    gardenAddresses: wBTC_GARDEN_ADDRESSES,
    vaseAddresses: VASE_ADDRESSES,
    oracleAddresses: wBTC_ORACLE_ADDRESSES,
    route: "wbtc",
  },
}

export function isMetaPool(poolName = ""): boolean {
  return new Set([
    FRAX_METAPOOL_NAME,
    UST_METAPOOL_NAME,
    BUSD_METAPOOL_NAME,
    MAI_METAPOOL_NAME,
    RUSD_METAPOOL_NAME,
  ]).has(poolName)
}

// maps a symbol string to a token object
export type TokensMap = {
  [symbol: string]: Token
}

export const ROSE_TOKENS_MAP: TokensMap = {
  rose: ROSE,
  stRose: SROSE,
}

export const LP_TOKEN_MAP: TokensMap = Object.values(FARMS_MAP).reduce(
  (acc, farm) => ({
    ...acc,
    [farm.lpToken.symbol]: farm.lpToken,
  }),
  {} as TokensMap,
)

export const TOKENS_MAP = Object.keys(POOLS_MAP).reduce((acc, poolName) => {
  const pool = POOLS_MAP[poolName as PoolName]
  const newAcc = { ...acc }
  pool.poolTokens.forEach((token) => {
    newAcc[token.symbol] = token
  })
  newAcc[pool.lpToken.symbol] = pool.lpToken
  return newAcc
}, {} as TokensMap)

export type TokenToPoolsMap = {
  [tokenSymbol: string]: string[]
}
export const TOKEN_TO_POOLS_MAP = Object.keys(POOLS_MAP).reduce(
  (acc, poolName) => {
    const pool = POOLS_MAP[poolName as PoolName]
    const newAcc = { ...acc }
    pool.poolTokens.forEach((token) => {
      newAcc[token.symbol] = (newAcc[token.symbol] || []).concat(
        poolName as PoolName,
      )
    })
    return newAcc
  },
  {} as TokenToPoolsMap,
)

export type LPTokenToPoolsMap = {
  [tokenSymbol: string]: PoolName
}
export const LPTOKEN_TO_POOL_MAP = Object.keys(POOLS_MAP).reduce(
  (acc, poolName) => {
    const pool = POOLS_MAP[poolName as PoolName]
    const newAcc = { ...acc }
    newAcc[pool.lpToken.symbol] = poolName as PoolName
    return newAcc
  },
  {} as LPTokenToPoolsMap,
)

export const TRANSACTION_TYPES = {
  DEPOSIT: "DEPOSIT",
  WITHDRAW: "WITHDRAW",
  SWAP: "SWAP",
  MIGRATE: "MIGRATE",
  STAKE: "STAKE",
  ROSE_PRICE: "ROSE_PRICE",
  BORROW: "BORROW",
}

export const POOL_FEE_PRECISION = 10

export const BLOCK_TIME = 13000 // ms

export enum SWAP_TYPES {
  DIRECT = "swapDirect", // route length 2
  STABLES_TO_META = "swapStablesToMeta", // route length 2 (meta pool)
  META_TO_META = "swapMetaToMeta", // route length 3 (through stables)
  INVALID = "invalid",
}

export const SWAP_CONTRACT_GAS_ESTIMATES_MAP = {
  [SWAP_TYPES.INVALID]: BigNumber.from("999999999"), // 999,999,999
  [SWAP_TYPES.DIRECT]: BigNumber.from("200000"), // 157,807
  [SWAP_TYPES.STABLES_TO_META]: BigNumber.from("200000"), // 157,807
  [SWAP_TYPES.META_TO_META]: BigNumber.from("200000"), // 157,807
  addLiquidity: BigNumber.from("400000"), // 386,555
  removeLiquidityImbalance: BigNumber.from("350000"), // 318,231
  removeLiquidityOneToken: BigNumber.from("250000"), // 232,947
  migrate: BigNumber.from("650000"), // 619,126
  virtualSwapSettleOrWithdraw: BigNumber.from("400000"),
}

export type SignedSignatureRes = {
  r: string
  s: string
  v: number
}

export interface DashboardItems {
  tokenName: string
  amount: string
  icon: string
}

export const BORROW_SORT_FIELDS_TO_LABEL: {
  [sortField in BorrowSortFields]: string
} = {
  name: "Name",
  tvl: "TVL",
  collateral: "Deposited",
  borrow: "Borrowed",
  supply: "RUSD Left",
  interest: "Interest",
  liquidationFee: "Liquidation Fee",
}

export const BORROW_FILTER_FIELDS_TO_LABEL: {
  [filterField in BorrowFilterFields]: string
} = {
  noFilter: "No Filter",
  supply: "RUSD Left to Borrow",
  collateral: "Collateral Deposited",
  borrow: "Borrowed",
}

export const POOL_SORT_FIELDS_TO_LABEL: {
  [sortField in PoolSortFields]: string
} = {
  name: "Name",
  tvl: "TVL",
  farmDeposit: "Farm Deposit",
  balance: "Balance",
  volume: "24h Volume",
  apr: "APR",
  farmTvl: "Farm TVL",
  rewards: "Rewards",
}

export const POOL_FILTER_FIELDS_TO_LABEL: {
  [filterField in PoolFilterFields]: string
} = {
  noFilter: "No Filter",
  farmDeposit: "Farm Deposit",
  balance: "Balance",
}

// multi hop swap composer contract address (note: no testnet deployment)
export const SWAP_COMPOSER_ADDRESS =
  "0x765A7ff1dbF79F77eB9BCA980D6Df71c3E385631"

// Rose Pool Type
export type RosePool = RoseStablesPool | RoseMetaPool

type NavItemDetails = {
  route: string
  name: string
  isActive: (path: string) => boolean
}

export const NAV_ITEMS: NavItemDetails[] = [
  {
    route: "/",
    name: "swap",
    isActive: (path) => path === "/",
  },
  {
    route: "/pools",
    name: "pools",
    isActive: (path) => /pools*/.test(path),
  },
  {
    route: "/stake",
    name: "stake",
    isActive: (path) => path === "/stake",
  },
  {
    route: "/borrow",
    name: "borrow",
    isActive: (path) => /borrow*/.test(path),
  },
]

export type ErrorObj = { code: number | string; message: string }

export type RpcErrorMessageStruct = { value: { data: { message: string } } }
