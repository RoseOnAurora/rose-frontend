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
import React, { ReactElement, ReactNode } from "react"
import { Link } from "react-router-dom"

interface Props extends BoxProps {
  fields: Field[]
  route: string
}

export interface Field {
  label: string
  value: ReactNode
  tooltip?: ReactNode
}

interface FormattedStatProps {
  label: string
  value: ReactNode
  hasTooltip?: boolean
}

const FormmattedStat = ({
  label,
  value,
  hasTooltip,
}: FormattedStatProps): ReactElement => {
  return (
    <Stat ml={3}>
      <StatLabel
        color="var(--text-lighter)"
        fontSize={{ base: "11px", md: "13px" }}
      >
        {label}
      </StatLabel>
      <StatNumber
        display="inline"
        fontSize={{ base: "13px", md: "16px" }}
        fontWeight="400"
        {...(hasTooltip && {
          borderBottom: "1px dotted var(--text)",
          cursor: "help",
        })}
      >
        {value}
      </StatNumber>
    </Stat>
  )
}

function ComponentCard(props: Props): ReactElement {
  const { fields, route, ...other } = props

  return (
    <Box {...other}>
      <Link to={route} style={{ margin: 0, width: "100%" }}>
        <Grid
          templateColumns={{
            base: `repeat(${fields.length < 3 ? fields.length : 3}, 1fr)`,
            md: `repeat(${fields.length}, 1fr)`,
          }}
          gap={3}
          alignItems="baseline"
        >
          {fields.map(({ label, value, tooltip }, index) => (
            <GridItem key={index} ml="10px">
              {tooltip ? (
                <Tooltip bgColor="#cc3a59" closeOnClick={false} label={tooltip}>
                  <Box>
                    <FormmattedStat value={value} label={label} hasTooltip />
                  </Box>
                </Tooltip>
              ) : (
                <FormmattedStat value={value} label={label} />
              )}
            </GridItem>
          ))}
        </Grid>
      </Link>
    </Box>
  )
}

export default ComponentCard
