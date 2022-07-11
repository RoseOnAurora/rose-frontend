import { Box, Flex, Stack, Text, useColorModeValue } from "@chakra-ui/react"
import { ExchangeRateInfo, SwapRouteToken } from "../../types/swap"
import React, { ReactElement } from "react"
import { commify, formatBNToPercentString, formatBNToString } from "../../utils"
import { SWAP_TYPES } from "../../constants"
import SwapRoute from "./SwapRoute"
import { Zero } from "@ethersproject/constants"
import { useTranslation } from "react-i18next"

interface SwapInfoProps {
  exchangeRateInfo: ExchangeRateInfo
  swapType: SWAP_TYPES
  from: SwapRouteToken
  to: SwapRouteToken
}

const SwapInfo = ({
  exchangeRateInfo,
  swapType,
  from,
  to,
}: SwapInfoProps): ReactElement => {
  // hooks
  const { t } = useTranslation()
  const negPriceImpactColor = useColorModeValue("red.600", "red.400")
  const posPriceImpactColor = useColorModeValue("green.600", "green.400")

  // state
  const formattedExchangeRate = commify(
    formatBNToString(exchangeRateInfo.exchangeRate, 18, 6),
  )
  const formattedPriceImpact = commify(
    formatBNToPercentString(exchangeRateInfo.priceImpact, 18),
  )
  return (
    <Box bgColor="bgDark" w="full" borderRadius="8px" p="24px">
      <Stack spacing="10px">
        <Flex justifyContent="space-between" alignItems="center">
          <Text fontSize="14px" fontWeight={400} color="gray.300">
            {t("rate")} {exchangeRateInfo.pair}
          </Text>
          <Text fontSize="14px" fontWeight={700} color="gray.50">
            {formattedExchangeRate}
          </Text>
        </Flex>
        <Flex justifyContent="space-between" alignItems="center">
          <Text fontSize="14px" fontWeight={400} color="gray.300">
            {t("priceImpact")}
          </Text>
          <Text
            fontSize="14px"
            fontWeight={700}
            color={
              exchangeRateInfo.priceImpact.lt(Zero)
                ? negPriceImpactColor
                : exchangeRateInfo.priceImpact.gt(Zero)
                ? posPriceImpactColor
                : "gray.50"
            }
          >
            {formattedPriceImpact}
          </Text>
        </Flex>
        <Box mt="10px" py="5px">
          <SwapRoute swapType={swapType} from={from} to={to} />
        </Box>
      </Stack>
    </Box>
  )
}

export default SwapInfo
