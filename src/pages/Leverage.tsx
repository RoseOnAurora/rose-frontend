/* eslint @typescript-eslint/no-floating-promises: 0 */
import {
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
import { commify, formatBNToPercentString, formatBNToString } from "../utils"
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
import useCreateCloneAndEnterPos from "../hooks/useCreateCloneAndEnterPosition"
import useEarnGetPositionData from "../hooks/useEarnGetPositionData"
import { useRoseTokenBalances } from "../hooks/useTokenBalances"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"
import { useWeb3React } from "@web3-react/core"

const Leverage = (): ReactElement => {
  const [deposit, setDeposit] = useState("")
  const { tokenPricesUSD } = useSelector((state: AppState) => state.application)

  const { t } = useTranslation()
  const toast = useChakraToast()
  const { chainId } = useWeb3React()
  const { isLoading, posAddress, createCloneAndEnterPos } =
    useCreateCloneAndEnterPos({
      onSuccess: (receipt) => {
        const description = receipt?.transactionHash ? (
          <BlockExplorerLink
            txnType={TransactionType.DEPOSIT}
            txnHash={receipt.transactionHash}
            status={receipt?.status ? "Succeeded" : "Failed"}
            chainId={chainId}
          />
        ) : null
        toast.transactionSuccess({
          txnType: TransactionType.DEPOSIT,
          description,
        })
        setDeposit("")
      },
      onError: (error) =>
        toast.transactionFailed({ txnType: TransactionType.DEPOSIT, error }),
    })

  const { data, isLoading: posDataIsLoading } =
    useEarnGetPositionData(posAddress)

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
              <Tooltip label="RoseV2 Alpha Release">
                <Badge
                  cursor="help"
                  h="fit-content"
                  maxW="fit-content"
                  colorScheme="pink"
                >
                  alpha
                </Badge>
              </Tooltip>
            </Flex>
            <Tag size="lg" colorScheme="blue">
              10% FIXED APY
            </Tag>
          </Flex>
          <Text color="gray.300">
            Earn a fixed 10% APY on your ETH deposit. Withdraw and exit your
            position at any time. Only 1 position per account is currently
            supported.
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
            {data && (
              <Box bgColor="bgDark" w="full" borderRadius="8px" p="24px">
                <Stack>
                  <Flex align="center" justify="space-between">
                    <Text>Position Information</Text>
                    <Tooltip label="Exit your position">
                      <Button size="sm" variant="outline">
                        {t("Exit")}
                      </Button>
                    </Tooltip>
                  </Flex>
                  <Divider />
                  <Stack spacing={2}>
                    <Flex align="center" justify="space-between">
                      <Text color="gray.200">Opened At</Text>
                      <Flex align="center" gap={1}>
                        <Text color="gray.100" fontSize="sm">
                          {moment
                            .unix(
                              Number(formatBNToString(data.openTimestamp, 0)),
                            )
                            .format("YYYY-MM-DD hh:mm A")}
                        </Text>
                        <Badge colorScheme="blue" fontSize="sm">
                          {moment
                            .unix(
                              Number(formatBNToString(data.openTimestamp, 0)),
                            )
                            .fromNow()}
                        </Badge>
                      </Flex>
                    </Flex>
                    <Flex align="center" justify="space-between">
                      <Text color="gray.200">Total Deposit in stETH</Text>
                      <Text color="gray.100" fontSize="sm">
                        {formatBNToString(data.stEthBal, 18, 5)}
                      </Text>
                    </Flex>
                    <Flex align="center" justify="space-between">
                      <Text color="gray.200">Total Collateral</Text>
                      <Text color="gray.100" fontSize="sm">
                        {formatBNToString(data.totalCollateralBase, 18, 5)}
                      </Text>
                    </Flex>
                    <Flex align="center" justify="space-between">
                      <Text color="gray.200">Total Debt</Text>
                      <Text color="gray.100" fontSize="sm">
                        {formatBNToString(data.totalDebtBase, 18, 5)}
                      </Text>
                    </Flex>
                    <Flex align="center" justify="space-between">
                      <Text color="gray.200">Remaining borrow amount</Text>
                      <Text color="gray.100" fontSize="sm">
                        {formatBNToString(data.availableBorrowsBase, 18, 5)}
                      </Text>
                    </Flex>
                    <Flex align="center" justify="space-between">
                      <Text color="gray.200">Liquidation Threshold</Text>
                      <Text color="gray.100" fontSize="sm">
                        {formatBNToPercentString(
                          data.currentLiquidationThreshold,
                          4,
                          0,
                        )}
                      </Text>
                    </Flex>
                    <Flex align="center" justify="space-between">
                      <Text color="gray.200">LTV</Text>
                      <Text color="gray.100" fontSize="sm">
                        {formatBNToPercentString(data.ltv, 4, 0)}
                      </Text>
                    </Flex>
                    <Flex align="center" justify="space-between">
                      <Text color="gray.200">Position Health</Text>
                      <Text color="gray.100" fontSize="sm">
                        {formatBNToString(data.healthFactor, 18, 2)}
                      </Text>
                    </Flex>
                  </Stack>
                </Stack>
              </Box>
            )}
          </Skeleton>
          <Button
            isLoading={isLoading}
            isDisabled={!!error || !deposit}
            onClick={() => {
              const { value, isFallback } = parseStringToBigNumber(deposit, 18)
              if (!isFallback) {
                createCloneAndEnterPos(value)
              }
            }}
          >
            {error || "Enter Position"}
          </Button>
        </Stack>
      </Box>
    </PageWrapper>
  )
}

export default Leverage
