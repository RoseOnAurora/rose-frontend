export function getEtherscanLink(
  data: string,
  type: "tx" | "token" | "address" | "block",
  network = "mainnet",
): string {
  return `https://explorer.${network}.aurora.dev/${type}/${data}`
}
