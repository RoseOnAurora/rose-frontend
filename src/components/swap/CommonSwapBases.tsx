import { Box, Flex, Image, Stack, Text } from "@chakra-ui/react"
import React, { ReactElement } from "react"
import { SwapTokenOption } from "../../types/swap"
import { useTranslation } from "react-i18next"

interface CommonSwapBasesProps {
  commonBases: SwapTokenOption[]
  onSelect: (symbol: string) => void
}

const CommonSwapBases = ({
  commonBases,
  onSelect,
}: CommonSwapBasesProps): ReactElement => {
  const { t } = useTranslation()
  return (
    <Stack spacing="7px">
      <Text fontWeight={400} color="gray.300" fontSize="14px" lineHeight="18px">
        {t("commonBases")}
      </Text>
      <Box bgColor="bgDark" p="8px" borderRadius="12px">
        <Flex alignItems="center" justifyContent="center">
          {commonBases.map((base) => (
            <Box
              key={base.symbol}
              p="12px"
              borderRadius="12px"
              border="none"
              transition="ease-in-out 0.3s"
              _hover={{ bgColor: "gray.900" }}
              cursor="pointer"
              onClick={() => onSelect(base.symbol)}
            >
              <Flex alignItems="center" gap="3px">
                <Box boxSize="25px">
                  <Image src={base.icon} w="full" objectFit="cover" />
                </Box>
                <Text
                  fontSize={{ base: "14px", md: "16px" }}
                  fontWeight={500}
                  color="gray.50"
                  lineHeight="21px"
                >
                  {base.symbol}
                </Text>
              </Flex>
            </Box>
          ))}
        </Flex>
      </Box>
    </Stack>
  )
}

export default CommonSwapBases
