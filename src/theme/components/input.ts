import {
  CSSWithMultiValues,
  RecursiveCSSObject,
} from "@chakra-ui/styled-system"

const variantPrimary = (): RecursiveCSSObject<CSSWithMultiValues> => {
  return {
    field: {
      borderBottom: "2px solid",
      borderColor: "red.700",
      borderRadius: 0,
      px: 0,
      bg: "transparent",
      _readOnly: {
        boxShadow: "none !important",
        userSelect: "all",
      },
      _invalid: {
        borderColor: "red.300",
        boxShadow: `0px 1px 0px 0px red`,
      },
      _focus: {
        borderColor: "red",
        boxShadow: "0px 1px 0px 0px red",
      },
    },
  }
}
const variants = {
  primary: variantPrimary,
}
export default { variants }
