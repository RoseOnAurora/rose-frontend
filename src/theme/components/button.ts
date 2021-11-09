import {
  CSSWithMultiValues,
  RecursiveCSSObject,
} from "@chakra-ui/styled-system"
import { Dict } from "@chakra-ui/utils"
import { transparentize } from "@chakra-ui/theme-tools"

const variantPrimary = (
  props: Dict,
): RecursiveCSSObject<CSSWithMultiValues> => {
  const transparentColor = transparentize("gray.500", 0.6)(props.theme)
  const disableBg =
    props.colorMode === "light" ? "rgb(243, 226, 217)" : "gray.900"
  const disableShadow =
    props.colorMode === "light"
      ? "0px 3px 3px #0000000a"
      : "0px 7px 10px rgba(39, 14, 1, 0.2)"
  const boxShadowHover =
    props.colorMode === "light"
      ? "0px 7px 12px rgba(68, 64, 64, 0.3)"
      : "2px 2px 12px rgba(68, 64, 64, 0.14)"
  const disabled = {
    opacity: "1",
    color: transparentColor,
    border: "none",
    cursor: "not-allowed",
    boxShadow: disableShadow,
    bg: disableBg,
  }

  return {
    color: "#000000",
    borderRadius: "4px",
    bg: "#b13550",
    letterSpacing: "0.02em",
    fontWeight: "700",
    padding: "1px 6px",
    _hover: {
      color: "#ffffff",
      bg: "#cc3a59",
      boxShadow: boxShadowHover,
      _disabled: disabled,
    },
    _active: {
      color: "#ffffff",
      bg: "#cc3a59",
    },
    _disabled: disabled,
    _focus: {
      boxShadow: "none",
    },
  }
}

const variantLight = (props: Dict): RecursiveCSSObject<CSSWithMultiValues> => {
  const transparentColor = transparentize("gray.500", 0.4)(props.theme)
  const disabled = {
    opacity: "1",
    color: transparentColor,
  }
  return {
    color: "#000000",
    borderRadius: "full",
    fontSize: "13px",
    width: "75px",
    letterSpacing: "0.02em",
    fontWeight: "700",
    padding: "1px 6px",
    border: "none",
    bg: "#d88394",
    _hover: {
      color: "#ffffff",
      bg: "#d88394",
      boxShadow: "2px 2px 12px rgba(68, 64, 64, 0.2)",
      _disabled: disabled,
    },
    _disabled: disabled,
    _focus: {
      boxShadow: "none",
    },
  }
}

const variants = {
  primary: variantPrimary,
  light: variantLight,
}
export default { variants }
