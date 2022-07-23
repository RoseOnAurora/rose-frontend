import { Flex, Grid, GridItem, IconButton, Stack, Text } from "@chakra-ui/react"
import React, { ReactElement } from "react"
import { commify, formatBNToString } from "../utils"
import ChangeAccountButton from "./button/ChangeAccountButton"
import CopyButton from "./button/CopyButton"
import { ExternalLinkIcon } from "@chakra-ui/icons"
import Identicon from "./Identicon"
import { RoseIconSmall } from "../constants/icons"
import { SUPPORTED_WALLETS } from "../constants"
import { Zero } from "@ethersproject/constants"
import { find } from "lodash"
import { getEtherscanLink } from "../utils/getEtherscanLink"
import { shortenAddress } from "../utils/shortenAddress"
import { useActiveWeb3React } from "../hooks"
import { useRoseTokenBalances } from "../hooks/useTokenBalances"
import { useTranslation } from "react-i18next"

interface AccountDetailProps {
  openOptions: () => void
}

export default function AccountDetail({
  openOptions,
}: AccountDetailProps): ReactElement {
  const { t } = useTranslation()
  const { account, connector } = useActiveWeb3React()
  const tokenBalances = useRoseTokenBalances()
  const roseBalanceFormatted = commify(
    formatBNToString(tokenBalances?.ROSE || Zero, 18, 5),
  )

  const { name, Icon } = find(SUPPORTED_WALLETS, ["connector", connector]) || {}

  return (
    <Stack spacing="20px">
      <Grid
        alignItems="center"
        w="full"
        templateColumns="repeat(2, 1fr)"
        rowGap={1}
        columnGap={6}
        whiteSpace="nowrap"
      >
        <GridItem>
          <Flex gap={1} alignItems="center">
            <Text fontWeight={400} fontSize="14px" color="gray.400">
              {t("connectedWith")}&nbsp;
              {name || "Unknown Wallet"}
            </Text>
            {Icon && <Icon />}
          </Flex>
        </GridItem>
        <GridItem>
          <Text as="span" fontWeight={400} fontSize="14px" color="gray.400">
            {t("balance")}
          </Text>
        </GridItem>
        <GridItem>
          <Flex gap="8px" alignItems="center">
            <Identicon />
            <Flex gap="0px" alignItems="center">
              <Text as="span" fontWeight={700} fontSize="17px" color="gray.50">
                {account && shortenAddress(account)}
              </Text>
              <IconButton
                icon={<ExternalLinkIcon fontSize="15px" />}
                aria-label="View on block explorer."
                variant="unstyled"
                display="flex"
                alignItems="center"
                size="sm"
                disabled={!account}
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
        </GridItem>
        <GridItem>
          <Flex alignItems="center" gap="5px">
            <RoseIconSmall />
            <Text
              as="span"
              fontWeight={700}
              fontSize={{ base: "14px", md: "17px" }}
              color="gray.50"
            >
              {roseBalanceFormatted}
            </Text>
          </Flex>
        </GridItem>
        <GridItem mt={2}>
          {account && (
            <CopyButton
              toCopy={account}
              disabled={!account}
              color="red.500"
              fontWeight={700}
              fontSize="15px"
              p="10px"
              variant="unstyled"
              display="flex"
              alignItems="center"
              buttonText={t("copyAddress")}
              transition="ease-in-out 0.1s"
              _hover={{ color: "red.400" }}
            />
          )}
        </GridItem>
        <GridItem
          mt={2}
          _hover={{ color: "red.400", fill: "red.400" }}
          color="red.500"
          fill="red.500"
        >
          <ChangeAccountButton
            color="inherit"
            fontWeight={700}
            fontSize="15px"
            p="10px"
            transition="ease-in-out 0.1s"
            onClick={openOptions}
          />
        </GridItem>
      </Grid>
    </Stack>
  )
}
