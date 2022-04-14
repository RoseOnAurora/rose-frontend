import { Box, Grid, GridItem } from "@chakra-ui/react"
import React, { ReactElement, ReactNode } from "react"

interface Props {
  left: ReactNode
  right: ReactNode
  top?: ReactNode
  bottom?: ReactNode
}

const ComponentWrapper = ({
  top,
  left,
  right,
  bottom,
}: Props): ReactElement => {
  const defaultBoxProps = {
    bg: "var(--background-element)",
    boxShadow: "var(--shadow)",
    border: "1px solid var(--outline)",
    borderRadius: "10px",
    p: "10px",
  }
  return (
    <Grid
      gridTemplateColumns="52% 44%"
      gridTemplateRows="auto"
      gap="10px"
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
