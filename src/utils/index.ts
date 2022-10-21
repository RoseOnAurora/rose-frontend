import { AddressZero, Zero } from "@ethersproject/constants"
import {
  CONNECTIONS,
  injectedConnection,
  networkConnection,
  walletconnectConnection,
} from "../constants/connection"
import {
  ChainId,
  ErrorObj,
  RpcErrorMessageStruct,
  SignedSignatureRes,
  TOKENS_MAP,
  Token,
} from "../constants"
import { ConnectionType, Web3Connection } from "../types/web3"
import { JsonRpcSigner, Web3Provider } from "@ethersproject/providers"
import { formatUnits, parseUnits } from "@ethersproject/units"
import { BigNumber } from "@ethersproject/bignumber"
import { Connector } from "@web3-react/types"
import { Contract } from "@ethersproject/contracts"
import { ContractInterface } from "ethers"
import { getAddress } from "@ethersproject/address"
import parseStringToBigNumber from "./parseStringToBigNumber"

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: string): string | false {
  try {
    return getAddress(value)
  } catch {
    return false
  }
}

// account is not optional
export function getSigner(
  provider: Web3Provider,
  account: string,
): JsonRpcSigner {
  return provider.getSigner(account)
}

// account is optional
export function getProviderOrSigner(
  provider: Web3Provider,
  account?: string,
): Web3Provider | JsonRpcSigner {
  return account ? getSigner(provider, account) : provider
}

// account is optional
export function getContract(
  address: string,
  ABI: ContractInterface,
  provider: Web3Provider,
  account?: string,
): Contract {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  return new Contract(address, ABI, getProviderOrSigner(provider, account))
}

export function formatBNToShortString(
  bn: BigNumber,
  nativePrecision: number,
): string {
  const bnStr = bn.toString()
  const numLen = bnStr.length - nativePrecision
  if (numLen <= 0) return "0.0"
  const div = Math.floor((numLen - 1) / 3)
  const mod = numLen % 3
  const suffixes = ["", "k", "m", "b", "t"]
  return `${bnStr.substr(0, mod || 3)}.${bnStr[mod || 3]}${suffixes[div]}`
}

export function formatBNToString(
  bn: BigNumber,
  nativePrecison: number,
  decimalPlaces?: number,
): string {
  const fullPrecision = formatUnits(bn, nativePrecison)
  const decimalIdx = fullPrecision.indexOf(".")
  return decimalPlaces === undefined || decimalIdx === -1
    ? fullPrecision
    : fullPrecision.slice(
        0,
        decimalIdx + (decimalPlaces > 0 ? decimalPlaces + 1 : 0), // don't include decimal point if places = 0
      )
}

export function formatBNToPercentString(
  bn: BigNumber,
  nativePrecison: number,
  decimalPlaces = 2,
): string {
  return `${formatBNToString(bn, nativePrecison - 2, decimalPlaces)}%`
}

export function shiftBNDecimals(bn: BigNumber, shiftAmount: number): BigNumber {
  if (shiftAmount < 0) throw new Error("shiftAmount must be positive")
  return bn.mul(BigNumber.from(10).pow(shiftAmount))
}

export function calculateExchangeRate(
  amountFrom: BigNumber,
  tokenPrecisionFrom: number,
  amountTo: BigNumber,
  tokenPrecisionTo: number,
): BigNumber {
  return amountFrom.gt("0")
    ? amountTo
        .mul(BigNumber.from(10).pow(36 - tokenPrecisionTo)) // convert to standard 1e18 precision
        .div(amountFrom.mul(BigNumber.from(10).pow(18 - tokenPrecisionFrom)))
    : BigNumber.from("0")
}

// A better version of ether's commify util
export function commify(str: string): string {
  const parts = str.split(".")
  if (parts.length > 2) throw new Error("commify string cannot have > 1 period")
  const [partA, partB] = parts
  if (partA.length === 0) return partB === undefined ? "" : `.${partB}`
  const mod = partA.length % 3
  const div = Math.floor(partA.length / 3)
  // define a fixed length array given the expected # of commas added
  const commaAArr = new Array(partA.length + (mod === 0 ? div - 1 : div))
  // init pointers for original string and for commified array
  let commaAIdx = commaAArr.length - 1
  // iterate original string backwards from the decimals since that's how commas are added
  for (let i = partA.length - 1; i >= 0; i--) {
    // revIdx is the distance from the decimal place eg "3210."
    const revIdx = partA.length - 1 - i
    // add the character to the array
    commaAArr[commaAIdx--] = partA[i]
    // add a comma if we are a multiple of 3 from the decimal
    if ((revIdx + 1) % 3 === 0) {
      commaAArr[commaAIdx--] = ","
    }
  }
  const commifiedA = commaAArr.join("")
  return partB === undefined ? commifiedA : `${commifiedA}.${partB}`
}

export function intersection<T>(set1: Set<T>, set2: Set<T>): Set<T> {
  return new Set([...set1].filter((item) => set2.has(item)))
}

export function getTokenByAddress(
  address: string,
  chainId: ChainId,
): Token | null {
  return (
    Object.values(TOKENS_MAP).find(
      ({ addresses }) =>
        addresses[chainId] &&
        address.toLowerCase() === addresses[chainId].toLowerCase(),
    ) || null
  )
}

export function calculatePrice(
  amount: BigNumber | string,
  tokenPrice = 0,
  decimals?: number,
): BigNumber {
  // returns amount * price as BN 18 precision
  if (typeof amount === "string") {
    // if bad input, return 0
    if (isNaN(+amount)) return Zero

    // use bn for multiplication
    const { value, isFallback } = parseStringToBigNumber(amount, 18)
    if (!isFallback)
      return value
        .mul(parseUnits(tokenPrice.toString(), 18))
        .div(BigNumber.from(10).pow(18))
  } else if (decimals != null) {
    return amount
      .mul(parseUnits(tokenPrice.toString(), 18))
      .div(BigNumber.from(10).pow(decimals))
  }
  return Zero
}

export const toHex = (num: number): string => {
  return "0x" + num.toString(16)
}

export const imageIconToUrl = (tokenIconPath: string): string => {
  const host = window.location.origin
  return `${host}/${tokenIconPath}`
}

/**
 * Parse a signature response from JsonRpcSigner
 * @param signature string
 * @returns SignedSignatureRes
 */
export const parseSignature = (signature: string): SignedSignatureRes => {
  const parsedSignature = signature.substring(2)
  const r = parsedSignature.substring(0, 64)
  const s = parsedSignature.substring(64, 128)
  const v = parsedSignature.substring(128, 130)
  return {
    r: "0x" + r,
    s: "0x" + s,
    v: parseInt(v, 16),
  }
}

export function calculatePctOfTotalShare(
  tokenAmount: BigNumber,
  totalTokenAmount: BigNumber,
): BigNumber {
  // returns the % of total tokens out of a whole
  return tokenAmount
    .mul(BigNumber.from(10).pow(18))
    .div(totalTokenAmount.isZero() ? BigNumber.from("1") : totalTokenAmount)
}

export function calculatePositionHealthColor(
  positionHealth: number,
  isStable?: boolean,
): "red" | "green" | "orange" {
  const [lo, hi] = isStable ? [60, 85] : [40, 80]

  return positionHealth >= hi
    ? "red"
    : positionHealth <= lo
    ? "green"
    : "orange"
}

export function countDecimalPlaces(num: number | string): number {
  const stringCast = `${num}`
  if (stringCast.includes(".")) {
    try {
      return stringCast.split(".")[1].length
    } catch {
      return 0
    }
  }
  return 0
}

export function fixDecimalsOnRawVal(
  rawVal: string,
  fromSymbol: string,
  toSymbol: string,
): string {
  const fromDecimals = TOKENS_MAP[fromSymbol]?.decimals || 18
  const toDecimals = TOKENS_MAP[toSymbol]?.decimals || 18
  return fromDecimals <= toDecimals || countDecimalPlaces(rawVal) <= toDecimals
    ? rawVal
    : (+rawVal).toFixed(toDecimals)
}

export function parseErrorMessage(error?: ErrorObj): RpcErrorMessageStruct {
  const message: RpcErrorMessageStruct = {
    value: { data: { message: "Internal JSON-RPC error." } },
  }
  try {
    const parsed =
      error?.message?.split(
        "[ethjs-query] while formatting outputs from RPC ",
      )?.[1] || ""
    return JSON.parse(parsed.substring(1, parsed.length - 1)) as {
      value: { data: { message: string } }
    }
  } catch {
    return message
  }
}

/**
 * Utility function for activating a connection
 * if applicable, will eagerly connect
 * @param connector the connector being used
 * @returns Promise<void>
 */
export const activateConnection = async (
  connector: Connector,
): Promise<void> => {
  try {
    if (connector.connectEagerly) {
      return await connector.connectEagerly()
    }
    await connector.activate()
  } catch (e) {
    console.debug("web3-react eager connection error", e)
  }
}

/**
 * Finds a web3 connection obj based on the connector
 * @param c connector or ConnectionType
 * @returns Web3Connection
 * @throws Error if unsupported connector (not found in CONNECTIONS)
 */
export const getWeb3Connection = (
  c: Connector | ConnectionType,
): Web3Connection => {
  if (c instanceof Connector) {
    const connection = CONNECTIONS.find(
      (connection) => connection.connector === c,
    )
    if (!connection) {
      throw Error("Unsupported connector")
    }
    return connection
  }

  // given connection type, map it to the connection
  switch (c) {
    case ConnectionType.INJECTED:
      return injectedConnection
    case ConnectionType.WALLET_CONNECT:
      return walletconnectConnection
  }
  return networkConnection
}

export const getIsMetamaskWallet = (): boolean => {
  return window.ethereum?.isMetaMask ?? false
}
