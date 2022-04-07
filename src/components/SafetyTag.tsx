import React, { ReactElement } from "react"
import { Tag } from "@chakra-ui/react"
import { calculatePositionHealthColor } from "../utils"

interface Props {
  safetyScore: number
  isStable?: boolean
}

const SafetyTag = ({ safetyScore, isStable }: Props): ReactElement => {
  const color = calculatePositionHealthColor(safetyScore, isStable)
  return (
    <Tag
      size="lg"
      borderRadius="full"
      variant="solid"
      colorScheme={color}
      fontSize={{ base: "11px", md: "14px" }}
    >
      {color === "red" ? "High" : color === "green" ? "Safe" : "Moderate"}
    </Tag>
  )
}

export default SafetyTag
