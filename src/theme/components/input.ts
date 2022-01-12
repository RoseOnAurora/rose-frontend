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
      bg: darkMode ? "rgb(28, 29, 33)" : "rgb(240, 231, 234)",
      _hover: {
        bg: darkMode ? "rgb(31, 32, 36)" : "rgb(244, 235, 239)",
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
const variants = {
  primary: variantPrimary,
}
export default { variants }
