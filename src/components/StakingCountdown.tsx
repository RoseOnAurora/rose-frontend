import CountDown, { CountdownRenderProps } from "react-countdown"
import { FaLock, FaUnlock } from "react-icons/fa"
import { Flex, Text, Tooltip } from "@chakra-ui/react"
import React, { ReactElement, useEffect, useState } from "react"
import moment from "moment"
import useLastStakedTime from "../hooks/useLastStakedTime"

const StakingCountdown = (): ReactElement => {
  // hooks
  const lastStaked = useLastStakedTime()

  // state
  const [diff, setDiff] = useState<Date>(moment(moment.now()).toDate())

  // update last staked time
  useEffect(() => {
    if (lastStaked) {
      setDiff(
        moment(+lastStaked * 1000)
          .add(1, "day")
          .toDate(),
      )
    }
  }, [lastStaked])

  return (
    <CountDown
      precision={1}
      date={diff}
      renderer={Renderer}
      key={diff.toString()} // we need a key here to trigger rerender
    />
  )
}

// countdown renderer
const Renderer = ({
  hours,
  minutes,
  seconds,
  completed,
}: CountdownRenderProps): ReactElement => {
  if (completed) {
    return (
      <Flex justifyContent="space-between" alignItems="center">
        <FaUnlock
          size="25px"
          color="#4BB543"
          title="Your stROSE is unlocked."
        />
        <Tooltip
          bgColor="#cc3a59"
          closeOnClick={false}
          label="Your stROSE is unlocked. You can now make transfers and withdraws."
        >
          <Text fontWeight="bold" fontSize="21px">
            Your stROSE is unlocked!
          </Text>
        </Tooltip>
      </Flex>
    )
  }
  return (
    <Flex justifyContent="space-between" alignItems="center">
      <FaLock size="25px" color="#cc3a59" title="Your stROSE is locked." />
      <Tooltip
        bgColor="#cc3a59"
        closeOnClick={false}
        label="This is an estimate of time remaining until you can unstake. Refresh the page for better accuracy."
      >
        <Text fontSize="25px" fontWeight="bold" as="span">
          {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
          {String(seconds).padStart(2, "0")}
        </Text>
      </Tooltip>
    </Flex>
  )
}

export default StakingCountdown
