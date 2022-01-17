import { AppDispatch } from "../state"
import retry from "async-retry"
import { updateStakeStats } from "../state/application"

const stakeStatsApi =
  "https://raw.githubusercontent.com/RoseOnAurora/apr/master/rose.json"

interface StakeStatsApiResponse {
  price_of_rose: string
  price_of_strose: string
  strose_rose_ratio: string
  strose_tvl: string
  total_rose_staked: string
  strose_apr: string
}

export interface StakeStats {
  priceRatio: string
  tvl: string
  totalRoseStaked: string
  priceOfRose: string
  apr: string
}

export default function fetchStakeStats(dispatch: AppDispatch): void {
  void retry(() =>
    fetch(stakeStatsApi)
      .then((res) => res.json())
      .then((body: StakeStatsApiResponse[]) => {
        body.map((b) => {
          dispatch(
            updateStakeStats({
              priceRatio: b?.strose_rose_ratio,
              tvl: b?.strose_tvl,
              totalRoseStaked: b?.total_rose_staked,
              priceOfRose: b?.price_of_rose,
              apr: b?.strose_apr,
            }),
          )
        })
      }),
  )
}
