import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react"
import React, { ReactElement } from "react"
import { getFormattedShortTime, msToHMS } from "../utils/dateTime"
import AnimateNumber from "./AnimateNumber"

interface Props {
  timeLeft: number
}

const BorrowCountdownLanding = ({ timeLeft }: Props): ReactElement => {
  const [hours, minutes, seconds] = msToHMS(timeLeft)
  return (
    <Box h="100vh" position="relative">
      <Box
        position="absolute"
        top="80px"
        left="50%"
        transform="translateX(-50%)"
        style={{ WebkitTransform: "translateX(-50%)" }}
        zIndex={5}
      >
        <Stack spacing="50px" whiteSpace="nowrap">
          <Flex
            justifyContent="center"
            alignItems="center"
            gridGap="10px"
            flexDirection={{ base: "column", md: "row" }}
            fontSize="30px"
            fontWeight={700}
          >
            <Text>Borrow launching at</Text>
            <Text>{getFormattedShortTime(1649343600)}</Text>
          </Flex>
          {timeLeft >= 60000 ? (
            <Text
              textAlign="center"
              fontSize="50px"
              fontWeight={700}
              color="white"
            >
              {`${hours}:${minutes}:${seconds}`}
            </Text>
          ) : (
            <Flex justifyContent="center" alignItems="center">
              <AnimateNumber precision={0} value={seconds} fontSize="90px" />
            </Flex>
          )}
          <Button
            variant="outline"
            as="a"
            target="_blank"
            rel="noreferrer"
            href="https://medium.com/@RoseOnAurora/prepare-for-launch-rose-borrow-baf9c4852849"
          >
            Prepare for Launch
          </Button>
        </Stack>
      </Box>
      {/* hacky box to cover the spline watermark... oh well */}
      <Box
        bg="#07080e"
        borderRadius="50%"
        w="50px"
        height="50px"
        bottom="10px"
        right="10px"
        position="absolute"
      />
      <iframe
        src="https://my.spline.design/roseexplorationheroheader-fe9762401df853fdc74a5ef1b72c74d4/"
        frameBorder="0"
        width="100%"
        height="100%"
      />
    </Box>
  )
}

export default BorrowCountdownLanding
