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
import { AppState } from "../state"
import { useSelector } from "react-redux"

interface Props {
  IconButtonProps: IconButtonProps
  PopoverBodyContent: ReactNode
}

export const IconButtonPopover = ({
  IconButtonProps,
  PopoverBodyContent,
}: Props): ReactElement => {
  const { userDarkMode } = useSelector((state: AppState) => state.user)
  return (
    <Popover>
      <PopoverTrigger>
        <IconButton {...IconButtonProps} />
      </PopoverTrigger>
      <Portal>
        <PopoverContent
          bgColor={
            userDarkMode ? "rgba(28, 29, 33, 0.8)" : "rgba(235, 229, 229, 0.8)"
          }
          borderColor={userDarkMode ? "inherit" : "#555555"}
          _focus={{ boxShadow: "none" }}
          _active={{ boxShadow: "none" }}
          style={{
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverBody>{PopoverBodyContent}</PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  )
}
