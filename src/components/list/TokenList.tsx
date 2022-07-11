import { AnimatePresence, motion } from "framer-motion"
import { Box, Flex, Image, Text } from "@chakra-ui/react"
import React, { ReactElement, memo, useEffect, useRef } from "react"
import { commify, formatBNToString } from "../../utils"
import { TokenOption } from "../../types/token"

interface TokenListProps {
  tokens: TokenOption[]
  onSelectToken: (symbol: string) => void
}

interface TokenListItem {
  token: TokenOption
  onSelectToken: (symbol: string) => void
}

const TokenList = ({ tokens, onSelectToken }: TokenListProps): ReactElement => {
  return (
    <AnimatePresence initial={false}>
      {tokens.map((token) => (
        <TokenListItem
          key={token.symbol}
          token={token}
          onSelectToken={onSelectToken}
        />
      ))}
    </AnimatePresence>
  )
}

const TokenListItem = memo(
  ({ token, onSelectToken }: TokenListItem): ReactElement => {
    const prevNameRef = useRef<string>()
    const MotionDiv = motion(Box)

    useEffect(() => {
      prevNameRef.current = token.name
    }, [token.name])

    return (
      <MotionDiv
        bgColor="transparent"
        border="none"
        p="12px"
        borderRadius="12px"
        whileHover={{ backgroundColor: "#1A1B23" }}
        cursor="pointer"
        initial={
          prevNameRef.current === token.name
            ? { opacity: 1, scale: 1 }
            : { opacity: 0, scale: 0.85 }
        }
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ease: "easeOut", duration: "0.4" }}
        exit={{ opacity: 0, scale: 1 }}
        layout
        onClick={() => {
          onSelectToken(token.symbol)
        }}
      >
        <Flex justifyContent="space-between" alignItems="center">
          <Flex alignItems="center" gap="5px">
            <Box boxSize="24px">
              <Image src={token.icon} objectFit="cover" w="full" />
            </Box>
            <Flex alignItems="center" gap="3px">
              <Text fontSize="16px" fontWeight={500} color="gray.50">
                {token.symbol}
              </Text>
              <Text fontSize="14px" fontWeight={700} color="gray.300">
                {token.name}
              </Text>
            </Flex>
          </Flex>
          <Flex alignItems="center" gap="7px">
            <Text fontSize="13px" fontWeight={700} color="gray.100">
              {formatBNToString(token.amount, token.decimals || 18, 5)}
            </Text>
            <Text fontSize="12px" fontWeight={400} color="gray.200">
              ≈${commify(formatBNToString(token.amountUSD, 18, 2))}
            </Text>
          </Flex>
        </Flex>
      </MotionDiv>
    )
  },
  (prev, next) => prev.token === next.token,
)

TokenListItem.displayName = "TokenListItem"

export default TokenList
