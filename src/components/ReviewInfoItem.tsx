import { Flex, Text } from "@chakra-ui/react"
import React, { ReactElement } from "react"

interface ReviewInfoItemProps {
  label: string
  value: string
}

const ReviewInfoItem = ({
  label,
  value,
}: ReviewInfoItemProps): ReactElement => {
  return (
    <Flex justifyContent="space-between" alignItems="center">
      <Text as="span" color="gray.300" fontWeight={400}>
        {label}
      </Text>
      <Text as="span" color="gray.50" fontWeight={700}>
        {value}
      </Text>
    </Flex>
  )
}

export default ReviewInfoItem
