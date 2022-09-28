import { SystemStyleFunction } from "@chakra-ui/theme-tools"
import { SystemStyleObject } from "@chakra-ui/styled-system"

// base style every button has
const baseStyle: SystemStyleObject = {
  borderRadius: "12px",
  fontWeight: 700,
  border: "none",
  _focus: {
    boxShadow: "none",
  },
  display: "flex",
  alignItems: "center",
}

// Styles for the visual style variations
const variantPrimary: SystemStyleFunction = (props) => {
  const darkMode = props.colorMode === "dark"
  const disabled = {
    color: "gray.300",
    cursor: "not-allowed",
    boxShadow: "none",
    bg: "gray.800",
  }

  return {
    color: "#FFFFFF",
    boxShadow: "0px 10px 40px rgba(220, 51, 24, 0.5)",
    transition: "ease-out 0.5s",
    bg: darkMode
      ? "linear-gradient(254.92deg, #F14226 21.22%, #FF6D40 78.77%)"
      : "linear-gradient(254.92deg, #F14226 21.22%, #FF6D40 78.77%)",
    _hover: {
      bg: "linear-gradient(254.92deg, #CF2F17 21.22%, #FF480F 78.77%)",
      boxShadow: "0px 0px 16px rgba(220, 51, 24, 0.5)",
      _disabled: disabled,
    },
    _active: {
      bg: "linear-gradient(254.92deg, #CF2F17 21.22%, #FF480F 78.77%)",
    },
    _disabled: disabled,
  }
}

const variantSolid: SystemStyleFunction = (props) => {
  const darkMode = props.colorMode === "dark"
  const disabled = {
    color: "gray.300",
    cursor: "not-allowed",
    boxShadow: "none",
    bg: "gray.800",
  }

  return {
    color: "gray.200",
    transition: "ease-out 0.5s",
    borderRadius: "32px",
    bg: darkMode ? "gray.800" : "gray.800",
    _hover: {
      bg: "gray.700",
      _disabled: disabled,
    },
    _active: {
      bg: "gray.800",
    },
    _disabled: disabled,
  }
}

const variantOutline: SystemStyleFunction = () => {
  const disabled = {
    color: "gray.300",
    cursor: "not-allowed",
    boxShadow: "none",
    bg: "gray.900",
  }

  return {
    color: "white",
    transition: "ease-out 0.5s",
    borderRadius: "38px",
    border: "1px",
    borderColor: "gray.700",
    bg: "transparent",
    _hover: {
      bg: "blackAlpha.100",
      _disabled: disabled,
    },
    _active: {
      bg: "gray.800",
    },
    _disabled: disabled,
  }
}

// Styles for the size variations
const sizes: Record<string, SystemStyleObject> = {
  md: {
    fontSize: "14px",
    lineHeight: "18px",
    padding: "10px 16px 10px 16px",
  },
  lg: {
    fontSize: "16px",
    lineHeight: "21px",
    padding: "14px 24px 14px 24px",
  },
}

// record of different variants
const variants: Record<string, SystemStyleFunction> = {
  primary: variantPrimary,
  solid: variantSolid,
  outline: variantOutline,
}

// The default `size` or `variant` values
const defaultProps: SystemStyleObject = {
  size: "lg",
  variant: "primary",
}

export default { baseStyle, variants, sizes, defaultProps }
