import { Flex, Image, Text } from "@chakra-ui/react"
import React, { ReactElement } from "react"

interface Props {
  name: string
  icon: string
}

const FormattedComponentName = ({ name, icon }: Props): ReactElement => (
  <Flex gridGap="3px" alignItems="center" flexWrap="wrap">
    <Flex
      width={
        /rose-|dai-usdt-usdc/.exec(icon || "")
          ? { base: "45px", md: "55px" }
          : { base: "20px", md: "30px" }
      }
    >
      <Image alt="icon" src={icon} w="100%" objectFit="cover" />
    </Flex>
    <Text fontWeight="600" fontSize={{ base: "14px", md: "16px" }}>
      {name}
    </Text>
  </Flex>
)

export default FormattedComponentName
