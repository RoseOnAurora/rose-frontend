import React, { ReactElement } from "react"
import { commify, formatBNToString } from "../utils"
import { BigNumber } from "@ethersproject/bignumber"
import FarmDetails from "./FarmDetails"
import FarmFooter from "./FarmFooter"
import FarmTabs from "./FarmTabs"
import HarvestRewards from "./HarvestRewards"
import { PoolName } from "../constants"
import styles from "./FarmPage.module.scss"
import useEarnedRewards from "../hooks/useEarnedRewards"

interface Props {
  lpTokenName: string
  lpTokenIcon: string
  balance: BigNumber
  deposited: BigNumber
  poolName: PoolName
}

const FarmPage = (props: Props): ReactElement => {
  const formattedBalance = commify(formatBNToString(props.balance, 18, 6))
  const formattedDeposited = commify(formatBNToString(props.deposited, 18, 6))
  const rewardsEarned = useEarnedRewards()
  return (
    <div className={styles.farmPage}>
      <FarmTabs {...props} />
      <FarmDetails
        balance={formattedBalance}
        deposited={formattedDeposited}
        lpTokenIcon={props.lpTokenIcon}
        lpTokenName={props.lpTokenName}
      />
      <HarvestRewards rewardBalance={rewardsEarned} />
      <FarmFooter deposited={props.deposited}></FarmFooter>
    </div>
  )
}

export default FarmPage
