import { Box, Flex, HStack, Image, Text } from "@chakra-ui/react"
import React, { ReactElement } from "react"
import { BigNumber } from "@ethersproject/bignumber"
import { BsExclamationCircle } from "react-icons/bs"
import bonusGift from "../../assets/bonus-gift.svg"
import { formatBNToPercentString } from "../../utils"
import { useTranslation } from "react-i18next"

interface BonusProps {
  amount: BigNumber
  decimals?: number
}

const Bonus = ({ amount, decimals }: BonusProps): ReactElement => {
  const { t } = useTranslation()
  const formattedAmount = formatBNToPercentString(amount, decimals || 18, 4)
  return (
    <Box p="16px" borderRadius="12px" bg="gray.800">
      <Flex justifyContent="space-between" alignItems="center">
        <HStack spacing="3px" alignItems="center">
          <Flex boxSize="25px" alignItems="center">
            {amount.gte(0) ? (
              <Image src={bonusGift} w="full" objectFit="cover" />
            ) : (
              <BsExclamationCircle color="#EF4444" size="20px" />
            )}
          </Flex>
          <Text color="gray.200" fontSize="14px" fontWeight={500}>
            {amount.gte(0) ? t("bonus") : t("priceImpact")}
          </Text>
        </HStack>
        <Text
          fontSize="14px"
          fontWeight={500}
          color={
            amount.gt(0) ? "green.500" : amount.lt(0) ? "red.500" : "gray.300"
          }
        >
          {formattedAmount}
        </Text>
      </Flex>
    </Box>
  )
}

export default Bonus
