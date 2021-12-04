import { BLOCK_TIME } from "../constants"
import retry from "async-retry"
import usePoller from "./usePoller"
import { useState } from "react"
// To-DO:  clean this file up
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
  name: string
  apr: string
  tvl: string
}

const emptyState = [
  {
    name: "",
    apr: "-",
    tvl: "-",
  },
]

export default function useFarmStats(): FarmStats[] {
  const [farmStats, setFarmStats] = useState(emptyState)
  usePoller(() => {
    function pollFarmStats(): void {
      void retry(() =>
        fetch(farmStatsApi)
          .then((res) => res.json())
          .then((body: FarmStatsResponse[]) => {
            const res = body.map((b) => {
              return {
                name: b?.name,
                apr: b?.apr,
                tvl: b?.farm_tvl,
              }
            })
            setFarmStats(res)
          }),
      )
    }
    void pollFarmStats()
  }, BLOCK_TIME)
  return farmStats
}
