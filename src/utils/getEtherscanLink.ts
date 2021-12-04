export function getEtherscanLink(
  data: string,
  type: "tx" | "token" | "address" | "block",
): string {
  return `https://explorer.mainnet.aurora.dev/${type}/${data}`
}
