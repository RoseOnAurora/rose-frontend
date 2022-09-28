import { Box, Center, Highlight, Image, Text } from "@chakra-ui/react"
import React, { ReactElement } from "react"
import rewardInfo from "../assets/reward-info.svg"

const StakeRewardInfo = (): ReactElement => {
  return (
    <Center w="full" isolation="isolate" pos="relative" pb="10px" px="30px">
      <Text
        zIndex={2}
        color="gray.300"
        fontWeight={400}
        fontSize="16px"
        lineHeight="20px"
        textAlign="center"
        pb="25px"
        pt="30px"
      >
        <Highlight query={"ROSE!"} styles={{ color: "gray.100" }}>
          Stake your LP token balance to start earning rewards in ROSE!
        </Highlight>
      </Text>
      <Box pos="absolute" top="0px">
        <Image src={rewardInfo} />
      </Box>
    </Center>
  )
}

export default StakeRewardInfo
