import { Box, Center, Image, Text } from "@chakra-ui/react"
import React, { ReactElement } from "react"
import infoIcon from "../assets/info-icon.svg"

const ApprovalInfo = (): ReactElement => {
  return (
    <Center w="full" isolation="isolate" pos="relative" mt="15px">
      <Text
        zIndex={2}
        color="gray.200"
        fontWeight={500}
        fontSize="12px"
        lineHeight="16px"
        textAlign="center"
        px="20px"
        pt="24px"
        pb="14px"
      >
        Note: The &quot;Approve&quot; transaction is only needed the first time;
        subsequent actions will not require approval.
      </Text>
      <Box pos="absolute" top="0px">
        <Image src={infoIcon} />
      </Box>
    </Center>
  )
}

export default ApprovalInfo
