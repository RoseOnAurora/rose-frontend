import { useCallback, useState } from "react"
import { ContractReceipt } from "ethers"
import EARN_POSITION_ABI from "../constants/abis/earnPosition.json"
import { EarnPosition } from "../../types/ethers-contracts/EarnPosition"
import { ErrorObj } from "../constants"
import { getContract } from "../utils"
import { useWeb3React } from "@web3-react/core"

type ExitPosConfig = {
  onSuccess?: (receipt: ContractReceipt) => void
  onError?: (e: ErrorObj) => void
}

type ExitPosRes = {
  exitPosition: (address: string) => Promise<ContractReceipt | void>
  isLoading: boolean
  isError: boolean
}

export default function useEarnExitPosition(
  { onError, onSuccess } = {} as ExitPosConfig,
): ExitPosRes {
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  const { account, provider } = useWeb3React()

  const exitPosition = useCallback(
    async (posAddress: string) => {
      if (!provider || !account) throw new Error("Must connect wallet first!")
      try {
        setIsError(false)
        setIsLoading(true)

        const positionContract = getContract(
          posAddress,
          JSON.stringify(EARN_POSITION_ABI.abi),
          provider,
          account,
        ) as EarnPosition

        if (!positionContract)
          throw new Error("Rose Earn Position contract is not loaded")

        const tx = await positionContract.exitPosition()
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
    [account, provider, onError, onSuccess],
  )

  return { isError, isLoading, exitPosition }
}
