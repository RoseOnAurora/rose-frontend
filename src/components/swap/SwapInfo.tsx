import {
  Box,
  Flex,
  Skeleton,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react"
import { ExchangeRateInfo, SwapRouteToken } from "../../types/swap"
import React, { memo } from "react"
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
  loading?: boolean
}

const SwapInfo = memo(
  ({ exchangeRateInfo, swapType, from, to, loading }: SwapInfoProps) => {
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
            <Skeleton
              startColor="gray.500"
              endColor="gray.800"
              height="20px"
              maxW="100px"
              w="full"
              fadeDuration={1}
              isLoaded={!loading}
            >
              <Box textAlign="right">
                <Text fontSize="14px" fontWeight={700} color="gray.50">
                  {formattedExchangeRate}
                </Text>
              </Box>
            </Skeleton>
          </Flex>
          <Flex justifyContent="space-between" alignItems="center">
            <Text fontSize="14px" fontWeight={400} color="gray.300">
              {t("priceImpact")}
            </Text>
            <Skeleton
              startColor="gray.500"
              endColor="gray.800"
              height="20px"
              maxW="100px"
              w="full"
              fadeDuration={1}
              isLoaded={!loading}
            >
              <Box textAlign="right">
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
              </Box>
            </Skeleton>
          </Flex>
          <Box mt="10px" py="5px">
            <SwapRoute swapType={swapType} from={from} to={to} />
          </Box>
        </Stack>
      </Box>
    )
  },
  (prev, next) =>
    prev.exchangeRateInfo.exchangeRate.eq(next.exchangeRateInfo.exchangeRate) &&
    prev.exchangeRateInfo.priceImpact.eq(next.exchangeRateInfo.priceImpact) &&
    prev.from.symbol === next.from.symbol &&
    prev.to.symbol === next.to.symbol &&
    prev.swapType === next.swapType &&
    prev.loading === next.loading,
)

SwapInfo.displayName = "SwapInfo"

export default SwapInfo
