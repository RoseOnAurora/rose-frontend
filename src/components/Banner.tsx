import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertProps,
  AlertTitle,
  Box,
  CloseButton,
} from "@chakra-ui/react"
import React, { ReactElement, useState } from "react"

export type BannerProps = {
  bannerMessage: string
  bannerTitle?: string
  onClose?: () => void
} & AlertProps

export default function Banner(props: BannerProps): ReactElement | null {
  const { onClose, bannerMessage, bannerTitle, ...alertProps } = props
  const [showState, setShowState] = useState(true)
  const handleClose = () => {
    onClose?.()
    setShowState(false)
  }
  return showState ? (
    <Alert {...alertProps}>
      <AlertIcon />
      <Box flex="1">
        {bannerTitle && <AlertTitle>{bannerTitle}</AlertTitle>}
        <AlertDescription display="block">{bannerMessage}</AlertDescription>
      </Box>
      <CloseButton
        position="absolute"
        right="8px"
        top="8px"
        onClick={() => handleClose()}
      />
    </Alert>
  ) : null
}
