import useChakraToast, { TransactionType } from "./useChakraToast"
import BlockExplorerLink from "../components/BlockExplorerLink"
import { ContractReceipt } from "ethers"
import { ErrorObj } from "../constants"
import React from "react"
import { useActiveWeb3React } from "."

const useHandlePostSubmit = (): ((
  receipt: ContractReceipt | null,
  transactionType: TransactionType,
  error?: ErrorObj,
) => void) => {
  const toast = useChakraToast()
  const { chainId } = useActiveWeb3React()

  const handlePostSubmit = (
    receipt: ContractReceipt | null,
    transactionType: TransactionType,
    error?: ErrorObj,
  ): void => {
    const description = receipt?.transactionHash ? (
      <BlockExplorerLink
        txnType={transactionType}
        txnHash={receipt.transactionHash}
        status={receipt?.status ? "Succeeded" : "Failed"}
        chainId={chainId}
      />
    ) : null
    if (receipt?.status) {
      toast.transactionSuccess({
        txnType: transactionType,
        description: description,
      })
    } else {
      toast.transactionFailed({
        txnType: transactionType,
        error,
        description: description,
      })
    }
  }

  return handlePostSubmit
}

export default useHandlePostSubmit
