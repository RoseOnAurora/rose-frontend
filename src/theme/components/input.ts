import {
  CSSWithMultiValues,
  RecursiveCSSObject,
} from "@chakra-ui/styled-system"
import { Dict } from "@chakra-ui/utils"

const variantPrimary = (
  props: Dict,
): RecursiveCSSObject<CSSWithMultiValues> => {
  const hasErrorColor = props.isInvalid ? "red" : "green"
  return {
    field: {
      borderBottom: "2px solid",
      borderColor: "green.700",
      borderRadius: 0,
      px: 0,
      bg: "transparent",
      _readOnly: {
        boxShadow: "none !important",
        userSelect: "all",
      },
      _invalid: {
        borderColor: "red.300 !important",
        boxShadow: `0px 1px 0px 0px red`,
      },
      _focus: {
        borderColor: hasErrorColor,
        boxShadow: "0px 1px 0px 0px green",
      },
    },
  }
}
const variants = {
  primary: variantPrimary,
}
export default { variants }
