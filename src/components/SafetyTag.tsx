import React, { ReactElement } from "react"
import { Tag } from "@chakra-ui/react"

interface Props {
  safetyScore: number
}

const SafetyTag = ({ safetyScore }: Props): ReactElement => {
  return (
    <Tag
      size="lg"
      borderRadius="full"
      variant="solid"
      colorScheme={
        safetyScore >= 89 ? "red" : safetyScore <= 50 ? "green" : "orange"
      }
      fontSize={{ base: "11px", md: "14px" }}
    >
      {safetyScore >= 89 ? "High" : safetyScore <= 50 ? "Safe" : "Moderate"}
    </Tag>
  )
}

export default SafetyTag
