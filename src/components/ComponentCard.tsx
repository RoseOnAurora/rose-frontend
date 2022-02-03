import {
  Box,
  BoxProps,
  Flex,
  Grid,
  GridItem,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  Tooltip,
} from "@chakra-ui/react"
import React, { ReactElement, ReactNode } from "react"
import { Link } from "react-router-dom"

interface Props extends BoxProps {
  componentName: string
  componentIcon: string
  componentTooltipLabel?: string
  fields: Field[]
  route: string
  extraComponentChild?: ReactNode
}

interface Field {
  label: string
  value: string
  tooltip?: ReactNode
}

interface FormattedTooltipProps {
  tooltip?: string
  value: string
}

interface FormattedStatProps {
  label: string
  value: string
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
        fontSize={{ base: "8px", sm: "10px", md: "13px" }}
      >
        {label}
      </StatLabel>
      <StatNumber
        display="inline"
        fontSize={{ base: "11px", sm: "13px", md: "16px" }}
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

const FormattedComponentTooltip = ({
  tooltip,
  value,
}: FormattedTooltipProps): ReactElement => {
  return tooltip ? (
    <Tooltip bgColor="#cc3a59" closeOnClick={false} label={tooltip}>
      <Text
        fontWeight="600"
        fontSize={{ base: "11px", sm: "13px", md: "16px" }}
        borderBottom="1px dotted var(--text)"
        cursor="help"
      >
        {value}
      </Text>
    </Tooltip>
  ) : (
    <Text fontWeight="600" fontSize={{ base: "11px", sm: "13px", md: "16px" }}>
      {value}
    </Text>
  )
}

function ComponentCard(props: Props): ReactElement {
  const {
    componentName,
    componentIcon,
    componentTooltipLabel,
    fields,
    route,
    extraComponentChild,
    ...other
  } = props

  return (
    <Box {...other}>
      <Link to={route} style={{ margin: 0, width: "100%" }}>
        <Grid
          templateColumns={{
            base: `repeat(${fields.length + 1}, 1fr)`,
            md: `repeat(${fields.length + (extraComponentChild ? 2 : 1)}, 1fr)`,
          }}
          gap={4}
          alignItems="baseline"
        >
          <GridItem>
            <Stack>
              <Text
                color="var(--text-lighter)"
                fontSize={{ base: "8px", sm: "10px", md: "13px" }}
              >
                Name
              </Text>
              <Flex alignItems="center" flexWrap="wrap">
                <Box
                  width={
                    /rose-/.exec(componentIcon || "")
                      ? { base: "30px", md: "50px" }
                      : { base: "15px", md: "30px" }
                  }
                  marginRight="5px"
                >
                  <img alt="icon" src={componentIcon} width="100%" />
                </Box>
                <FormattedComponentTooltip
                  value={componentName}
                  tooltip={componentTooltipLabel}
                />
              </Flex>
            </Stack>
          </GridItem>
          {fields.map(({ label, value, tooltip }, index) => (
            <GridItem key={index}>
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
          {extraComponentChild && (
            <GridItem display={{ base: "none", md: "grid" }}>
              {extraComponentChild}
            </GridItem>
          )}
        </Grid>
      </Link>
    </Box>
  )
}

export default ComponentCard
