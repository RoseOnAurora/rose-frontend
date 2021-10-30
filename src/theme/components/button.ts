import {
  CSSWithMultiValues,
  RecursiveCSSObject,
} from "@chakra-ui/styled-system"
import { Dict } from "@chakra-ui/utils"
import { transparentize } from "@chakra-ui/theme-tools"

const variantPrimary = (
  props: Dict,
): RecursiveCSSObject<CSSWithMultiValues> => {
  const transparentColor = transparentize("gray.500", 0.4)(props.theme)
  const disabled = {
    opacity: "1",
    color: transparentColor,
  }

  return {
    color: "white",
    bg: "red.700",
    _hover: {
      color: "white",
      bg: "red.600",
      _disabled: disabled,
    },
    _active: {
      color: "white",
      bg: "red.600",
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
