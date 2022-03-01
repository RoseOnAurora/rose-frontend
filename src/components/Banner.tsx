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
import useMultiMinter from "../hooks/useClaimTestnetTokens"

export type BannerProps = {
  // bannerMessage: string
  bannerTitle?: string
  onClose?: () => void
} & AlertProps

export default function Banner(props: BannerProps): ReactElement | null {
  // const { onClose, bannerMessage, bannerTitle, ...alertProps } = props
  const { onClose, bannerTitle, ...alertProps } = props
  const multiMinter = useMultiMinter()
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
        <AlertDescription display="block">
          Click{" "}
          <a
            onClick={multiMinter}
            href="#"
            style={{ textDecoration: "underline", marginLeft: "0" }}
          >
            here to mint
          </a>{" "}
          testnet UST, NEAR, and ROSE to try borrowing RUSD. To submit a bug
          report or feature request, click <b>Provide Feedback</b> in the bottom
          right corner (disable adblock if you don&apos;t see it).
        </AlertDescription>
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
