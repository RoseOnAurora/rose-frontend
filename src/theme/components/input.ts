import {
  PartsStyleFunction,
  PartsStyleObject,
  SystemStyleObject,
} from "@chakra-ui/theme-tools"
import { inputAnatomy as parts } from "@chakra-ui/anatomy"

// base style every input has
const baseStyle: PartsStyleObject<typeof parts> = {
  field: {
    border: "2px",
    fontWeight: 700,
    bg: "transparent",
  },
  element: {
    h: "full",
    minW: "fit-content",
    borderRadius: "12px",
  },
}

// Styles for the size variations
const sizes: Record<string, PartsStyleObject<typeof parts>> = {
  md: {
    field: {
      fontSize: "16px",
      lineHeight: "20px",
      h: 12,
      borderRadius: "12px",
    },
  },
  lg: {
    field: {
      fontSize: "20px",
      lineHeight: "26px",
      h: 16,
      borderRadius: "12px",
    },
  },
}

// Styles for the visual style variations
const variantSimple: PartsStyleFunction<typeof parts> = () => {
  return {
    field: {
      textAlign: "left",
      borderColor: "gray.700",
      _hover: { borderColor: "gray.600" },
      _invalid: {
        borderColor: "#cc3a59 !important",
      },
      _focusVisible: {
        zIndex: 1,
        borderColor: "red.500",
        boxShadow: `0 0 0 1px #EF4444`,
      },
      _placeholder: { opacity: 0.8, fontSize: "16px !important" },
      _readOnly: {
        boxShadow: "none !important",
        borderColor: "none",
        userSelect: "all",
      },
    },
  }
}

const variantComplex: PartsStyleFunction<typeof parts> = () => {
  return {
    field: {
      textAlign: "right",
      borderColor: "gray.700",
      _hover: { borderColor: "gray.600" },
      _disabled: {
        opacity: 0.4,
        cursor: "not-allowed",
      },
      _invalid: {
        borderColor: "red.400 !important",
      },
      _focusVisible: {
        zIndex: 1,
        borderColor: "red.500",
        boxShadow: `0 0 0 1px #EF4444`,
      },
      _placeholder: { opacity: 0.8 },
      _readOnly: {
        boxShadow: "none !important",
        borderColor: "gray.700",
        userSelect: "all",
      },
    },
    element: {
      ml: "15px",
    },
  }
}

// The default `size` or `variant` values
const defaultProps: SystemStyleObject = {
  size: "lg",
  variant: "complex",
}

// record of different variants
const variants = {
  complex: variantComplex,
  simple: variantSimple,
}

export default { parts: parts.keys, baseStyle, variants, sizes, defaultProps }
