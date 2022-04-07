import { Box, Container } from "@chakra-ui/react"
import React, { ReactElement } from "react"
import BottomMenu from "../BottomMenu"
import TopMenu from "../TopMenu"

const PageWrapper = ({
  children,
  activeTab,
  maxW = "1095px",
}: React.PropsWithChildren<unknown> & {
  activeTab: string
  maxW?: string
}): ReactElement => {
  return (
    <>
      <Box
        minH="100vh"
        bg="var(--background-main)"
        color="var(--text)"
        fontSize="16px"
        pb="300px"
      >
        <TopMenu activeTab={activeTab} />
        <Container
          maxW={maxW}
          mt="40px"
          paddingInlineStart={"0.5em"}
          paddingInlineEnd={"0.5em"}
        >
          {children}
        </Container>
      </Box>
      <BottomMenu />
    </>
  )
}

export default PageWrapper
