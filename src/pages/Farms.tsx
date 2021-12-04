import React, { ReactElement } from "react"
import { FARMS_MAP } from "../constants"
import FarmsOverview from "../components/FarmsOverview"
import TopMenu from "../components/TopMenu"
import styles from "./Farms.module.scss"
import useFarmStats from "../hooks/useFarmStats"

function Farms(): ReactElement {
  const farmStats = useFarmStats()
  return (
    <div className={styles.farms}>
      <TopMenu activeTab="farms" />
      <div className={styles.container}>
        {Object.values(FARMS_MAP)
          .sort((a) => {
            return a.isRose ? 1 : -1
          })
          .map((farm) => (
            <FarmsOverview
              key={farm.name}
              farmStats={farmStats.find((x) => x.name === farm.name)}
              farmName={farm.name}
              farmRoute={farm.route}
              poolName={farm.poolName}
              poolUrl={farm.poolUrl}
              lpTokenName={farm.lpToken.name}
              isRose={farm.isRose}
            />
          ))}
      </div>
    </div>
  )
}

export default Farms
