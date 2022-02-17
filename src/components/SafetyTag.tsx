import React, { ReactElement } from "react"
import { Tag } from "@chakra-ui/react"

interface Props {
  safetyScore: number
}

const SafetyTag = ({ safetyScore }: Props): ReactElement => {
  return (
    <Tag
      size="md"
      borderRadius="full"
      variant="solid"
      colorScheme={
        safetyScore <= 75 ? "green" : safetyScore > 90 ? "red" : "orange"
      }
      fontSize={{ base: "11px", md: "14px" }}
    >
      {safetyScore <= 75 ? "Safe" : safetyScore > 90 ? "High" : "Moderate"}
    </Tag>
  )
}

export default SafetyTag
