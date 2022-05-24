import React, { ReactElement } from "react"
import { Container } from "@chakra-ui/react"

const PageWrapper = ({
  children,
  maxW = "1195px",
}: React.PropsWithChildren<unknown> & {
  activeTab: string
  maxW?: string
}): ReactElement => {
  return (
    <Container
      maxW={maxW}
      mt="40px"
      paddingInlineStart={"0.5em"}
      paddingInlineEnd={"0.5em"}
    >
      {children}
    </Container>
  )
}

export default PageWrapper
