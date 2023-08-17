import { Box, Flex, Image, Text } from "@chakra-ui/react"
import React, { ReactElement } from "react"
import { ChevronDownIcon } from "@chakra-ui/icons"
import { Token } from "../../constants"
import { useTranslation } from "react-i18next"

interface MultiTokenInputLeftElementProps {
  selectedToken?: Token
  onToggleTokenSelect: () => void
}

const MultiTokenInputLeftElement = ({
  selectedToken,
  onToggleTokenSelect,
}: MultiTokenInputLeftElementProps): ReactElement => {
  const { t } = useTranslation()
  return (
    <Flex
      alignItems="center"
      gap="6px"
      cursor="pointer"
      onClick={onToggleTokenSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onToggleTokenSelect()
        }
      }}
    >
      {selectedToken && (
        <Box boxSize="24px">
          <Image src={selectedToken.icon} objectFit="cover" w="full" />
        </Box>
      )}
      <Flex alignItems="center" gap="3px">
        <Text fontSize="16px" fontWeight={500} color="gray.50">
          {selectedToken ? selectedToken.symbol : t("chooseToken")}
        </Text>
        {selectedToken && (
          <Text fontSize="12px" fontWeight={700} color="gray.500">
            {selectedToken.name}
          </Text>
        )}
        <ChevronDownIcon ml="3px" color="gray.500" />
      </Flex>
    </Flex>
  )
}

export default MultiTokenInputLeftElement
