import React, { ReactElement } from "react"
import { commify, formatBNToString } from "../utils"
import { BigNumber } from "@ethersproject/bignumber"
import FarmDetails from "./FarmDetails"
import FarmTabs from "./FarmTabs"
import HarvestRewards from "./HarvestRewards"
import { PoolName } from "../constants"
import styles from "./FarmPage.module.scss"

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
  return (
    <div className={styles.farmPage}>
      <FarmTabs {...props} />
      <FarmDetails
        balance={formattedBalance}
        deposited={formattedDeposited}
        lpTokenIcon={props.lpTokenIcon}
        lpTokenName={props.lpTokenName}
      />
      {/* CHANGE THIS TO FETCH BALANCE */}
      <HarvestRewards rewardBalance={"0.0"} />
    </div>
  )
}

export default FarmPage
