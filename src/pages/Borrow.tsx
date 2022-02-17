import { BORROW_MARKET_MAP, BorrowMarketName } from "../constants"
import { Box, Container } from "@chakra-ui/react"
import React, { ReactElement } from "react"
import BorrowPage from "../components/BorrowPage"
import TopMenu from "../components/TopMenu"

interface Props {
  borrowName: BorrowMarketName
}

const Borrow = ({ borrowName }: Props): ReactElement => {
  const { borrowToken, collateralToken } = BORROW_MARKET_MAP[borrowName]
  return (
    <Box
      minH="100vh"
      bg="var(--background-main)"
      color="var(--text)"
      fontSize="16px"
      pb="300px"
    >
      <TopMenu activeTab="borrow" />
      <Container
        maxW="1195px"
        mt="40px"
        paddingInlineStart={"0.5em"}
        paddingInlineEnd={"0.5em"}
      >
        <BorrowPage
          borrowName={borrowName}
          borrowToken={{ ...borrowToken }}
          collateralToken={{ ...collateralToken }}
        />
      </Container>
    </Box>
  )
}
export default Borrow
