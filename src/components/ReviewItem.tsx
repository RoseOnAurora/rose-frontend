import { Box, Flex, HStack, Image, Text } from "@chakra-ui/react"
import React, { ReactElement } from "react"

interface ReviewItemProps {
  icon: string
  symbol: string
  amount: string
}

const ReviewItem = ({
  icon,
  symbol,
  amount,
}: ReviewItemProps): ReactElement => {
  return (
    <Flex justifyContent="space-between" alignItems="center">
      <HStack spacing={2}>
        <Box boxSize="24px">
          <Image src={icon} alt="icon" w="full" objectFit="cover" />
        </Box>
        <Text as="span" color="gray.300" fontWeight={400}>
          {symbol}
        </Text>
      </HStack>
      <Text as="span" color="gray.50" fontWeight={700}>
        {amount}
      </Text>
    </Flex>
  )
}

export default ReviewItem
