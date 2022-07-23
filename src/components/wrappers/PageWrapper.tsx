import React, { ReactElement } from "react"
import { Container } from "@chakra-ui/react"

const PageWrapper = ({
  children,
  maxW = "1195px",
}: React.PropsWithChildren<unknown> & {
  maxW?: string
}): ReactElement => {
  return (
    <Container maxW={maxW} mt="50px" px={3}>
      {children}
    </Container>
  )
}

export default PageWrapper
