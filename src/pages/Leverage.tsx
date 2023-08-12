/* eslint @typescript-eslint/no-floating-promises: 0 */
import * as _ from "lodash"
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  Heading,
  Skeleton,
  Stack,
  Tag,
  Text,
  Tooltip,
} from "@chakra-ui/react"
import React, { ReactElement, useMemo, useState } from "react"
import { commify, formatBNToString } from "../utils"
import useChakraToast, { TransactionType } from "../hooks/useChakraToast"
import { AppState } from "../state"
import BlockExplorerLink from "../components/BlockExplorerLink"
import { ETH } from "../constants"
import PageWrapper from "../components/wrappers/PageWrapper"
import SingleTokenInput from "../components/input/SingleTokenInput"
import { Zero } from "@ethersproject/constants"
import { basicTokenInputValidator } from "../utils/validators"
import moment from "moment"
import parseStringToBigNumber from "../utils/parseStringToBigNumber"
import { shortenAddress } from "../utils/shortenAddress"
import useCreateCloneAndEnterPos from "../hooks/useCreateCloneAndEnterPosition"
import useEarnExitPosition from "../hooks/useEarnExitPosition"
import useGetEarnPositionData from "../hooks/useGetEarnPositionData"
import { useRoseTokenBalances } from "../hooks/useTokenBalances"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

const Leverage = (): ReactElement => {
  const [deposit, setDeposit] = useState("")
  const { tokenPricesUSD } = useSelector((state: AppState) => state.application)

  const { t } = useTranslation()
  const toast = useChakraToast()

  const {
    isLoading: posDataIsLoading,
    data,
    seed,
    refetch,
  } = useGetEarnPositionData()

  const { isLoading, createCloneAndEnterPos } = useCreateCloneAndEnterPos({
    onSuccess: (receipt) => {
      const description = receipt?.transactionHash ? (
        <BlockExplorerLink
          txnType={TransactionType.DEPOSIT}
          txnHash={receipt.transactionHash}
          status={receipt?.status ? "Succeeded" : "Failed"}
        />
      ) : null
      toast.transactionSuccess({
        txnType: TransactionType.DEPOSIT,
        description,
      })
      setDeposit("")
      refetch()
    },
    onError: (error) =>
      toast.transactionFailed({ txnType: TransactionType.DEPOSIT, error }),
  })

  const { exitPosition, isLoading: exitPosIsLoading } = useEarnExitPosition({
    onSuccess: (receipt) => {
      const description = receipt?.transactionHash ? (
        <BlockExplorerLink
          txnType={TransactionType.WITHDRAW}
          txnHash={receipt.transactionHash}
          status={receipt?.status ? "Succeeded" : "Failed"}
        />
      ) : null
      toast.transactionSuccess({
        txnType: TransactionType.WITHDRAW,
        description,
      })
      refetch()
    },
    onError: (error) =>
      toast.transactionFailed({ txnType: TransactionType.WITHDRAW, error }),
  })

  const tokenBalances = useRoseTokenBalances()

  const ethBalance = useMemo(
    () => tokenBalances?.ETH || Zero,
    [tokenBalances?.ETH],
  )

  const ethBalanceFmt = useMemo(
    () => commify(formatBNToString(ethBalance, 18, 5)),
    [ethBalance],
  )

  const error = useMemo(
    () => basicTokenInputValidator(deposit, 18, ethBalance),
    [deposit, ethBalance],
  )

  const depositToUSD = useMemo(
    () => `$${((tokenPricesUSD?.ETH || 0) * +deposit).toFixed(2)}`,
    [deposit, tokenPricesUSD?.ETH],
  )

  return (
    <PageWrapper>
      <Box
        maxW="525px"
        w="full"
        p="30px"
        bg="gray.900"
        borderRadius="20px"
        isolation="isolate"
        mx="auto"
      >
        <Stack spacing="30px">
          <Flex w="full" justifyContent="space-between" alignItems="center">
            <Flex gap={2}>
              <Heading
                textTransform="capitalize"
                fontWeight={700}
                fontSize="30px"
                lineHeight="35px"
              >
                {t("earn")}
              </Heading>
              <Tooltip label="RoseV2 Beta Release">
                <Badge
                  cursor="help"
                  h="fit-content"
                  maxW="fit-content"
                  colorScheme="pink"
                >
                  beta
                </Badge>
              </Tooltip>
            </Flex>
            <Tooltip label="Targets an estimated 10% APY">
              <Tag size="lg" colorScheme="blue" cursor="help">
                10% FIXED APY
              </Tag>
            </Tooltip>
          </Flex>
          <Text color="gray.300">
            Earn a fixed 10% APY on your ETH deposit. Withdraw and exit any of
            your positions at any time. Be aware that each new deposit will
            create a new position.
          </Text>
          <Divider />
          <Stack spacing={1}>
            <Flex justifyContent="space-between" alignItems="center" w="full">
              <Text
                fontSize="12px"
                fontWeight={700}
                lineHeight="14px"
                textTransform="uppercase"
                color="gray.100"
              >
                {t("deposit")}
              </Text>
              <Flex gap="5px" alignItems="center">
                <Text
                  fontSize="12px"
                  fontWeight={400}
                  lineHeight="16px"
                  textTransform="uppercase"
                  color="gray.300"
                >
                  {t("balance")}:
                </Text>
                <Text
                  fontSize="12px"
                  fontWeight={700}
                  lineHeight="12px"
                  textTransform="uppercase"
                  color="gray.200"
                  cursor="pointer"
                  onClick={() => setDeposit(formatBNToString(ethBalance, 18))}
                >
                  {ethBalanceFmt}
                </Text>
              </Flex>
            </Flex>
            <FormControl isInvalid={!!error}>
              <SingleTokenInput
                token={ETH}
                inputValue={deposit}
                onChangeInput={(e) => setDeposit(e.target.value)}
              />
              <FormErrorMessage>{error}</FormErrorMessage>
              {deposit && !error && (
                <FormHelperText>
                  You are about to deposit {deposit} ETH (~{depositToUSD})
                </FormHelperText>
              )}
            </FormControl>
          </Stack>
          <Skeleton isLoaded={!posDataIsLoading} fadeDuration={1}>
            <Box
              bgColor="bgDark"
              w="full"
              borderRadius="8px"
              p="15px"
              maxH="400px"
            >
              <Stack>
                <Text color="gray.200">{data.length} Total Positions</Text>
                <Accordion maxH="350px" overflowY="auto" allowToggle>
                  {_.sortBy(data, ({ isClosed }) => isClosed).map(
                    ({
                      address,
                      openTimestamp,
                      interestEarned,
                      isClosed,
                      ethDeposit,
                      stEthDeposit,
                    }) => (
                      <AccordionItem key={address}>
                        <h2>
                          <AccordionButton>
                            <Box as="span" flex="1" textAlign="left">
                              <Badge colorScheme="purple">
                                {address && shortenAddress(address)}
                              </Badge>
                            </Box>
                            <AccordionIcon />
                          </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4}>
                          <Stack spacing={4}>
                            <Stack>
                              <Flex align="start" justify="space-between">
                                <Text>Position Information</Text>
                                {isClosed && (
                                  <Badge colorScheme="red">
                                    position closed
                                  </Badge>
                                )}
                              </Flex>
                              <Divider />
                              <Stack spacing={2} opacity={isClosed ? 0.4 : 1}>
                                <Flex align="center" justify="space-between">
                                  <Text color="gray.200">Opened At</Text>
                                  <Flex align="center" gap={1}>
                                    <Text color="gray.100" fontSize="sm">
                                      {openTimestamp
                                        ? moment
                                            .unix(
                                              Number(
                                                formatBNToString(
                                                  openTimestamp,
                                                  0,
                                                ),
                                              ),
                                            )
                                            .format("YYYY-MM-DD hh:mm A")
                                        : "--"}
                                    </Text>
                                    <Badge colorScheme="blue" fontSize="sm">
                                      {openTimestamp
                                        ? moment
                                            .unix(
                                              Number(
                                                formatBNToString(
                                                  openTimestamp,
                                                  0,
                                                ),
                                              ),
                                            )
                                            .fromNow()
                                        : "--"}
                                    </Badge>
                                  </Flex>
                                </Flex>
                                <Flex align="center" justify="space-between">
                                  <Text color="gray.200">
                                    Total Deposit (ETH)
                                  </Text>
                                  <Text color="gray.100" fontSize="sm">
                                    {ethDeposit
                                      ? `${ethDeposit.toFixed(5)} ($${(
                                          (tokenPricesUSD?.ETH || 0) *
                                          ethDeposit
                                        ).toFixed(2)})`
                                      : "--"}
                                  </Text>
                                </Flex>
                                <Flex align="center" justify="space-between">
                                  <Text color="gray.200">
                                    Total Deposit (stETH)
                                  </Text>
                                  <Text color="gray.100" fontSize="sm">
                                    {stEthDeposit
                                      ? `${formatBNToString(
                                          stEthDeposit,
                                          18,
                                          5,
                                        )} ($${(
                                          (tokenPricesUSD?.STETH || 0) *
                                          +formatBNToString(stEthDeposit, 18)
                                        ).toFixed(2)})`
                                      : "--"}
                                  </Text>
                                </Flex>
                                <Flex align="center" justify="space-between">
                                  <Text color="gray.200">
                                    Interest Earned (ETH)
                                  </Text>
                                  <Text color="green.300" fontSize="sm">
                                    {interestEarned
                                      ? `${interestEarned.toFixed(5)} ($${(
                                          (tokenPricesUSD?.ETH || 0) *
                                          interestEarned
                                        ).toFixed(2)})`
                                      : "--"}
                                  </Text>
                                </Flex>
                              </Stack>
                            </Stack>
                            {!isClosed && (
                              <Tooltip label="Withdraw your initial ETH deposit and accrued interest">
                                <Button
                                  isLoading={exitPosIsLoading}
                                  isDisabled={exitPosIsLoading || !address}
                                  variant="outline"
                                  onClick={() => exitPosition(address || "")}
                                >
                                  {t("Exit Position")}
                                </Button>
                              </Tooltip>
                            )}
                          </Stack>
                        </AccordionPanel>
                      </AccordionItem>
                    ),
                  )}
                </Accordion>
              </Stack>
            </Box>
          </Skeleton>
          <Button
            isLoading={isLoading}
            isDisabled={!!error || !deposit || isLoading}
            onClick={() => {
              const { value, isFallback } = parseStringToBigNumber(deposit, 18)
              if (!isFallback) {
                createCloneAndEnterPos(value, { seed })
              }
            }}
          >
            {error || "Create New Position"}
          </Button>
        </Stack>
      </Box>
    </PageWrapper>
  )
}

export default Leverage
