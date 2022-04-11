import { Grid, GridItem, Stack } from "@chakra-ui/react"
import React, { ReactElement, ReactNode } from "react"

interface Props {
  left: ReactNode
  right: ReactNode
  top: ReactNode
  templateColumns?: string
}

const OverviewWrapper = ({
  left,
  right,
  top,
  templateColumns,
}: Props): ReactElement => {
  return (
    <Grid
      templateColumns={{ base: "100%", xl: templateColumns || "63% 34%" }}
      templateRows="auto"
      columnGap={{ base: "0", xl: "30px" }}
      rowGap="20px"
      justifyContent="center"
    >
      <GridItem rowSpan={{ base: 2, xl: 1 }} colSpan={1}>
        {top}
      </GridItem>
      <GridItem display={{ base: "none", xl: "grid" }} rowSpan={10} colSpan={1}>
        {right}
      </GridItem>
      <GridItem rowSpan="auto" colSpan={1}>
        <Stack spacing="10px">{left}</Stack>
      </GridItem>
    </Grid>
  )
}

export default OverviewWrapper
