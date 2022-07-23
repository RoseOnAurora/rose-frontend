import { Flex, Text } from "@chakra-ui/react"
import React, { ReactElement } from "react"
import { useTranslation } from "react-i18next"

interface MaxFromBalanceProps {
  max: string
  label?: string
  onClickMax: () => void
}

const MaxFromBalance = ({
  max,
  label,
  onClickMax,
}: MaxFromBalanceProps): ReactElement => {
  const { t } = useTranslation()
  return (
    <Flex gap="5px" alignItems="center">
      <Text
        fontSize="12px"
        fontWeight={400}
        lineHeight="16px"
        textTransform="uppercase"
        color="gray.300"
      >
        {label || t("balance")}:
      </Text>
      <Text
        fontSize="12px"
        fontWeight={700}
        lineHeight="12px"
        textTransform="uppercase"
        color="gray.200"
        cursor="pointer"
        onClick={onClickMax}
      >
        {max}
      </Text>
    </Flex>
  )
}

export default MaxFromBalance
