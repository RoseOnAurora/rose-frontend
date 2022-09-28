import { Outlet, useLocation } from "react-router-dom"
import React, { ReactElement } from "react"
import { Box } from "@chakra-ui/react"
import Footer from "../components/nav/Footer"
import Header from "../components/nav/Header"

const App = ({ children }: React.PropsWithChildren<unknown>): ReactElement => {
  const { pathname } = useLocation()

  return (
    <Box minH="100vh" bg="bgDark" color="white" fontSize="16px" pb="300px">
      <Header activeTab={pathname} />
      {children}
      <Footer />
      <Outlet />
    </Box>
  )
}

export default App
