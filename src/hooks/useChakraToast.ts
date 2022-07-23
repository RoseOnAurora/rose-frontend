import {
  CloseAllToastsOptions,
  ToastId,
  UseToastOptions,
  useToast,
} from "@chakra-ui/react"
import { ErrorObj } from "../constants"
import { ReactNode } from "react"
import { parseErrorMessage } from "../utils"

export enum TransactionType {
  STAKE = "Stake",
  UNSTAKE = "Unstake",
  BORROW = "Borrow",
  REPAY = "Repay",
  DEPOSIT = "Deposit",
  WITHDRAW = "Withdraw",
  REWARDS = "Claim Rewards",
  EXIT = "Withdraw & Claim Rewards",
  SWAP = "Swap",
  SIGNATURE = "Signature",
  CONNECT = "Connect Wallet",
}

export enum TransactionErrorCode {
  CANCELLED_TRANSACTION = 4001,
  CONTRACT_ERROR = -32603,
}

enum TransactionErrors {
  UNDERFLOW = "BoringMath: Underflow",
  LOCKED = "Locked",
}

const ERROR_MAP: { [error in TransactionErrors]: string } = {
  [TransactionErrors.UNDERFLOW]: "Not enough RUSD left to borrow.",
  [TransactionErrors.LOCKED]: "Your stROSE is LOCKED.",
}

interface ToastFunctionProps {
  txnType: TransactionType
}

interface ToastPendingFunctionProps extends ToastFunctionProps {
  duration?: number | null
}

interface ToastSuccessFunctionProps extends ToastFunctionProps {
  description: ReactNode
}

interface ToastFailedFunctionProps extends ToastFunctionProps {
  error?: ErrorObj
  description?: ReactNode
}

interface ToastWarningFunctionProps {
  title: string
  description: ReactNode
}

interface ToastErrorFunctionProps extends ToastFunctionProps {
  description?: ReactNode
}

export interface ToastFunctions {
  transactionPending: (props: ToastPendingFunctionProps) => ToastId
  approvalRequired: () => ToastId
  signatureRequired: () => ToastId
  autoSignHardwareWallet: () => ToastId
  transactionSuccess: (props: ToastSuccessFunctionProps) => ToastId
  transactionFailed: (props: ToastFailedFunctionProps) => ToastId
  transactionWarning: (props: ToastWarningFunctionProps) => ToastId
  transactionError: (props: ToastErrorFunctionProps) => ToastId
  instance: {
    (options?: UseToastOptions | undefined): ToastId
    close: (id: ToastId) => void
    closeAll: (options?: CloseAllToastsOptions | undefined) => void
    /**
     * Toasts can only be updated if they have a valid id
     */
    update(id: ToastId, options: Omit<UseToastOptions, "id">): void
    isActive: (id: ToastId) => boolean
  }
}

export default function useChakraToast(): ToastFunctions {
  const toast = useToast({
    position: "top",
    isClosable: true,
    variant: "solid",
  })

  const transactionPending = ({
    txnType,
    duration = null,
  }: ToastPendingFunctionProps): ToastId => {
    return toast({
      title: `${txnType} Transaction Pending`,
      description: "Confirm the transaction(s) in your wallet.",
      duration,
    })
  }

  const approvalRequired = (): ToastId => {
    return toast({
      title: "Approval Required",
      description: "Approve the transaction(s) in your wallet.",
    })
  }

  const signatureRequired = (): ToastId => {
    return toast({
      title: "Message Signature Required",
      description: "Complete message signature in your wallet.",
    })
  }

  const autoSignHardwareWallet = (): ToastId => {
    return toast({
      title: "Hardware wallet detected.",
      status: "warning",
      description:
        "Please confirm the set master contract approval call in your wallet.",
    })
  }

  const transactionSuccess = ({
    txnType,
    description,
  }: ToastSuccessFunctionProps): ToastId => {
    toast.closeAll()
    return toast({
      title: `${txnType} Transaction Succeeded!`,
      description: description,
      status: "success",
      duration: 8000,
    })
  }

  const transactionWarning = ({
    title,
    description,
  }: ToastWarningFunctionProps): ToastId => {
    toast.closeAll()
    return toast({
      title,
      description,
      status: "warning",
    })
  }

  const transactionError = ({
    txnType,
    description,
  }: ToastErrorFunctionProps): ToastId => {
    toast.closeAll()
    return toast({
      title: `${txnType} Error!`,
      description,
      status: "error",
    })
  }

  const transactionFailed = ({
    txnType,
    error,
    description,
  }: ToastFailedFunctionProps): ToastId => {
    toast.closeAll()
    const toastData: {
      title: string
      status: "error" | "warning"
      description: ReactNode
    } = {
      title: `${txnType} Transaction Failed!`,
      status: "error",
      description: description || "Unknown Error occurred. Please try again.",
    }

    const parsed = parseErrorMessage(error)

    switch (error?.code) {
      case TransactionErrorCode.CANCELLED_TRANSACTION:
        toastData.title = `${txnType} Transaction Aborted!`
        toastData.description = `${error.code}: ${error.message}`
        toastData.status = "warning"
        break
      case TransactionErrorCode.CONTRACT_ERROR:
        toastData.description = `${error.code}: ${
          ERROR_MAP[parsed.value.data.message as TransactionErrors] ||
          parsed.value.data.message
        } `
        break
    }

    return toast({
      title: toastData.title,
      description: toastData.description,
      status: toastData.status,
      duration: 8000,
    })
  }

  return {
    transactionPending,
    approvalRequired,
    signatureRequired,
    transactionSuccess,
    transactionFailed,
    autoSignHardwareWallet,
    transactionWarning,
    transactionError,
    instance: toast,
  }
}
