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
  const disableBg = transparentize("#cc3a59", 0.2)(props.theme)
  const boxShadowHover =
    props.colorMode === "light"
      ? "0px 7px 12px rgba(68, 64, 64, 0.3)"
      : "2px 2px 12px rgba(68, 64, 64, 0.14)"
  const disabled = {
    opacity: "0.8",
    color: transparentColor,
    border: "none",
    cursor: "not-allowed",
    boxShadow: "none",
    bg: disableBg,
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
      bg: "#d63255",
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
  const transparentColor = transparentize("gray.500", 0.6)(props.theme)
  const disableBg = transparentize("#cc3a59", 0.2)(props.theme)
  const boxShadowHover =
    props.colorMode === "light"
      ? "0px 7px 12px rgba(68, 64, 64, 0.3)"
      : "2px 2px 12px rgba(68, 64, 64, 0.14)"
  const disabled = {
    opacity: "1",
    color: transparentColor,
    border: "none",
    cursor: "not-allowed",
    boxShadow: "none",
    bg: disableBg,
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
    bg: "#cc3a59",
    _hover: {
      color: "#ffffff",
      bg: "#d63255",
      boxShadow: boxShadowHover,
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
