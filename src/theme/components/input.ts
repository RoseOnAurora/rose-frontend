import {
  CSSWithMultiValues,
  RecursiveCSSObject,
} from "@chakra-ui/styled-system"
import { Dict } from "@chakra-ui/utils"

const variantPrimary = (
  props: Dict,
): RecursiveCSSObject<CSSWithMultiValues> => {
  const hasErrorColor = props.isInvalid ? "#cc3a59" : "#4BB543"
  const darkMode = props.colorMode === "dark"
  return {
    field: {
      borderBottom: "2px solid",
      borderColor: hasErrorColor,
      borderRadius: "10px",
      px: 0,
      bg: darkMode ? "rgb(28, 29, 33)" : "rgb(248, 248, 248)",
      _hover: {
        bg: darkMode ? "rgb(31, 32, 36)" : "rgb(245, 245, 245)",
      },
      _readOnly: {
        boxShadow: "none !important",
        userSelect: "all",
      },
      _invalid: {
        borderColor: "#cc3a59 !important",
        boxShadow: `0px 1px 0px 0px #cc3a59`,
      },
      _focus: {
        borderColor: hasErrorColor,
        boxShadow: `0px 1px 0px 0px ${hasErrorColor}`,
      },
    },
  }
}

const variantOuline = (props: Dict): RecursiveCSSObject<CSSWithMultiValues> => {
  const darkMode = props.colorMode === "dark"

  return {
    field: {
      borderColor: darkMode ? "var(--chakra-colors-whiteAlpha-300)" : "#555555",
      _focus: {
        boxShadow: "none",
        borderColor: darkMode ? "#cc3a59" : "#881f36",
      },
      _hover: {
        borderColor: darkMode ? "var(--chakra-colors-whiteAlpha-400)" : "#000",
      },
    },
  }
}

const variants = {
  primary: variantPrimary,
  outline: variantOuline,
}
export default { variants }
