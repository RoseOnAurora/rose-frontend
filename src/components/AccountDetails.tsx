import {
  Badge,
  Button,
  Flex,
  Grid,
  GridItem,
  IconButton,
  Stack,
  Text,
  Tooltip,
  useClipboard,
} from "@chakra-ui/react"
import { EthIcon, RoseIconSmall } from "../constants/icons"
import React, { ReactElement, useMemo } from "react"
import { commify, formatBNToString, getWeb3Connection } from "../utils"
import ChangeAccountButton from "./button/ChangeAccountButton"
import { Connector } from "@web3-react/types"
import { ExternalLinkIcon } from "@chakra-ui/icons"
import Identicon from "./Identicon"
import { Zero } from "@ethersproject/constants"
import { getEtherscanLink } from "../utils/getEtherscanLink"
import { shortenAddress } from "../utils/shortenAddress"
import { useRoseTokenBalances } from "../hooks/useTokenBalances"
import { useTranslation } from "react-i18next"
import { useWeb3React } from "@web3-react/core"

interface AccountDetailProps {
  onChangeWallet: () => void
  onSwitchChains: () => void
  deactivate: (c: Connector) => Promise<void>
}

export default function AccountDetail({
  onChangeWallet,
  onSwitchChains,
  deactivate,
}: AccountDetailProps): ReactElement {
  // hooks
  const { t } = useTranslation()
  const { account, connector } = useWeb3React()
  const tokenBalances = useRoseTokenBalances()

  const { hasCopied, onCopy } = useClipboard(account || "")

  // state
  const roseBalanceFmt = useMemo(
    () => commify(formatBNToString(tokenBalances?.ROSE || Zero, 18, 5)),
    [tokenBalances?.ROSE],
  )

  const ethBalanceFmt = useMemo(
    () => commify(formatBNToString(tokenBalances?.ETH || Zero, 18, 5)),
    [tokenBalances?.ETH],
  )

  const { name, Icon } = getWeb3Connection(connector)

  return (
    <Stack spacing="20px">
      <Grid
        alignItems="center"
        w="full"
        templateColumns="repeat(2, 1fr)"
        rowGap={1}
        columnGap={3}
        whiteSpace="nowrap"
      >
        <GridItem>
          <Flex gap={1} alignItems="center">
            <Text fontWeight={400} fontSize="12px" color="gray.400">
              {t("connectedWith")}&nbsp;
              {name || "Unknown Wallet"}
            </Text>
            {Icon && <Icon />}
          </Flex>
        </GridItem>
        <GridItem>
          <Text as="span" fontWeight={400} fontSize="12px" color="gray.400">
            {t("balance")}
          </Text>
        </GridItem>
        <GridItem alignSelf="start">
          <Stack spacing={0}>
            <Flex gap="8px" alignItems="center">
              <Identicon />
              <Flex gap="0px" alignItems="center">
                <Tooltip
                  closeOnClick={false}
                  label={hasCopied ? "Copied!" : "Copy Address"}
                >
                  <Badge
                    fontWeight={700}
                    w="fit-content"
                    h="fit-content"
                    fontSize="15px"
                    borderRadius="md"
                    cursor="copy"
                    colorScheme="red"
                    onClick={onCopy}
                  >
                    {account && shortenAddress(account)}
                  </Badge>
                </Tooltip>
                <IconButton
                  icon={<ExternalLinkIcon fontSize="15px" />}
                  aria-label="View on block explorer."
                  variant="unstyled"
                  display="flex"
                  alignItems="center"
                  size="sm"
                  isDisabled={!account}
                  as="a"
                  color="red.500"
                  _hover={{ color: "red.400" }}
                  transition="ease-in-out 0.1s"
                  href={account ? getEtherscanLink(account, "address") : "#"}
                  target="_blank"
                  rel="noreferrer"
                />
              </Flex>
            </Flex>
            <ChangeAccountButton
              _hover={{ color: "red.400", fill: "red.400" }}
              color="red.500"
              fill="red.500"
              fontWeight={700}
              fontSize={{ base: "11px", lg: "15px" }}
              pr={5}
              pb={2}
              transition="ease-in-out 0.1s"
              onClick={onChangeWallet}
            />
          </Stack>
        </GridItem>
        <GridItem>
          <Stack>
            <Flex alignItems="center" gap="5px">
              <RoseIconSmall />
              <Text
                as="span"
                fontWeight={700}
                fontSize={{ base: "12px", md: "17px" }}
                color="gray.50"
              >
                {roseBalanceFmt}
              </Text>
            </Flex>
            <Flex alignItems="center" gap={2}>
              <EthIcon fontSize="22px" />
              <Text
                as="span"
                fontWeight={700}
                fontSize={{ base: "12px", md: "17px" }}
                color="gray.50"
              >
                {ethBalanceFmt}
              </Text>
            </Flex>
          </Stack>
        </GridItem>
        <GridItem>
          <Button
            fontSize={{ base: "12px", lg: "15px" }}
            variant="ghost"
            onClick={onSwitchChains}
          >
            {t("Change Chains")}
          </Button>
        </GridItem>
        <GridItem>
          <Button
            fontSize={{ base: "12px", lg: "15px" }}
            variant="outline"
            onClick={() => deactivate(connector)}
          >
            {t("logout")}
          </Button>
        </GridItem>
      </Grid>
    </Stack>
  )
}
