import { Box, Checkbox, HStack, Stack, Text } from "@chakra-ui/react"
import React, { ReactElement } from "react"
import { useTranslation } from "react-i18next"

interface Props {
  checked: boolean
  onCheck: () => void
}
export default function HighPriceImpactConfirmation({
  checked,
  onCheck,
}: Props): ReactElement {
  const { t } = useTranslation()
  return (
    <Box p="16px" bg="red.600" borderRadius="12px" color="white">
      <Stack>
        <Text>{t("highPriceImpactConfirmation")}</Text>
        <HStack spacing={2}>
          <Text as="span" fontSize="16px" fontWeight={700}>
            {t("iConfirm")}
          </Text>
          <Checkbox colorScheme="green" checked={checked} onChange={onCheck} />
        </HStack>
      </Stack>
    </Box>
  )
}
