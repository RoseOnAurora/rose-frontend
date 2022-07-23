import {
  IconButton,
  IconButtonProps,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Portal,
} from "@chakra-ui/react"
import React, { ReactElement, ReactNode } from "react"

interface Props {
  IconButtonProps: IconButtonProps
  PopoverBodyContent: ReactNode
}

export const IconButtonPopover = ({
  IconButtonProps,
  PopoverBodyContent,
}: Props): ReactElement => {
  return (
    <Popover>
      <PopoverTrigger>
        <IconButton {...IconButtonProps} />
      </PopoverTrigger>
      <Portal>
        <PopoverContent
          borderColor="gray.700"
          border="1px"
          borderRadius="12px"
          minW="fit-content"
          boxShadow="0px 20px 15px -12px rgba(0, 0, 0, 0.25)"
          bg="gray.900"
          _focus={{ borderColor: "gray.600" }}
        >
          <PopoverArrow bgColor="gray.900" />
          <PopoverCloseButton zIndex={4} />
          <PopoverBody>{PopoverBodyContent}</PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  )
}
