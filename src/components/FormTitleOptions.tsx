import { Flex, Text } from "@chakra-ui/react"
import React, { ReactElement, ReactNode } from "react"
import { IconButtonPopover } from "./Popover"
import { SlidersIcon } from "../constants/icons"

const FormTitle = ({
  title,
  popoverOptions,
}: {
  title: string
  popoverOptions: ReactNode
}): ReactElement => {
  return (
    <Flex justifyContent="space-between" alignItems="baseline">
      <Text
        color="#FCFCFD"
        fontSize={{ base: "23px", md: "28px" }}
        fontWeight={700}
        lineHeight="39px"
      >
        {title}
      </Text>
      <IconButtonPopover
        IconButtonProps={{
          "aria-label": "Configure Settings",
          variant: "solid",
          borderRadius: "12px",
          icon: <SlidersIcon />,
          title: "Configure Settings",
        }}
        PopoverBodyContent={popoverOptions}
      />
    </Flex>
  )
}

export default FormTitle
