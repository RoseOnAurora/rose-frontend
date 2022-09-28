import { Box, BoxProps, Grid, GridItem } from "@chakra-ui/react"
import React, { ReactElement, ReactNode } from "react"

interface Props {
  left: ReactNode
  right: ReactNode
  top?: ReactNode
  templateColumns?: string
}

const OverviewWrapper = ({
  left,
  right,
  templateColumns,
}: Props): ReactElement => {
  const defaultBoxProps: BoxProps = {
    bg: { base: "transparent", lg: "gray.900" },
    borderRadius: "20px",
    py: "28px",
    px: "20px",
  }
  return (
    <Grid
      templateColumns={{ base: "100%", xl: templateColumns || "32% 65%" }}
      templateRows="auto"
      gap="20px"
      justifyContent="center"
    >
      <GridItem
        display={{ base: "none", xl: "initial" }}
        rowSpan="auto"
        colSpan={{ base: 0, lg: 1 }}
      >
        <Box {...defaultBoxProps}>{left}</Box>
      </GridItem>
      <GridItem rowSpan="auto" colSpan={1}>
        <Box {...defaultBoxProps}>{right}</Box>
      </GridItem>
    </Grid>
  )
}

export default OverviewWrapper
