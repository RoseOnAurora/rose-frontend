import { Box, Center, Image, Link, Text } from "@chakra-ui/react"
import React, { ReactElement } from "react"
import { Link as ReactLink } from "react-router-dom"
import infoIcon from "../assets/info-icon.svg"

interface OutdatedPoolInfoProps {
  poolName: string
  route: string
}

const OutdatedPoolInfo = ({
  poolName,
  route,
}: OutdatedPoolInfoProps): ReactElement => {
  return (
    <Center w="full" isolation="isolate" pos="relative">
      <Text
        textAlign="center"
        fontSize="14px"
        fontWeight={400}
        color="gray.300"
        zIndex={2}
        px="38px"
        pt="20px"
      >
        This pool is outdated. Please withdraw your liquidity and{" "}
        <Link
          as={ReactLink}
          to={route}
          reloadDocument
          textDecoration="underline"
          fontWeight={700}
          color="gray.100"
          _hover={{ color: "gray.200" }}
        >
          migrate to the new {poolName} pool.
        </Link>
      </Text>
      <Box pos="absolute" top="0px">
        <Image src={infoIcon} />
      </Box>
    </Center>
  )
}

export default OutdatedPoolInfo
