import {
  Flex,
  HStack,
  Image,
  Stack,
  Tag,
  Text,
  Tooltip,
} from "@chakra-ui/react"
import React, { ReactElement } from "react"
import { MdDoubleArrow } from "react-icons/md"
import { SWAP_TYPES } from "../../constants"
import { SwapRouteToken } from "../../types/swap"
import daiUsdtUsdc from "../../assets/icons/dai-usdt-usdc.svg"
import { useTranslation } from "react-i18next"

interface SwapRouteProps {
  swapType: SWAP_TYPES
  from: SwapRouteToken
  to: SwapRouteToken
}

const SwapRoute = ({ swapType, from, to }: SwapRouteProps): ReactElement => {
  const { t } = useTranslation()
  return (
    <Flex justifyContent="space-between" alignItems="start">
      <HStack spacing="3px" alignItems="center">
        <Tooltip
          closeOnClick={false}
          label={
            swapType === SWAP_TYPES.DIRECT
              ? "Swaps between tokens from the Stables Pool are referred to as direct swaps."
              : "MetaSwaps leverage the underlying base pool to perform the swap and MultiHop swaps are for swapping two metapool tokens that share the same base pool."
          }
        >
          <Text
            borderBottom="1px dotted"
            borderBottomColor="gray.300"
            cursor="help"
            fontSize="14px"
            fontWeight={700}
            color="gray.300"
          >
            {t("route")}
          </Text>
        </Tooltip>
        {swapType === SWAP_TYPES.STABLES_TO_META && (
          <Tag
            size="md"
            borderRadius="full"
            variant="outline"
            colorScheme="yellow"
            fontSize="11px"
          >
            MetaSwap
          </Tag>
        )}
        {swapType === SWAP_TYPES.META_TO_META && (
          <Tag
            size="md"
            borderRadius="full"
            variant="outline"
            colorScheme="red"
            fontSize="11px"
          >
            MultiHop
          </Tag>
        )}
        {swapType === SWAP_TYPES.DIRECT && (
          <Tag
            size="md"
            borderRadius="full"
            variant="outline"
            colorScheme="green"
            fontSize="11px"
          >
            Direct
          </Tag>
        )}
      </HStack>
      <HStack spacing="5px" alignItems="center">
        <Stack spacing="3px" alignItems="center">
          <Flex boxSize="25px" alignItems="center" justifyContent="center">
            <Image w="100%" src={from.icon} />
          </Flex>
          <Text fontSize="9px" color="gray.100">
            {from.symbol}
          </Text>
        </Stack>
        {swapType === SWAP_TYPES.META_TO_META ? (
          <Flex alignItems="center">
            <MdDoubleArrow color="#C3C6D5" />
            <Stack spacing="3px" alignItems="center">
              <Flex boxSize="25px" alignItems="center" justifyContent="center">
                <Image w="100%" src={daiUsdtUsdc} />
              </Flex>
              <Text fontSize="9px" color="gray.100">
                DAI/USDT/USDC
              </Text>
            </Stack>
            <MdDoubleArrow color="#C3C6D5" />
          </Flex>
        ) : (
          <MdDoubleArrow color="#C3C6D5" />
        )}
        <Stack spacing="3px" alignItems="center">
          <Flex boxSize="25px" alignItems="center" justifyContent="center">
            <Image w="100%" src={to.icon} />
          </Flex>
          <Text fontSize="9px" color="gray.100">
            {to.symbol}
          </Text>
        </Stack>
      </HStack>
    </Flex>
  )
}

export default SwapRoute
