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
          _focus={{ boxShadow: "none" }}
          _active={{ boxShadow: "none" }}
        >
          <PopoverArrow />
          <PopoverCloseButton zIndex={4} />
          <PopoverBody>{PopoverBodyContent}</PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  )
}
