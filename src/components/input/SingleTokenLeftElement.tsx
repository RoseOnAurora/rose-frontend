import { Box, Flex, Image, Text } from "@chakra-ui/react"
import React, { ReactElement } from "react"
import { TokenProps } from "../../types/token"

interface SingleTokenLeftElementProps {
  token: TokenProps
}

const SingleTokenLeftElement = ({
  token,
}: SingleTokenLeftElementProps): ReactElement => {
  return (
    <Flex alignItems="center" gap="6px">
      <Box boxSize="30px">
        <Image src={token.icon} objectFit="cover" w="full" />
      </Box>
      <Flex alignItems="center" gap="3px">
        <Text fontSize="16px" fontWeight={500} color="gray.50">
          {token.symbol}
        </Text>
        <Text fontSize="12px" fontWeight={700} color="gray.500">
          {token.name}
        </Text>
      </Flex>
    </Flex>
  )
}

export default SingleTokenLeftElement
