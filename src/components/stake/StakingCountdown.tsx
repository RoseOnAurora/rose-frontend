import { Box, Flex, Image, Text, Tooltip } from "@chakra-ui/react"
import CountDown, { CountdownRenderProps } from "react-countdown"
import React, { ReactElement, useEffect, useState } from "react"
import lock from "../../assets/lock.svg"
import moment from "moment"
import unlock from "../../assets/unlock.svg"
import useLastStakedTime from "../../hooks/useLastStakedTime"

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
        <Tooltip
          closeOnClick={false}
          label="Your stROSE is unlocked. You can now make transfers and withdraws."
        >
          <Text
            color="#FCFCFD"
            fontWeight={700}
            fontSize={{ base: "20px", md: "25px" }}
            lineHeight="39px"
            cursor="help"
          >
            stROSE unlocked!
          </Text>
        </Tooltip>
        <Box boxSize={9}>
          <Image src={unlock} objectFit="cover" w="full" />
        </Box>
      </Flex>
    )
  }
  return (
    <Flex justifyContent="space-between" alignItems="center">
      <Tooltip
        closeOnClick={false}
        label="This is an estimate of time remaining until you can unstake. Refresh the page for better accuracy."
      >
        <Text
          color="#FCFCFD"
          fontWeight={700}
          fontSize={{ base: "20px", md: "25px" }}
          lineHeight="39px"
          as="span"
          cursor="help"
        >
          {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
          {String(seconds).padStart(2, "0")}
        </Text>
      </Tooltip>
      <Box boxSize={9} title="Your stROSE is locked.">
        <Image src={lock} objectFit="cover" w="full" />
      </Box>
    </Flex>
  )
}

export default StakingCountdown
