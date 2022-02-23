import { Flex, Text } from "@chakra-ui/react"
import React, { ReactElement, ReactNode } from "react"
import { BsSliders } from "react-icons/bs"
import { IconButtonPopover } from "./Popover"

const FormTitle = ({
  title,
  popoverOptions,
}: {
  title: string
  popoverOptions: ReactNode
}): ReactElement => {
  return (
    <Flex justifyContent="space-between" alignItems="center">
      <Text as="h3" fontWeight="700" fontSize="30px" lineHeight="30px">
        {title}
      </Text>
      <IconButtonPopover
        IconButtonProps={{
          "aria-label": "Configure Settings",
          variant: "outline",
          size: "lg",
          icon: <BsSliders size="25px" />,
          title: "Configure Settings",
        }}
        PopoverBodyContent={popoverOptions}
      />
    </Flex>
  )
}

export default FormTitle
