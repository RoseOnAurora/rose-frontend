export function getEtherscanLink(
  data: string,
  type: "tx" | "token" | "address" | "block",
  network = "mainnet",
): string {
  return network === "testnet"
    ? `https://${network}.aurorascan.dev/${type}/${data}`
    : `https://aurorascan.dev/${type}/${data}`
}
