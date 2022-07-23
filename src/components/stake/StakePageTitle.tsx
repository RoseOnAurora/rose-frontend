import { Box, Flex, Text } from "@chakra-ui/react"
import React, { ReactElement } from "react"
import { AppState } from "../../state"
import { useSelector } from "react-redux"

const StakePageTitle = ({ title }: { title: string }): ReactElement => {
  const { stakeStats } = useSelector((state: AppState) => state.application)

  return (
    <Box borderRadius="10px" py="10px" w="100%">
      <Flex
        justifyContent={{ base: "center", sm: "space-between" }}
        alignItems="center"
        flexDirection={{ base: "column", sm: "row" }}
        gap="20px"
      >
        <Text as="h3" fontWeight={700} fontSize="32px" lineHeight="39px">
          {title}
        </Text>
        <Box w="full" maxW="220px" h="38px" pos="relative">
          <Flex
            pos="relative"
            bg="#23262F"
            boxShadow="0px 16px 64px -48px rgba(31, 47, 70, 0.15)"
            borderRadius="56px"
            alignItems="center"
            flexDir="column"
            justifyContent="center"
            p="13px 25px"
            borderColor="transparent"
            m="auto"
            zIndex={1}
            _before={{
              content: `""`,
              pos: "absolute",
              top: 0,
              bottom: 0,
              right: 0,
              left: 0,
              border: "3px solid transparent",
              borderRadius: "inherit",
              bg: "linear-gradient(to right, #FF4FA3, #611EEA, #4277FF, #FF4FA3)",
              WebkitMask:
                "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
              mask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "destination-out",
              maskComposite: "exclude",
            }}
          >
            <Text
              fontWeight={700}
              fontSize="14px"
              color="white"
              whiteSpace="nowrap"
            >
              1 stROSE ≈{" "}
              {stakeStats?.priceRatio
                ? (+stakeStats?.priceRatio).toFixed(5)
                : "-"}{" "}
              ROSE
            </Text>
          </Flex>
          <Box
            opacity={0.7}
            pos="absolute"
            filter="blur(40px)"
            borderRadius="100px"
            left={0}
            right={0}
            top={0}
            bottom={0}
            bg="conic-gradient(from 29.36deg at 50% 50%, #F54D1B 0deg, #5625BB 135deg, #498CF4 238.12deg, #DF207C 360deg)"
          />
        </Box>
      </Flex>
    </Box>
  )
}

export default StakePageTitle
