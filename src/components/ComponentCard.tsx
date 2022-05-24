import {
  Box,
  BoxProps,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  Tooltip,
} from "@chakra-ui/react"
import React, { ReactElement, ReactNode, memo, useRef } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useEffect } from "react"

interface Props extends BoxProps {
  fields: Field[]
  name: string
  route: string
}

export interface Field {
  label: string
  valueRaw: string
  valueComponent?: ReactNode
  tooltip?: ReactNode
}

const FormmattedStat = ({
  label,
  valueRaw,
  valueComponent,
  tooltip,
}: Field): ReactElement => {
  return (
    <Stat ml={3}>
      <StatLabel
        color="var(--text-lighter)"
        fontSize={{ base: "11px", md: "13px" }}
      >
        {label}
      </StatLabel>
      {tooltip ? (
        <Tooltip bgColor="#cc3a59" label={tooltip}>
          <StatNumber
            display="inline-block"
            fontSize={{ base: "13px", md: "16px" }}
            fontWeight="400"
            borderBottom="1px dotted var(--text)"
            cursor="help"
          >
            {valueComponent || valueRaw}
          </StatNumber>
        </Tooltip>
      ) : (
        <StatNumber fontSize={{ base: "13px", md: "16px" }} fontWeight="400">
          {valueComponent || valueRaw}
        </StatNumber>
      )}
    </Stat>
  )
}

const AnimatedComponentCard = memo(
  (props: Props) => {
    const { fields, route, name, ...other } = props
    const MotionBox = motion(Box)
    const prevNameRef = useRef<string>()
    useEffect(() => {
      prevNameRef.current = name
    }, [name])
    return (
      <MotionBox
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
        <Link to={route} style={{ margin: 0, width: "100%" }}>
          <Grid
            templateColumns={{
              base: `repeat(${fields.length < 3 ? fields.length : 3}, 1fr)`,
              md: `repeat(${fields.length}, 1fr)`,
            }}
            gap={3}
            alignItems="baseline"
          >
            {fields.map((field, index) => (
              <GridItem key={index} ml="10px">
                <FormmattedStat {...field} />
              </GridItem>
            ))}
          </Grid>
        </Link>
      </MotionBox>
    )
  },
  (next, prev) =>
    next.fields.every(
      ({ valueRaw = "" }, index) => valueRaw === prev.fields[index]?.valueRaw,
    ) && next.fields.length === prev.fields.length,
)

AnimatedComponentCard.displayName = "AnimatedComponentCard"

export default AnimatedComponentCard
