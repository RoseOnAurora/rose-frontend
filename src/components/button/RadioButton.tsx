import {
  Box,
  HStack,
  UseRadioGroupProps,
  UseRadioProps,
  useRadio,
  useRadioGroup,
} from "@chakra-ui/react"
import React, { ReactElement } from "react"

// 1. Create a component that consumes the `useRadio` hook
function RadioCard(
  props: React.PropsWithChildren<UseRadioProps>,
): ReactElement {
  const { getInputProps, getCheckboxProps } = useRadio(props)

  const input = getInputProps()
  const checkbox = getCheckboxProps()

  return (
    <Box as="label">
      <input {...input} />
      <Box
        {...checkbox}
        fontSize="13px"
        cursor="pointer"
        borderWidth="1px"
        borderRadius="12px"
        boxShadow="md"
        color="gray.200"
        _checked={{
          bg: "red.500",
          color: "white",
          borderColor: "red.500",
        }}
        _focus={{
          boxShadow: "outline",
        }}
        px={3}
        py={2}
      >
        {props.children}
      </Box>
    </Box>
  )
}

// Step 2: Use the `useRadioGroup` hook to control a group of custom radios.
export default function RoseRadioGroup(
  props: UseRadioGroupProps & { options: string[] },
): ReactElement {
  const { getRootProps, getRadioProps } = useRadioGroup(props)

  const group = getRootProps()

  return (
    <HStack {...group}>
      {props.options.map((value) => {
        const radio = getRadioProps({ value })
        return (
          <RadioCard key={value} {...radio}>
            {value}
          </RadioCard>
        )
      })}
    </HStack>
  )
}
