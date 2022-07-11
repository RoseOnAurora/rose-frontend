import "../styles/global.scss"
import { Outlet, useLocation } from "react-router-dom"
import React, { ReactElement } from "react"
import { Box } from "@chakra-ui/react"
import Footer from "../components/Footer"
import Header from "../components/Header"

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
      <Header activeTab={pathname} />
      {children}
      <Footer />
      <Outlet />
    </Box>
  )
}

export default App
