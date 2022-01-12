import React, { ReactElement } from "react"
import { SlideFade, Tooltip } from "@chakra-ui/react"
import classNames from "classnames"
import styles from "./StakeLockedTimer.module.scss"

interface Props {
  timeLeft: number
}

const StakeLockedTimer = ({ timeLeft }: Props): ReactElement => {
  const locked = timeLeft ? true : false
  return (
    <SlideFade in={true} className={styles.stakeLockWrapper} offsetY="-30px">
      <div className={styles.stakeLockContainer}>
        <div className={styles.messageWrapper}>
          <h4 className={styles.title}>Your stROSE is </h4>
          <Tooltip
            bgColor="#cc3a59"
            closeOnClick={false}
            label="This feature is still in beta. If you believe your stROSE is unlocked, try performing the unstake operation."
          >
            <h4
              className={classNames(
                styles.title,
                styles.status,
                { [styles.locked]: locked },
                { [styles.unlocked]: !locked },
              )}
            >
              {locked ? "Locked" : "Unlocked"}
            </h4>
          </Tooltip>
        </div>
        <div className={styles.stakeLockTimer}>
          <div className={styles.lockMessage}>
            Time left until unstake allowed
          </div>
          <div className={styles.timeLeft}>
            <Tooltip
              bgColor="#cc3a59"
              closeOnClick={false}
              label="This is an estimate of time remaining until you can unstake. Refresh the page for better accuracy."
            >
              <h4 className={styles.title}>
                {new Date((timeLeft / 1000) * 1000).toISOString().substr(11, 8)}
              </h4>
            </Tooltip>
            <span className={styles.timeUnits}>(HH:MM:SS)</span>
          </div>
        </div>
      </div>
    </SlideFade>
  )
}

export default StakeLockedTimer
