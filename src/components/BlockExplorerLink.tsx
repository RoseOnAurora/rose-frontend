import React, { ReactElement } from "react"
import { Trans, useTranslation } from "react-i18next"
import { ChainId } from "../constants"
import { TransactionType } from "../hooks/useChakraToast"
import { getEtherscanLink } from "../utils/getEtherscanLink"
import { useWeb3React } from "@web3-react/core"

interface Props {
  txnType: TransactionType
  txnHash: string
  status: "Failed" | "Succeeded"
}

const BlockExplorerLink = ({
  txnType,
  txnHash,
  status,
}: Props): ReactElement => {
  const { t } = useTranslation()
  const { chainId } = useWeb3React()
  const network =
    chainId === ChainId.AURORA_MAINNET || chainId === undefined
      ? "mainnet"
      : "testnet"

  return (
    <Trans i18nKey="txComplete" t={t}>
      {{ tx: txnType }}
      <a
        href={getEtherscanLink(txnHash, "tx", network, chainId)}
        target="_blank"
        rel="noreferrer"
        style={{ textDecoration: "underline", margin: 0 }}
      >
        {chainId === ChainId.MAINNET ? "etherscan" : "aurorascan"}.
      </a>
      {{ status: status }}
    </Trans>
  )
}

export default BlockExplorerLink
