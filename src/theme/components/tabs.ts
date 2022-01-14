import {
  CSSWithMultiValues,
  RecursiveCSSObject,
} from "@chakra-ui/styled-system"
import { Dict } from "@chakra-ui/utils"

const variantPrimary = (
  props: Dict,
): RecursiveCSSObject<CSSWithMultiValues> => {
  const darkMode = props.colorMode === "dark"
  return {
    tab: {
      borderRadius: "full",
      fontWeight: "semibold",
      color: "grey",
      bg: darkMode ? "rgba(28, 29, 33, 0.4)" : "rgba(245, 239, 239, 0.8)",
      _selected: {
        color: darkMode ? "#000000" : "#ffffff",
        bg: darkMode
          ? "linear-gradient(95deg, #cc3a59, #791038)"
          : "linear-gradient(195deg, #f7819a, #cc3a59)",
      },
      _active: {
        color: darkMode ? "#000000" : "#ffffff",
        bg: darkMode
          ? "linear-gradient(95deg, #cc3a59, #791038)"
          : "linear-gradient(195deg, #f7819a, #cc3a59)",
      },
      _focus: {
        boxShadow: "none",
      },
    },
  }
}
const variants = {
  primary: variantPrimary,
}
export default { variants }
