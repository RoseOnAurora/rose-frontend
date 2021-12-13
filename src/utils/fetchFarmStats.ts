import { AppDispatch } from "../state"
import retry from "async-retry"
import { updateFarmStats } from "../state/application"
const farmStatsApi =
  "https://raw.githubusercontent.com/RoseOnAurora/apr/master/data.json"

interface FarmStatsResponse {
  deposited_token_address: string
  farm_tvl: string
  apr: string
  name: string
  farm_address: string
}

export interface FarmStats {
  apr: string
  tvl: string
}

export default function fetchFarmStats(dispatch: AppDispatch): void {
  void retry(() =>
    fetch(farmStatsApi)
      .then((res) => res.json())
      .then((body: FarmStatsResponse[]) => {
        body.map((b) => {
          dispatch(
            updateFarmStats({
              [b?.name]: {
                apr: b?.apr,
                tvl: b?.farm_tvl,
              },
            }),
          )
        })
      }),
  )
}
