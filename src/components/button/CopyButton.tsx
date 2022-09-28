import { Button, ButtonProps } from "@chakra-ui/react"
import { CheckIcon, CopyIcon } from "@chakra-ui/icons"
import React, { ReactElement } from "react"
import useCopyClipboard from "../../hooks/useCopyClipboard"

interface CopyButtonProps extends Omit<ButtonProps, "onClick" | "leftIcon"> {
  buttonText: string
  toCopy: string
}

export default function CopyButton({
  buttonText,
  toCopy,
  ...rest
}: CopyButtonProps): ReactElement {
  const [isCopied, setCopied] = useCopyClipboard()

  return (
    <Button
      {...rest}
      leftIcon={
        isCopied ? (
          <CheckIcon fontSize="inherit" color="inherit" />
        ) : (
          <CopyIcon color="inherit" />
        )
      }
      onClick={() => setCopied(toCopy)}
    >
      {isCopied ? "Copied!" : buttonText}
    </Button>
  )
}
