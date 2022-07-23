import { Box, Flex } from "@chakra-ui/react"
import React, { ReactElement } from "react"
import MobileNavMenu from "../menu/MobileNavMenu"
import ThemeChanger from "../ThemeChanger"

const MobileNavBar = (): ReactElement => {
  return (
    <Flex alignItems="center">
      <MobileNavMenu />
      <Box display="none">
        <ThemeChanger />
      </Box>
    </Flex>
  )
}

export default MobileNavBar
