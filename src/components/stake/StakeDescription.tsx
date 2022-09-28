import { Box, Center, Image, Text } from "@chakra-ui/react"
import React, { ReactElement } from "react"
import stakeDescriptionGraphic from "../../assets/stake-description-graphic.svg"
import { useTranslation } from "react-i18next"

const StakeDescription = (): ReactElement => {
  const { t } = useTranslation()
  return (
    <Center w="full" isolation="isolate" pos="relative">
      <Text
        zIndex={2}
        color="gray.200"
        fontWeight={500}
        fontSize="15px"
        lineHeight="23px"
        textAlign="center"
        p="15px"
        opacity={0.7}
      >
        {t("stakingInfo")}
      </Text>
      <Box pos="absolute" top="0px">
        <Image src={stakeDescriptionGraphic} />
      </Box>
    </Center>
  )
}

export default StakeDescription
