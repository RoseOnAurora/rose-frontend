import { BigNumberish, ContractReceipt } from "ethers"
import { useCallback, useEffect, useState } from "react"
import { ErrorObj } from "../constants"
import { useEarnFactoryContract } from "./useContract"
import { useInterval } from "@chakra-ui/react"
import { useWeb3React } from "@web3-react/core"

type CreateCloneAndEnterPosConfig = {
  onSuccess?: (receipt: ContractReceipt) => void
  onError?: (e: ErrorObj) => void
}

type CreateCloneAndEnterPosReq = {
  iterations?: number
  slippageTolerance?: number
  seed?: number
}

type CreateCloneAndEnterPosRes = {
  createCloneAndEnterPos: (
    deposit: BigNumberish,
    params?: CreateCloneAndEnterPosReq,
  ) => Promise<ContractReceipt | void>
  posAddress: string
  isLoading: boolean
  isError: boolean
}

export default function useCreateCloneAndEnterPos(
  { onError, onSuccess } = {} as CreateCloneAndEnterPosConfig,
): CreateCloneAndEnterPosRes {
  const [posAddress, setPosAddress] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  const earnContract = useEarnFactoryContract()
  const { account } = useWeb3React()

  const createCloneAndEnterPos = useCallback(
    async (
      deposit: BigNumberish,
      {
        iterations = 12,
        slippageTolerance = 100,
        seed = 1,
      } = {} as CreateCloneAndEnterPosReq,
    ): Promise<ContractReceipt | void> => {
      if (!earnContract) throw new Error("Rose Earn contract is not loaded")
      try {
        setIsError(false)
        setIsLoading(true)
        const tx = await earnContract.createCloneAndEnterPosition(
          iterations,
          slippageTolerance,
          seed,
          { value: deposit },
        )
        const receipt = await tx.wait()
        onSuccess?.(receipt)
        return receipt
      } catch (e) {
        setIsError(true)
        console.error(e)
        onError?.(e as ErrorObj)
      } finally {
        setIsLoading(false)
      }
    },
    [earnContract, onError, onSuccess],
  )

  const getPosAddress = useCallback(async () => {
    if (earnContract && account) {
      const address = await earnContract.getClone(account, 1)
      setPosAddress(address)
    }
  }, [earnContract, account])

  useInterval(
    () => void getPosAddress(),
    earnContract && account ? 10000 : null,
  )

  useEffect(() => {
    void getPosAddress()
  }, [getPosAddress])

  return { createCloneAndEnterPos, isLoading, isError, posAddress }
}
