import {
  Button,
  Flex,
  Grid,
  GridItem,
  IconButton,
  Stack,
  Text,
} from "@chakra-ui/react"
import React, { ReactElement } from "react"
import { commify, formatBNToString, getWeb3Connection } from "../utils"
import ChangeAccountButton from "./button/ChangeAccountButton"
import { Connector } from "@web3-react/types"
import CopyButton from "./button/CopyButton"
import { ExternalLinkIcon } from "@chakra-ui/icons"
import Identicon from "./Identicon"
import { RoseIconSmall } from "../constants/icons"
import { Zero } from "@ethersproject/constants"
import { getEtherscanLink } from "../utils/getEtherscanLink"
import { shortenAddress } from "../utils/shortenAddress"
import { useRoseTokenBalances } from "../hooks/useTokenBalances"
import useSwitchAccounts from "../hooks/useSwitchAccount"
import { useTranslation } from "react-i18next"
import { useWeb3React } from "@web3-react/core"

interface AccountDetailProps {
  openOptions: () => void
  deactivate: (c: Connector) => Promise<void>
}

export default function AccountDetail({
  openOptions,
  deactivate,
}: AccountDetailProps): ReactElement {
  // hooks
  const { t } = useTranslation()
  const { account, connector } = useWeb3React()
  const tokenBalances = useRoseTokenBalances()
  const switchAccounts = useSwitchAccounts()

  // state
  const roseBalanceFormatted = commify(
    formatBNToString(tokenBalances?.ROSE || Zero, 18, 5),
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
        <GridItem>
          <Flex gap="8px" alignItems="center">
            <Identicon />
            <Flex gap="0px" alignItems="center">
              <Text as="span" fontWeight={700} fontSize="15px" color="gray.50">
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
              fontSize={{ base: "12px", md: "17px" }}
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
              fontSize={{ base: "11px", lg: "15px" }}
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
            fontSize={{ base: "11px", lg: "15px" }}
            p="10px"
            transition="ease-in-out 0.1s"
            onClick={openOptions}
          />
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
        <GridItem>
          <Button
            fontSize={{ base: "12px", lg: "15px" }}
            variant="ghost"
            onClick={switchAccounts}
          >
            {t("switchAccounts")}
          </Button>
        </GridItem>
      </Grid>
    </Stack>
  )
}
