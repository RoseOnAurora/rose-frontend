import { Box, Flex, Text } from "@chakra-ui/react"
import React, { ReactElement } from "react"

interface Props {
  name: string
  icon: string
}

const FormattedComponentName = ({ name, icon }: Props): ReactElement => (
  <Flex gridGap="5px" alignItems="center" mt="0 !important" flexWrap="wrap">
    <Text fontWeight="600" fontSize={{ base: "13px", md: "16px" }}>
      {name}
    </Text>
    <Box
      width={
        /rose-/.exec(icon || "")
          ? { base: "30px", md: "50px" }
          : /dai-usdt-usdc/.exec(icon)
          ? { base: "25px", md: "40px" }
          : { base: "15px", md: "30px" }
      }
    >
      <img alt="icon" src={icon} width="100%" />
    </Box>
  </Flex>
)

export default FormattedComponentName
