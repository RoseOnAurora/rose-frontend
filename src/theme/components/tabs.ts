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
        color: "white",
        bg: "red.700",
      },
      _active: {
        color: "white",
        bg: "red.700",
      },
    },
  }
}
const variants = {
  primary: variantPrimary,
}
export default { variants }
