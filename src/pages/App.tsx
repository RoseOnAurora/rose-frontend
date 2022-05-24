import "../styles/global.scss"
import { Outlet, useLocation } from "react-router-dom"
import React, { ReactElement } from "react"
import BottomMenu from "../components/BottomMenu"
import { Box } from "@chakra-ui/react"
import TopMenu from "../components/TopMenu"

const App = ({ children }: React.PropsWithChildren<unknown>): ReactElement => {
  const { pathname } = useLocation()

  return (
    <Box
      minH="100vh"
      bg="var(--background-main)"
      color="var(--text)"
      fontSize="16px"
      pb="300px"
    >
      <TopMenu activeTab={pathname} />
      {children}
      <BottomMenu />
      <Outlet />
    </Box>
  )
}

export default App
