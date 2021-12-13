import { FARMS_MAP, FarmName } from "../constants"
import React, { ReactElement } from "react"
import FarmPage from "../components/FarmPage"
import TopMenu from "../components/TopMenu"
import { Zero } from "@ethersproject/constants"
import styles from "./Farm.module.scss"
import useCalculateFarmDeposited from "../hooks/useCalculateFarmDeposited"
import useFarmData from "../hooks/useFarmData"

interface Props {
  farmName: FarmName
}

const Farm = ({ farmName }: Props): ReactElement => {
  const farmData = useFarmData(farmName)
  const { lpToken, poolName } = FARMS_MAP[farmName]
  const deposited = useCalculateFarmDeposited(
    farmData?.lpTokenBalance,
    farmName,
  )
  return (
    <div className={styles.farm}>
      <TopMenu activeTab="farm" />
      <div className={styles.container}>
        <FarmPage
          farmName={farmName}
          poolName={poolName}
          lpTokenName={lpToken.name}
          lpTokenIcon={lpToken.icon}
          balance={farmData?.lpTokenBalance || Zero}
          deposited={deposited}
        />
      </div>
    </div>
  )
}

export default Farm
