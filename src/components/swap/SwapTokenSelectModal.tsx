import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
} from "@chakra-ui/react"
import { DAI, RUSD, TOKENS_MAP, USDC, USDT } from "../../constants"
import React, { ReactElement, useMemo, useState } from "react"
import CommonSwapBases from "./CommonSwapBases"
import { SearchIcon } from "@chakra-ui/icons"
import { SwapTokenOption } from "../../types/swap"
import TokenList from "../list/TokenList"
import { TokenOption } from "../../types/token"
import { isAddress } from "../../utils"
import { useActiveWeb3React } from "../../hooks"
import { useTranslation } from "react-i18next"

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
  const { chainId } = useActiveWeb3React()
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
              TOKENS_MAP[symbol].addresses[chainId].toLowerCase() === target
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
  }, [tokens, searchText])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onCloseComplete={() => {
        onSelectToken(selectedToken)
        setSearchText("")
        setSelectedToken("")
      }}
    >
      <ModalOverlay bg="blackAlpha.800" />
      <ModalContent bg="gray.900" borderRadius="20px" my="4.5rem" p="25px">
        <ModalHeader fontWeight={700} fontSize="30px" lineHeight="39px" p="0">
          {t("chooseToken")}
        </ModalHeader>
        <ModalCloseButton top={7} />
        <ModalBody p="0" mt="30px">
          <Stack spacing="30px">
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.500" />
              </InputLeftElement>
              <Input
                value={searchText}
                variant="simple"
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
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default SwapTokenSelectModal
