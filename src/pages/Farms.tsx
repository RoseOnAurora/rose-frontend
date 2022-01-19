import React, { ReactElement } from "react"
import { AppState } from "../state"
import { FARMS_MAP } from "../constants"
import FarmsOverview from "../components/FarmsOverview"
import TopMenu from "../components/TopMenu"
import styles from "./Farms.module.scss"
import { useSelector } from "react-redux"

function Farms(): ReactElement {
  const { farmStats } = useSelector((state: AppState) => state.application)
  return (
    <div className={styles.farms}>
      <TopMenu activeTab="farms" />
      <div className={styles.container}>
        {Object.values(FARMS_MAP)
          .sort((a) => {
            return farmStats?.[a.name]?.dualReward.token ? -1 : 1
          })
          .map((farm) => (
            <FarmsOverview
              key={farm.name}
              farmStats={farmStats?.[farm.name]}
              farmName={farm.name}
              farmRoute={farm.route}
              poolName={farm.poolName}
              poolUrl={farm.poolUrl}
              lpTokenName={farm.lpToken.name}
              lpTokenIcon={farm.lpToken.icon}
              isRose={farm.isRose}
            />
          ))}
      </div>
    </div>
  )
}

export default Farms
