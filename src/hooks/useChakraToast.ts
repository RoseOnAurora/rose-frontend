import { ReactNode } from "react"
import { useToast } from "@chakra-ui/react"

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

interface ToastSuccessFunctionProps extends ToastFunctionProps {
  description: ReactNode
}

interface ToastFailedFunctionProps extends ToastFunctionProps {
  error?: { code: number; message: string }
  description?: ReactNode
}

export interface ToastFunctions {
  transactionPending: (props: ToastFunctionProps) => void
  approvalRequired: () => void
  signatureRequired: () => void
  autoSignHardwareWallet: () => void
  transactionSuccess: (props: ToastSuccessFunctionProps) => void
  transactionFailed: (props: ToastFailedFunctionProps) => void
}

export default function useChakraToast(): ToastFunctions {
  const toast = useToast({
    position: "top",
    isClosable: true,
    variant: "solid",
  })

  const transactionPending = ({ txnType }: ToastFunctionProps): void => {
    toast({
      title: `${txnType} Transaction Pending`,
      description: "Confirm the transaction(s) in your wallet.",
      duration: null,
    })
  }

  const approvalRequired = (): void => {
    toast({
      title: "Approval Required",
      description: "Approve the transaction(s) in your wallet.",
    })
  }

  const signatureRequired = (): void => {
    toast({
      title: "Message Signature Required",
      description: "Complete message signature in your wallet.",
    })
  }

  const autoSignHardwareWallet = (): void => {
    toast({
      title: "Hardware wallet detected.",
      status: "warning",
      description:
        "Please confirm the set master contract approval call in your wallet.",
    })
  }

  const transactionSuccess = ({
    txnType,
    description,
  }: ToastSuccessFunctionProps): void => {
    toast.closeAll()
    toast({
      title: `${txnType} Transaction Succeeded!`,
      description: description,
      status: "success",
      duration: 8000,
    })
  }

  const transactionFailed = ({
    txnType,
    error,
    description,
  }: ToastFailedFunctionProps): void => {
    toast.closeAll()
    const toastData: {
      title: string
      status: "error" | "warning"
      description: ReactNode
    } = {
      title: `${txnType} Transaction Failed!`,
      status: "error",
      description: "Unknown Error occurred. Please try again.",
    }

    let message
    try {
      message =
        error?.message?.split(
          "[ethjs-query] while formatting outputs from RPC ",
        )?.[1] || ""
      message = JSON.parse(message.substring(1, message.length - 1)) as {
        value: { data: { message: string } }
      }
    } catch (e) {
      message = { value: { data: { message: "Internal JSON-RPC error." } } }
    }

    switch (error?.code) {
      case 4001:
        toastData.title = `${txnType} Transaction Aborted!`
        toastData.description = `${error.code}: ${error.message}`
        toastData.status = "warning"
        break
      case -32603:
        toastData.description =
          description ||
          `${error.code}: ${
            ERROR_MAP[message.value.data.message as TransactionErrors] ||
            message.value.data.message
          } `
        break
    }

    toast({
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
  }
}
