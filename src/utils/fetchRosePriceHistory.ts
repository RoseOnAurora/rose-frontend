import {
  updateLastTransactionTimes,
  updateRosePriceHistory,
} from "../state/application"
import { AppDispatch } from "../state"
import { TRANSACTION_TYPES } from "../constants"
import retry from "async-retry"

const coinGeckoApi =
  "https://api.coingecko.com/api/v3/coins/aurora/contract/0xdcd6d4e2b3e1d1e1e6fa8c21c8a323dcbecff970/market_chart/?vs_currency=usd&days=7"

interface CoinGeckoResponse {
  prices: number[][]
}

export default function fetchRosePriceHistory(dispatch: AppDispatch): void {
  void retry(
    () =>
      fetch(coinGeckoApi)
        .then((res) => res.json())
        .then((body: CoinGeckoResponse) => {
          const pricesMapped = body.prices.map(([time, price]) => {
            return { time, price }
          })
          dispatch(updateRosePriceHistory(pricesMapped))
          dispatch(
            updateLastTransactionTimes({
              [TRANSACTION_TYPES.ROSE_PRICE]: Date.now(),
            }),
          )
        }),
    { retries: 1 },
  )
}
