import {
  CSSWithMultiValues,
  RecursiveCSSObject,
} from "@chakra-ui/styled-system"

const variantPrimary = (): RecursiveCSSObject<CSSWithMultiValues> => {
  return {
    tab: {
      borderRadius: "full",
      fontWeight: "semibold",
      color: "grey",
      bg: "transparent",
      _selected: {
        color: "#000000",
        bg: "#d88394",
      },
      _active: {
        color: "#000000",
        bg: "#d88394",
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
