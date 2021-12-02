import {
  FRAX_STABLES_LP_POOL_NAME,
  POOLS_MAP,
  PoolName,
  PoolTypes,
  STABLECOIN_POOL_V2_NAME,
} from "../constants"
import React, { ReactElement, useState } from "react"

import PoolOverview from "../components/PoolOverview"
import TopMenu from "../components/TopMenu"
import { Zero } from "@ethersproject/constants"
import styles from "./Pools.module.scss"
import usePoolData from "../hooks/usePoolData"

function Pools(): ReactElement | null {
  const [usdPoolV2Data, usdV2UserShareData] = usePoolData(
    STABLECOIN_POOL_V2_NAME,
  )
  const [fraxStablesPoolData, fraxStablesUserShareData] = usePoolData(
    FRAX_STABLES_LP_POOL_NAME,
  )
  const [filter] = useState<PoolTypes | "all" | "outdated">("all")

  function getPropsForPool(poolName: PoolName) {
    switch (poolName) {
      case FRAX_STABLES_LP_POOL_NAME:
        return {
          name: poolName,
          poolData: fraxStablesPoolData,
          userShareData: fraxStablesUserShareData,
          poolRoute: `pools/${POOLS_MAP[poolName].route}`,
          farmName: "Frax Farm",
        }
      default:
        return {
          name: poolName,
          poolData: usdPoolV2Data,
          userShareData: usdV2UserShareData,
          poolRoute: `pools/${POOLS_MAP[poolName].route}`,
          farmName: "Stables Farm",
        }
    }
  }
  return (
    <div className={styles.poolsPage}>
      <TopMenu activeTab="pools" />
      <div className={styles.content}>
        {Object.values(POOLS_MAP)
          .filter(
            ({ type, migration, isOutdated }) =>
              filter === "all" ||
              type === filter ||
              (filter === "outdated" && (migration || isOutdated)),
          )
          .map(
            ({ name, migration, isOutdated }) =>
              [getPropsForPool(name), migration, isOutdated] as const,
          )
          .sort(
            ([a, aMigration, aIsOutdated], [b, bMigration, bIsOutdated]) => {
              // 1. active pools
              // 2. user pools
              // 3. higher TVL pools
              if (aMigration || bMigration || aIsOutdated || bIsOutdated) {
                return aMigration || aIsOutdated ? 1 : -1
              } else if (
                (a.userShareData?.usdBalance || Zero).gt(Zero) ||
                (b.userShareData?.usdBalance || Zero).gt(Zero)
              ) {
                return (a.userShareData?.usdBalance || Zero).gt(
                  b.userShareData?.usdBalance || Zero,
                )
                  ? -1
                  : 1
              } else {
                return (a.poolData?.reserve || Zero).gt(
                  b.poolData?.reserve || Zero,
                )
                  ? -1
                  : 1
              }
            },
          )
          .map(([poolProps]) => (
            <PoolOverview key={poolProps.name} {...poolProps} />
          ))}
      </div>
    </div>
  )
}

export default Pools
