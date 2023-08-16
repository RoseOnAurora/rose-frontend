import { formatBNToString, getContract } from "../utils"
import { useCallback, useEffect, useState } from "react"
import { BigNumber } from "@ethersproject/bignumber"
import EARN_POSITION_ABI from "../constants/abis/earnPosition.json"
import { EarnPosition } from "../../types/ethers-contracts/EarnPosition"
import moment from "moment"
import { useEarnFactoryContract } from "./useContract"
import { useInterval } from "@chakra-ui/react"
import { useWeb3React } from "@web3-react/core"

type ReturnType = {
  data: PositionData[]
  seed: number
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  refetch: () => Promise<void>
}

type PositionData = {
  address?: string
  openTimestamp?: BigNumber
  openTimestampStr?: string
  stEthDeposit?: BigNumber
  ethDeposit?: number
  interestEarned?: number
  isClosed?: boolean
}

type CoinGeckoMarketChartRes = {
  prices: number[][]
  total_volumes: number[][]
  market_caps: number[][]
}

const APY = 1.1

const fetchCoinGeckoPriceHistory = async (
  coinId: string,
  from: number,
  to: number,
): Promise<number[][]> => {
  const api = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart/range?vs_currency=usd&from=${from}&to=${to}`
  const res = await fetch(api)
  const { prices } = (await res.json()) as CoinGeckoMarketChartRes
  return prices
}

const getClosestPriceToTarget = (
  prices: number[][],
  target: moment.Moment = moment(),
): number => {
  let nearest = Number.MAX_VALUE
  let nearestIdx = 0

  prices.forEach(([timestamp], idx) => {
    const closeness = Math.abs(moment(timestamp).diff(target, "seconds"))
    if (closeness < nearest) {
      nearest = closeness
      nearestIdx = idx
    }
  })

  return prices[nearestIdx][1]
}

export default function useGetEarnPositionData(): ReturnType {
  const [posData, setPosData] = useState<PositionData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [isError, setIsError] = useState(false)

  const earnContract = useEarnFactoryContract()
  const { account, provider } = useWeb3React()

  const getPositionData = useCallback(
    async (loading = false, fetching = false): Promise<PositionData[]> => {
      let i = 1
      const localPosData: PositionData[] = []
      setIsLoading(loading)
      setIsFetching(fetching)
      setIsError(false)

      try {
        if (earnContract && account && provider) {
          // eslint-disable-next-line
          while (true) {
            // check if position is valid
            let thisPosData = {} as PositionData
            const address = await earnContract.getClone(account, i)
            const positionContract = getContract(
              address,
              JSON.stringify(EARN_POSITION_ABI.abi),
              provider,
              account,
            ) as EarnPosition

            // check if we are at a position that doesnt exist
            // and break if so
            try {
              await positionContract.openTimestamp()
            } catch {
              break
            }

            // now do computation
            try {
              const borrowed = await positionContract.getBorrowBalance()
              const openT = await positionContract.openTimestamp()
              const stEth = await positionContract.openSteth()

              thisPosData = {
                ...thisPosData,
                address,
                stEthDeposit: stEth,
                openTimestamp: openT,
                openTimestampStr: moment
                  .unix(Number(formatBNToString(openT, 0)))
                  .format(),
                isClosed: borrowed.isZero(),
              }

              const openTMoment = moment.unix(
                Number(formatBNToString(openT, 0)),
              )
              const daysSinceOpen = moment().diff(openTMoment, "day", true)

              const fromRangeUnix =
                openTMoment.subtract(1, "day").valueOf() / 1000
              const toRangeUnix = openTMoment.add(1, "day").valueOf() / 1000

              const stEthPriceHistory = await fetchCoinGeckoPriceHistory(
                "staked-ether",
                fromRangeUnix,
                toRangeUnix,
              )
              const ethPriceHistory = await fetchCoinGeckoPriceHistory(
                "ethereum",
                fromRangeUnix,
                toRangeUnix,
              )

              const ethPriceAtOpen = getClosestPriceToTarget(
                ethPriceHistory,
                openTMoment,
              )
              const stEthPriceAtOpen = getClosestPriceToTarget(
                stEthPriceHistory,
                openTMoment,
              )

              const exchangeRate =
                (stEthPriceAtOpen || 1) / (ethPriceAtOpen || 1)

              const ethDeposit =
                Number(formatBNToString(stEth, 18, 5)) * exchangeRate

              const expectedReturn = ethDeposit * APY

              const interestEarnedSoFar = expectedReturn * (daysSinceOpen / 365)

              thisPosData = {
                ...thisPosData,
                ethDeposit,
                interestEarned: interestEarnedSoFar,
              }
            } finally {
              localPosData.push(thisPosData)
            }

            i += 1
          }
        }
      } catch (e) {
        console.error(e)
        setIsError(true)
      } finally {
        setIsLoading(false)
        setIsFetching(false)
      }

      return localPosData
    },
    [earnContract, account, provider],
  )

  const refetch = useCallback(async () => {
    const data = await getPositionData(false, true)
    setPosData(data)
  }, [getPositionData])

  // fetch once on mount (loading & fetching)
  useEffect(() => {
    void getPositionData(true, true).then((res) => setPosData(res))
  }, [getPositionData])

  // refetch on interval
  useInterval(() => void refetch(), 60000)

  return {
    data: posData,
    seed: posData.length + 1,
    isLoading,
    isError,
    isFetching,
    refetch,
  }
}
