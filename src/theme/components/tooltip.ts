import { SystemStyleFunction } from "@chakra-ui/theme-tools"
import { SystemStyleObject } from "@chakra-ui/styled-system"

// base style every button has
const baseStyle: SystemStyleObject = {
  borderRadius: "12px",
  px: "13px",
  py: "6px",
}

const variantPrimary: SystemStyleFunction = () => {
  return {
    bg: "red.400",
  }
}

// record of different variants
const variants: Record<string, SystemStyleFunction> = {
  primary: variantPrimary,
}

// The default `size` or `variant` values
const defaultProps: SystemStyleObject = {
  variant: "primary",
}

export default { baseStyle, variants, defaultProps }
