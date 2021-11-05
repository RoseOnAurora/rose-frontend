import {
  CSSWithMultiValues,
  RecursiveCSSObject,
} from "@chakra-ui/styled-system"
import { Dict } from "@chakra-ui/utils"
import { transparentize } from "@chakra-ui/theme-tools"

const variantPrimary = (
  props: Dict,
): RecursiveCSSObject<CSSWithMultiValues> => {
  const transparentColor = transparentize("gray.500", 0.5)(props.theme)
  const disabled = {
    opacity: "1",
    color: transparentColor,
    cursor: "not-allowed",
    boxShadow: "none",
  }

  return {
    color: "#000000",
    borderRadius: "4px",
    bg: "#cc3a59",
    letterSpacing: "0.02em",
    fontWeight: "700",
    padding: "1px 6px",
    _hover: {
      color: "#ffffff",
      bg: "#881f36",
      boxShadow: "2px 2px 12px rgba(68, 64, 64, 0.2)",
      _disabled: disabled,
    },
    _active: {
      color: "#ffffff",
      bg: "#881f36",
    },
    _disabled: disabled,
  }
}

const variantLight = (props: Dict): RecursiveCSSObject<CSSWithMultiValues> => {
  const transparentColor = transparentize("gray.500", 0.4)(props.theme)
  const disabled = {
    opacity: "1",
    color: transparentColor,
  }
  return {
    color: "red.700",
    borderRadius: "1em",
    fontSize: "13px",
    border: "2px",
    borderColor: "red.700",
    bg: "red.50",
    _hover: {
      color: "red.700",
      bg: "red.100",
      _disabled: disabled,
    },
    _disabled: disabled,
  }
}

const variants = {
  primary: variantPrimary,
  light: variantLight,
}
export default { variants }
