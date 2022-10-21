import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
} from "@chakra-ui/react"
import { ChainId, DAI, RUSD, TOKENS_MAP, USDC, USDT } from "../../constants"
import React, { ReactElement, useMemo, useState } from "react"
import CommonSwapBases from "./CommonSwapBases"
import ModalWrapper from "../wrappers/ModalWrapper"
import { SearchIcon } from "@chakra-ui/icons"
import { SwapTokenOption } from "../../types/swap"
import TokenList from "../list/TokenList"
import { TokenOption } from "../../types/token"
import { isAddress } from "../../utils"
import { useTranslation } from "react-i18next"
import { useWeb3React } from "@web3-react/core"

interface SwapTokenSelectModalProps {
  tokens: SwapTokenOption[]
  isOpen: boolean
  onClose: () => void
  onSelectToken: (symbol: string | undefined) => void
}

const SwapTokenSelectModal = ({
  tokens,
  isOpen,
  onClose,
  onSelectToken,
}: SwapTokenSelectModalProps): ReactElement => {
  // hooks
  const { chainId } = useWeb3React()
  const { t } = useTranslation()

  // state
  const [selectedToken, setSelectedToken] = useState<string>()
  const [searchText, setSearchText] = useState<string>("")

  const filteredTokens: TokenOption[] = useMemo(() => {
    return tokens
      .filter(({ symbol, name, isAvailable }) => {
        const target = searchText.toLowerCase()
        // check availability first
        if (isAvailable) {
          // if target is address
          if (isAddress(target) && chainId) {
            return (
              TOKENS_MAP[symbol].addresses[chainId as ChainId].toLowerCase() ===
              target
            )
          }
          // otherwise its plain text
          return (
            symbol.toLowerCase().includes(target) ||
            name.toLowerCase().includes(target)
          )
        }
        return false
      })
      .map(({ name, symbol, icon, amount, valueUSD, decimals }) => ({
        name,
        symbol,
        icon,
        amount,
        amountUSD: valueUSD,
        decimals,
      }))
  }, [tokens, chainId, searchText])

  return (
    <ModalWrapper
      modalHeader={t("chooseToken")}
      isOpen={isOpen}
      onClose={onClose}
      onCloseComplete={() => {
        onSelectToken(selectedToken)
        setSearchText("")
        setSelectedToken("")
      }}
      isCentered
      preserveScrollBarGap
    >
      <Stack spacing="30px">
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.500" />
          </InputLeftElement>
          <Input
            value={searchText}
            variant="simple"
            fontSize={{ base: "14px", md: "16px" }}
            placeholder="Search name or paste address"
            type="text"
            onChange={(e) => setSearchText(e.target.value)}
          />
        </InputGroup>
        <CommonSwapBases
          commonBases={tokens.filter(
            ({ isAvailable, symbol }) =>
              isAvailable &&
              // hardcode for now until we can pull data
              (symbol === USDT.symbol ||
                symbol === RUSD.symbol ||
                symbol === DAI.symbol ||
                symbol === USDC.symbol),
          )}
          onSelect={(symbol: string) => {
            setSelectedToken(symbol)
            onClose()
          }}
        />
        <Box
          bgColor="bgDark"
          borderRadius="14px"
          p="8px"
          h="350px"
          overflowY="auto"
        >
          <Stack spacing="10px">
            <TokenList
              tokens={filteredTokens}
              onSelectToken={(symbol: string) => {
                setSelectedToken(symbol)
                onClose()
              }}
            />
          </Stack>
        </Box>
      </Stack>
    </ModalWrapper>
  )
}

export default SwapTokenSelectModal
