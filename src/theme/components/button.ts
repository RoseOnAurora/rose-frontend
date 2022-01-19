import {
  CSSWithMultiValues,
  RecursiveCSSObject,
} from "@chakra-ui/styled-system"
import { Dict } from "@chakra-ui/utils"
import { transparentize } from "@chakra-ui/theme-tools"

const variantPrimary = (
  props: Dict,
): RecursiveCSSObject<CSSWithMultiValues> => {
  const darkMode = props.colorMode === "dark"
  const transparentColor = transparentize(
    darkMode ? "gray.300" : "gray.100",
    0.7,
  )(props.theme)
  const disableBg = transparentize(
    darkMode ? "#1c1d21" : "#cc3a59",
    1,
  )(props.theme)
  const boxShadowHover = darkMode
    ? "2px 2px 12px rgba(68, 64, 64, 0.14)"
    : "0px 7px 12px rgba(68, 64, 64, 0.3)"
  const disabled = {
    color: transparentColor,
    border: "none",
    cursor: "not-allowed",
    boxShadow: "none",
    bg: disableBg,
  }

  return {
    color: darkMode ? "#000000" : "#ffffff",
    borderRadius: "10px",
    bg: darkMode
      ? "linear-gradient(95deg, #cc3a59, #791038)"
      : "linear-gradient(195deg, #f7819a, #cc3a59)",
    letterSpacing: "0.02em",
    fontWeight: "700",
    padding: "1px 6px",
    _hover: {
      color: "#ffffff",
      bg: "linear-gradient(195deg, #cc3a59, #d63255)",
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
  const darkMode = props.colorMode === "dark"
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
    color: darkMode ? "#000000" : "#ffffff",
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

const variantOuline = (props: Dict): RecursiveCSSObject<CSSWithMultiValues> => {
  const darkMode = props.colorMode === "dark"

  return {
    borderRadius: "10px",
    borderColor: darkMode
      ? "var(--chakra-colors-whiteAlpha-300)"
      : "var(--chakra-colors-blackAlpha-400)",
    _hover: {
      bg: darkMode
        ? "var(--chakra-colors-whiteAlpha-200)"
        : "var(--chakra-colors-whiteAlpha-500)",
    },
    _focus: {
      boxShadow: "none",
    },
    _active: {
      bg: darkMode
        ? "var(--chakra-colors-whiteAlpha-300)"
        : "var(--chakra-colors-whiteAlpha-600)",
    },
  }
}

const variants = {
  primary: variantPrimary,
  light: variantLight,
  outline: variantOuline,
}
export default { variants }
