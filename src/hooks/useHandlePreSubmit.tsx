import useChakraToast, { TransactionType } from "./useChakraToast"

const useHandlePreSubmit = (): ((txnType: TransactionType) => void) => {
  const toast = useChakraToast()

  return function handlePreSubmit(txnType: TransactionType) {
    toast.transactionPending({
      txnType,
    })
  }
}

export default useHandlePreSubmit
