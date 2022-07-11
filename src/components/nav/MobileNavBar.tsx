import { Box, Flex } from "@chakra-ui/react"
import React, { ReactElement } from "react"
import MobileNavMenu from "../menu/MobileNavMenu"
import ThemeChanger from "../ThemeChanger"

const MobileNavBar = (): ReactElement => {
  return (
    <Flex>
      <MobileNavMenu />
      <Box display={{ lg: "none" }}>
        <ThemeChanger />
      </Box>
    </Flex>
  )
}

export default MobileNavBar
