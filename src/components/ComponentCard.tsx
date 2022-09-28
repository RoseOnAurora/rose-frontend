import {
  Box,
  Flex,
  Grid,
  GridItem,
  LinkBox,
  LinkBoxProps,
  LinkOverlay,
  Text,
  Tooltip,
} from "@chakra-ui/react"
import React, { ReactElement, memo, useRef } from "react"
import { Field } from "../types/table"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useEffect } from "react"

interface Props extends LinkBoxProps {
  fields: Field[]
  name: string
  route: string
}

const FormmattedStat = ({
  label,
  valueRaw,
  valueComponent,
  tooltip,
  route,
}: Field & { route: string }): ReactElement => {
  return tooltip ? (
    <Flex justifyContent="space-between" alignItems="center">
      <Text
        color="gray.300"
        fontSize={{ base: "14px", md: "16px" }}
        fontWeight={400}
        display={{ base: "flex", lg: "none" }}
      >
        {label}
      </Text>
      <Tooltip label={tooltip}>
        <Box
          as="a"
          href={window.location.toString()} // route to current location instead of the overlay
          display="inline-block"
          fontSize={{ base: "15px", md: "16px" }}
          fontWeight={500}
          borderBottom="1px dotted"
          cursor="help"
        >
          {valueComponent || valueRaw}
        </Box>
      </Tooltip>
    </Flex>
  ) : (
    // link overlay is used here since this component will not have
    // <a></a> tag
    <LinkOverlay as={Link} to={route}>
      <Flex justifyContent="space-between" alignItems="center">
        <Text
          color="gray.300"
          fontSize={{ base: "14px", md: "16px" }}
          fontWeight={400}
          display={{ base: "flex", lg: "none" }}
        >
          {label}
        </Text>
        <Box fontSize={{ base: "15px", md: "16px" }} fontWeight={400}>
          {valueComponent || valueRaw}
        </Box>
      </Flex>
    </LinkOverlay>
  )
}

const AnimatedComponentCard = memo(
  (props: Props) => {
    const { fields, route, name, ...other } = props
    const MotionLinkBox = motion(LinkBox)
    const prevNameRef = useRef<string>()
    useEffect(() => {
      prevNameRef.current = name
    }, [name])
    return (
      <MotionLinkBox
        as="div"
        initial={
          prevNameRef.current === name
            ? { opacity: 1, scale: 1 }
            : { opacity: 0, scale: 0.85 }
        }
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        exit={{ opacity: 0, scale: 1 }}
        layout
        {...other}
      >
        <Grid
          templateColumns={{
            base: "repeat(1, 1fr)",
            lg: `repeat(${fields.length}, 1fr)`,
          }}
          rowGap={3}
          columnGap={4}
          alignItems="center"
        >
          {fields.map((field, index) => (
            <GridItem key={index} color="gray.50" ml={2}>
              <FormmattedStat {...field} route={route} />
            </GridItem>
          ))}
        </Grid>
      </MotionLinkBox>
    )
  },
  (next, prev) =>
    next.fields.every(
      ({ valueRaw = "" }, index) => valueRaw === prev.fields[index]?.valueRaw,
    ) && next.fields.length === prev.fields.length,
)

AnimatedComponentCard.displayName = "AnimatedComponentCard"

export default AnimatedComponentCard
