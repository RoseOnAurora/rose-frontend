import React, { ReactElement } from "react"
import { Trans, useTranslation } from "react-i18next"
import { ChainId } from "../constants"
import { TransactionType } from "../hooks/useChakraToast"
import { getEtherscanLink } from "../utils/getEtherscanLink"

interface Props {
  txnType: TransactionType
  txnHash: string
  status: "Failed" | "Succeeded"
  chainId: ChainId | undefined
}

const BlockExplorerLink = ({
  txnType,
  txnHash,
  status,
  chainId,
}: Props): ReactElement => {
  const { t } = useTranslation()
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
      />
      {{ explorer: chainId === ChainId.MAINNET ? "etherscan" : "aurorascan" }}
      {{ status: status }}
    </Trans>
  )
}

export default BlockExplorerLink
