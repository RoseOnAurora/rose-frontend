import { Box, BoxProps, Grid, GridItem } from "@chakra-ui/react"
import React, { ReactElement, ReactNode } from "react"

interface Props {
  left: ReactNode
  right: ReactNode
  top?: ReactNode
  bottom?: ReactNode
  templateColumns?: string
}

const ComponentWrapper = ({
  top,
  left,
  right,
  bottom,
  templateColumns,
}: Props): ReactElement => {
  const defaultBoxProps: BoxProps = {
    bg: "gray.900",
    borderRadius: "20px",
    p: { base: "15px", md: "28px" },
  }
  return (
    <Grid
      gridTemplateColumns={templateColumns || "42% 54%"}
      gridTemplateRows="auto"
      gap="30px"
      justifyContent="center"
    >
      {top && <GridItem colSpan={2}>{top}</GridItem>}
      <GridItem rowSpan="auto" colSpan={{ base: 2, lg: 1 }}>
        <Box {...defaultBoxProps}>{left}</Box>
      </GridItem>
      <GridItem rowSpan="auto" colSpan={{ base: 2, lg: 1 }}>
        <Box {...defaultBoxProps}>{right}</Box>
      </GridItem>
      {bottom && (
        <GridItem colSpan={2}>
          <Box {...defaultBoxProps}>{bottom}</Box>
        </GridItem>
      )}
    </Grid>
  )
}

export default ComponentWrapper
