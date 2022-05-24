import { Flex, Image, Text } from "@chakra-ui/react"
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
    <Flex
      width={
        /rose-/.exec(icon || "")
          ? { base: "30px", md: "50px" }
          : /dai-usdt-usdc/.exec(icon)
          ? { base: "25px", md: "40px" }
          : { base: "15px", md: "30px" }
      }
    >
      <Image alt="icon" src={icon} w="100%" objectFit="cover" />
    </Flex>
  </Flex>
)

export default FormattedComponentName
