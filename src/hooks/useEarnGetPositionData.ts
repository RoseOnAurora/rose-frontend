/* eslint @typescript-eslint/no-floating-promises: 0 */
import { useCallback, useEffect, useState } from "react"
import { BigNumber } from "@ethersproject/bignumber"
import { useEarnPositionContract } from "./useContract"
import { useInterval } from "@chakra-ui/react"

type PositionData = {
  availableBorrowsBase: BigNumber
  currentLiquidationThreshold: BigNumber
  healthFactor: BigNumber
  ltv: BigNumber
  totalCollateralBase: BigNumber
  totalDebtBase: BigNumber
}

type UseEarnGetPositionDataRet = {
  data?: PositionData & { openTimestamp: BigNumber; stEthBal: BigNumber }
  isLoading: boolean
  isFetching: boolean
}

export default function useEarnGetPositionData(
  posAddress: string,
): UseEarnGetPositionDataRet {
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [posData, setPosData] = useState<PositionData>()
  const [openTimestamp, setOpenTimestamp] = useState<BigNumber>()
  const [stEthBal, setStEthBal] = useState<BigNumber>()
  const positionContract = useEarnPositionContract(posAddress)

  const getPositionData = useCallback(
    async (load = false, fetch = true) => {
      if (positionContract) {
        try {
          if (load) setIsLoading(true)
          if (fetch) setIsFetching(true)
          const posData = await positionContract.getPositionData()
          setPosData(posData)
        } catch (e) {
          console.error(e)
        } finally {
          if (load) setIsLoading(false)
          if (fetch) setIsFetching(false)
        }
      }
    },
    [positionContract],
  )

  const getOpenTimestamp = useCallback(
    async (load = false, fetch = true) => {
      if (positionContract) {
        try {
          if (load) setIsLoading(true)
          if (fetch) setIsFetching(true)
          const open = await positionContract.openTimestamp()
          setOpenTimestamp(open)
        } catch (e) {
          console.error(e)
        } finally {
          if (load) setIsLoading(false)
          if (fetch) setIsFetching(false)
        }
      }
    },
    [positionContract],
  )

  const getStEthBal = useCallback(
    async (load = false, fetch = true) => {
      if (positionContract) {
        try {
          if (load) setIsLoading(true)
          if (fetch) setIsFetching(true)
          const stEth = await positionContract.openSteth()
          setStEthBal(stEth)
        } catch (e) {
          console.error(e)
        } finally {
          if (load) setIsLoading(false)
          if (fetch) setIsFetching(false)
        }
      }
    },
    [positionContract],
  )

  useInterval(
    () => {
      getPositionData()
      getOpenTimestamp()
      getStEthBal()
    },
    positionContract && posAddress ? 30000 : null,
  )

  useEffect(() => {
    getPositionData(true, false)
    getOpenTimestamp(true, false)
    getStEthBal(true, false)
  }, [getPositionData, getOpenTimestamp, getStEthBal])

  return {
    isFetching,
    isLoading,
    ...(posData &&
      openTimestamp &&
      stEthBal && { data: { ...posData, openTimestamp, stEthBal } }),
  }
}
