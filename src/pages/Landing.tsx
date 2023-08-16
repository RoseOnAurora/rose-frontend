import {
  Box,
  Button,
  Container,
  Heading,
  Image,
  Stack,
  StackDirection,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react"
import React, { ReactElement } from "react"
import { Link } from "react-router-dom"
import holoRose from "../assets/holo-rose-pink-circle.png"
import redRec from "../assets/red-rec.png"

const Landing = (): ReactElement => {
  const dir = useBreakpointValue({
    base: "column",
    lg: "row",
  }) as StackDirection

  return (
    <Container maxW="5xl" mt="20px" px={3} overflowX="hidden">
      <Stack align="center" justify="space-between" direction={dir}>
        <Box p={8} pos="relative" mt="150px">
          <Box w="100px" pos="absolute" left={0} top={3}>
            <Image w="full" src={redRec} objectFit="cover" />
          </Box>
          <Stack pos="relative" spacing={-2}>
            <Heading pt="25px" fontSize="9xl">
              Rose
            </Heading>
            <Text fontSize="xl">
              The <b>liquidity</b> layer for <b>crypto</b>
            </Text>
          </Stack>
        </Box>
        <Box>
          <Image w="full" src={holoRose} objectFit="cover" />
        </Box>
      </Stack>
      <Container maxW="sm" mt="100px">
        <Button as={Link} to="/swap" variant="outline">
          Enter App
        </Button>
      </Container>
    </Container>
  )
}

export default Landing
