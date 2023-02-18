import { ChainId, SROSE } from "../constants"
import retry from "async-retry"

interface BlockTransactionResponse {
  message: string
  status: string
  result: Transaction[]
}

interface Transaction {
  blockHash: string
  blockNumber: string
  confirmations: string
  contractAddress: string
  cumulativeGasUsed: string
  from: string
  gas: string
  gasUsed: string
  hash: string
  input: string
  isError: string
  nonce: string
  timeStamp: string
  to: string
  transactionIndex: string
  value: string
  txreceipt_status: string
}

interface TokenTransferTxn extends Transaction {
  logIndex: string
  tokenDecimal: string
  tokenSymbol: string
  tokenName: string
}

const blockTxnsUri = (
  accountAddress: string,
  startTimestamp: string,
  network: string,
) => {
  return network === "testnet"
    ? `https://explorer.testnet.aurora.dev/api?module=account&action=txlist&address=${accountAddress}&starttimestamp=${startTimestamp}`
    : `https://explorer.mainnet.aurora.dev/api?module=account&action=txlist&address=${accountAddress}&starttimestamp=${startTimestamp}`
}

const tokenTransferTxnsUri = (
  startBlock: string,
  contractAddress: string,
  accountAddress: string,
  network: string,
) => {
  return network === "testnet"
    ? `https://explorer.testnet.aurora.dev/api?module=account&action=tokentx&address=${accountAddress}&contractaddress=${contractAddress}&startblock=${startBlock}`
    : `https://explorer.mainnet.aurora.dev/api?module=account&action=tokentx&address=${accountAddress}&contractaddress=${contractAddress}&startblock=${startBlock}`
}

const fetchBlockTxns = async (
  accountAddress: string,
  networkId: string,
  daysOffset = 1,
): Promise<Transaction[]> => {
  const d = new Date()
  d.setDate(d.getDate() - daysOffset) // default 1 day back
  return fetch(
    blockTxnsUri(
      accountAddress,
      d.getTime().toString().slice(0, 10),
      networkId,
    ),
  )
    .then((res) => res.json())
    .then((body: BlockTransactionResponse) => {
      return body.result
    })
}

const fetchTokenTransfers = (
  startBlock: string,
  contractAddress: string,
  accountAddress: string,
  networkId: string,
): Promise<TokenTransferTxn[]> =>
  fetch(
    tokenTransferTxnsUri(
      startBlock,
      contractAddress,
      accountAddress,
      networkId,
    ),
  )
    .then((res) => res.json())
    .then((body: BlockTransactionResponse) => {
      return body.result as TokenTransferTxn[]
    })

export default async function fetchLastStakedTime(
  accountAddress: string,
  chainId: ChainId,
): Promise<string | undefined> {
  // fetch the user's txn list for last day
  const networkId = chainId === ChainId.AURORA_TESTNET ? "testnet" : "mainnet"
  const txnData = await retry(() => fetchBlockTxns(accountAddress, networkId), {
    retries: 2,
  })

  // filter by stRose on `to` field and user account address
  const stRoseAddress = SROSE.addresses[chainId]
  const filteredTxnData = txnData.filter(
    ({ to, from }) =>
      to === stRoseAddress.toLowerCase() &&
      from === accountAddress.toLowerCase(),
  )

  // if empty, return early
  if (filteredTxnData.length === 0) return

  // pull token transfer data starting at first block number from filtered txns
  const tokenTransferData = await retry(
    () =>
      fetchTokenTransfers(
        filteredTxnData[filteredTxnData.length - 1].blockNumber,
        stRoseAddress,
        accountAddress,
        networkId,
      ),
    { retries: 2 },
  )

  // find the match and return
  for (let i = 0; i < tokenTransferData.length; i += 1) {
    if (
      filteredTxnData.find(
        ({ hash }) =>
          hash === tokenTransferData[i].hash &&
          tokenTransferData[i].to === accountAddress.toLowerCase(),
      )
    ) {
      return tokenTransferData[i].timeStamp
    }
  }
}
