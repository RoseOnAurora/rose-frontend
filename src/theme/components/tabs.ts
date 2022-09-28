import {
  PartsStyleFunction,
  PartsStyleObject,
  SystemStyleObject,
} from "@chakra-ui/theme-tools"
import { tabsAnatomy as parts } from "@chakra-ui/anatomy"

// base styles every tab has
const baseStyle: PartsStyleObject<typeof parts> = {
  tab: {
    borderRadius: "40px",
    fontWeight: 700,
    fontSize: "16px",
    lineHeight: "21px",
    transitionDuration: "500ms",
  },
  tablist: {
    p: "8px",
    borderRadius: "40px",
  },
}

// Styles for the size variations
const sizes: Record<string, PartsStyleObject<typeof parts>> = {
  md: {
    tab: {
      fontSize: "14px",
      lineHeight: "16px",
      h: 12,
    },
  },
  lg: {
    tab: {
      fontSize: "18px",
      lineHeight: "21px",
      h: 14,
    },
  },
}

const variantPrimary: PartsStyleFunction<typeof parts> = () => {
  return {
    tab: {
      color: "gray.100",
      bg: "bgDark",
      _selected: {
        color: "white",
        bg: "linear-gradient(254.92deg, #F14226 21.22%, #FF6D40 78.77%)",
      },
      _active: {
        color: "white",
        bg: "linear-gradient(254.92deg, #F14226 21.22%, #FF6D40 78.77%)",
      },
      _focus: {
        boxShadow: "none",
      },
    },
    tablist: {
      bg: "bgDark",
    },
  }
}

// The default `size` or `variant` values
const defaultProps: SystemStyleObject = {
  size: "lg",
  variant: "primary",
}

const variants = {
  primary: variantPrimary,
}

export default { parts: parts.keys, baseStyle, variants, sizes, defaultProps }
