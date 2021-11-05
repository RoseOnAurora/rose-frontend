import React, { ReactElement } from "react"
import FarmPage from "../components/FarmPage"
import { PoolName } from "../constants"
import TopMenu from "../components/TopMenu"
import { Zero } from "@ethersproject/constants"
import styles from "./Farm.module.scss"
import useCalculateFarmDeposited from "../hooks/useCalculateFarmDeposited"
import usePoolData from "../hooks/usePoolData"

interface Props {
  poolName: PoolName
}

const Farm = ({ poolName }: Props): ReactElement => {
  const [poolData, userShareData] = usePoolData(poolName)
  const deposited = useCalculateFarmDeposited(
    userShareData?.lpTokenBalance || Zero,
  )
  return (
    <div className={styles.farm}>
      <TopMenu activeTab="farm" />
      <div className={styles.container}>
        <FarmPage
          lpTokenName={poolData.lpToken}
          lpTokenIcon={"🌹"}
          balance={userShareData?.lpTokenBalance || Zero}
          deposited={deposited}
          poolName={poolName}
        />
      </div>
    </div>
  )
}

export default Farm
