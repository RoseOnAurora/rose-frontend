import { ChainId } from "../constants"

export function getEtherscanLink(
  data: string,
  type: "tx" | "token" | "address" | "block",
  network = "mainnet",
  chain = ChainId.AURORA_MAINNET,
): string {
  return chain === ChainId.MAINNET
    ? `https://etherscan.io/${type}/${data}`
    : network === "testnet"
    ? `https://${network}.aurorascan.dev/${type}/${data}`
    : `https://aurorascan.dev/${type}/${data}`
}
