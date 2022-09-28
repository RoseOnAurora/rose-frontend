import { Box, Center, Highlight, Image, Text } from "@chakra-ui/react"
import React, { ReactElement } from "react"
import rewardInfo from "../assets/reward-info.svg"

interface RewardInfoProps {
  lpTokenName: string
}

const RewardInfo = ({ lpTokenName }: RewardInfoProps): ReactElement => {
  const desc = `Add liquidity to the pool to get ${lpTokenName}, and stake it to earn
  rewards in ROSE!`
  return (
    <Center w="full" isolation="isolate" pos="relative">
      <Text
        zIndex={2}
        color="gray.300"
        fontWeight={400}
        fontSize="15px"
        lineHeight="21px"
        textAlign="center"
        pt="10px"
        px="25px"
      >
        <Highlight query={lpTokenName} styles={{ color: "gray.100" }}>
          {desc}
        </Highlight>
      </Text>
      <Box pos="absolute" top="-20px">
        <Image src={rewardInfo} />
      </Box>
    </Center>
  )
}

export default RewardInfo
