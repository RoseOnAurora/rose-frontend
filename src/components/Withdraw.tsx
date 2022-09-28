/* eslint @typescript-eslint/no-unsafe-assignment: 0 */
/* eslint @typescript-eslint/no-unsafe-call: 0 */
/* eslint @typescript-eslint/no-explicit-any: 0 */
import {
  Box,
  Button,
  Flex,
  SlideFade,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Tooltip,
} from "@chakra-ui/react"
import { Contract, ContractReceipt } from "@ethersproject/contracts"
import {
  ErrorObj,
  FRAX_STABLES_LP_POOL_NAME,
  POOLS_MAP,
  PoolName,
} from "../constants"
import React, { ReactElement, useEffect, useState } from "react"
import { calculatePrice, formatBNToString } from "../utils"
import { commify, formatUnits, parseUnits } from "@ethersproject/units"
import AdvancedOptions from "./AdvancedOptions"
import { AppState } from "../state"
import ApprovalInfo from "./ApprovalInfo"
import { BigNumber } from "@ethersproject/bignumber"
import Bonus from "./pool/Bonus"
import { FaCircle } from "react-icons/fa"
import FormTitle from "./FormTitleOptions"
import MaxFromBalance from "./input/MaxFromBalance"
import ModalWrapper from "./wrappers/ModalWrapper"
import OutdatedPoolInfo from "./OutdatedPoolInfo"
import ReviewWithdraw from "./ReviewWithdraw"
import RoseRadioButton from "./button/RadioButton"
import SingleTokenInput from "./input/SingleTokenInput"
import { TransactionType } from "../hooks/useChakraToast"
import { Zero } from "@ethersproject/constants"
import { calculatePriceImpact } from "../utils/priceImpact"
import { formatSlippageToString } from "../utils/slippage"
import { useActiveWeb3React } from "../hooks"
import { useApproveAndWithdraw } from "../hooks/useApproveAndWithdraw"
import { usePoolContract } from "../hooks/useContract"
import usePoolData from "../hooks/usePoolData"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"
import useWithdrawFormState from "../hooks/useWithdrawFormState"

export interface ReviewWithdrawData {
  withdraw: {
    name: string
    value: string
    icon: string
  }[]
  rates: {
    name: string
    value: string
    rate: string
  }[]
  slippage: string
  priceImpact: BigNumber
  txnGasCost: {
    amount: BigNumber
    valueUSD: BigNumber | null // amount * ethPriceUSD
  }
}
interface Props {
  poolName: PoolName
  handlePreSubmit?: (txnType: TransactionType) => void
  handlePostSubmit?: (
    receipt: ContractReceipt | null,
    transactionType: TransactionType,
    error?: ErrorObj,
  ) => void
}

function Withdraw({
  poolName,
  handlePreSubmit,
  handlePostSubmit,
}: Props): ReactElement {
  const { t } = useTranslation()
  const [poolData, userShareData] = usePoolData(poolName)
  const [withdrawFormState, updateWithdrawFormState] =
    useWithdrawFormState(poolName)
  const { slippageCustom, slippageSelected, gasPriceSelected } = useSelector(
    (state: AppState) => state.user,
  )
  const { tokenPricesUSD } = useSelector((state: AppState) => state.application)
  const approveAndWithdraw = useApproveAndWithdraw(poolName)
  const poolContract = usePoolContract(poolName) as Contract
  const { account } = useActiveWeb3React()
  const [sliderValue, setSliderValue] = useState(100)
  const [showTooltip, setShowTooltip] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [estWithdrawBonus, setEstWithdrawBonus] = useState(Zero)

  const POOL = POOLS_MAP[poolName]

  useEffect(() => {
    // evaluate if a new withdraw will exceed the pool's per-user limit
    async function calculateWithdrawBonus(): Promise<void> {
      try {
        if (
          poolContract == null ||
          userShareData == null ||
          poolData == null ||
          account == null
        ) {
          return
        }
        const tokenInputSum = parseUnits(
          POOL.poolTokens
            .reduce(
              (sum, { symbol }) =>
                sum + (+withdrawFormState.tokenInputs[symbol].valueRaw || 0),
              0,
            )
            .toString(),
          18,
        )
        let withdrawLPTokenAmount
        if (poolData.totalLocked.gt(0) && tokenInputSum.gt(0)) {
          const txnAmounts: string[] = POOL.poolTokens.map((poolToken) => {
            return withdrawFormState.tokenInputs[poolToken.symbol].valueSafe
          })
          withdrawLPTokenAmount = await poolContract.calc_token_amount(
            txnAmounts,
            false,
          )
        } else {
          // when pool is empty, estimate the lptokens by just summing the input instead of calling contract
          withdrawLPTokenAmount = tokenInputSum
        }
        setEstWithdrawBonus(
          calculatePriceImpact(
            withdrawLPTokenAmount,
            tokenInputSum,
            poolData.virtualPrice,
            true,
          ),
        )
      } catch {
        // pass here for now - fix later with hook
      }
    }
    void calculateWithdrawBonus()
  }, [
    poolData,
    withdrawFormState,
    poolContract,
    userShareData,
    account,
    POOL.poolTokens,
  ])
  async function onConfirmTransaction(): Promise<ContractReceipt | void> {
    const { withdrawType, tokenInputs, lpTokenAmountToSpend } =
      withdrawFormState
    const receipt = await approveAndWithdraw({
      tokenFormState: tokenInputs,
      withdrawType,
      lpTokenAmountToSpend,
    })
    updateWithdrawFormState({ fieldName: "reset", value: "reset" })

    return receipt
  }

  const tokensData = React.useMemo(() => {
    try {
      return POOL.poolTokens.map(({ name, symbol, icon, decimals }) => ({
        name,
        symbol,
        icon,
        inputValue: withdrawFormState.tokenInputs[symbol].valueRaw,
        // TO-DO: all decimals have been casted to 18 - we need to change that
        // to generic behavior so we don't have to cast back
        max: formatBNToString(
          userShareData?.tokens
            .find((shareToken) => shareToken.symbol === symbol)
            ?.value.div(BigNumber.from(10).pow(18 - decimals)) || Zero,
          decimals,
        ),
      }))
    } catch {
      return []
    }
  }, [withdrawFormState, POOL.poolTokens, userShareData?.tokens])
  // TO-DO: fix gas price calculation
  const gasAmount = BigNumber.from(0)

  const txnGasCost = {
    amount: gasAmount,
    valueUSD: tokenPricesUSD?.ETH
      ? parseUnits(tokenPricesUSD.ETH.toFixed(2), 18) // USD / ETH  * 10^18
          .mul(gasAmount) // GWEI
          .div(BigNumber.from(10).pow(25)) // USD / ETH * GWEI * ETH / GWEI = USD
      : null,
  }

  const reviewWithdrawData: ReviewWithdrawData = {
    withdraw: [],
    rates: [],
    slippage: formatSlippageToString(slippageSelected, slippageCustom),
    priceImpact: estWithdrawBonus,
    txnGasCost: txnGasCost,
  }

  try {
    POOL.poolTokens.forEach(({ name, decimals, icon, symbol }) => {
      if (
        BigNumber.from(withdrawFormState.tokenInputs[symbol].valueSafe).gt(0)
      ) {
        reviewWithdrawData.withdraw.push({
          name,
          value: commify(
            formatUnits(
              withdrawFormState.tokenInputs[symbol].valueSafe,
              decimals,
            ),
          ),
          icon,
        })
        if (tokenPricesUSD != null) {
          reviewWithdrawData.rates.push({
            name,
            value: formatUnits(
              withdrawFormState.tokenInputs[symbol].valueSafe,
              decimals,
            ),
            rate: commify(tokenPricesUSD[symbol]?.toFixed(2)),
          })
        }
      }
    })
  } catch {
    // noop
  }

  const noShare = !userShareData || userShareData.lpTokenBalance.eq(Zero)

  return (
    <Box>
      <ModalWrapper
        modalHeader={t("reviewWithdraw")}
        isOpen={isModalOpen}
        onClose={(): void => setIsModalOpen(false)}
        maxW="550px"
        preserveScrollBarGap
        isCentered
      >
        <ReviewWithdraw
          data={reviewWithdrawData}
          onClose={(): void => setIsModalOpen(false)}
          gas={gasPriceSelected}
          onConfirm={async () => {
            setIsModalOpen(false)
            handlePreSubmit?.(TransactionType.WITHDRAW)
            try {
              const receipt =
                (await onConfirmTransaction?.()) as ContractReceipt
              handlePostSubmit?.(receipt, TransactionType.WITHDRAW)
            } catch (e) {
              const error = e as ErrorObj
              handlePostSubmit?.(null, TransactionType.WITHDRAW, {
                code: error.code,
                message: error.message,
              })
            }
          }}
        />
      </ModalWrapper>
      <Stack spacing="10px">
        <FormTitle title={t("withdraw")} popoverOptions={<AdvancedOptions />} />
        <Tabs
          isFitted
          variant="primary"
          size="md"
          pt={4}
          onChange={() => {
            updateWithdrawFormState({ fieldName: "reset", value: "reset" })
            setIsOpen(false)
          }}
        >
          <TabList>
            <Tab>Single Token</Tab>
            <Tab>Multi Token</Tab>
          </TabList>
          <TabPanels>
            <TabPanel px={1} pb={8}>
              <Stack spacing={5} mt="10px">
                {poolData?.name === FRAX_STABLES_LP_POOL_NAME && (
                  <OutdatedPoolInfo poolName="Frax" route="/pools/frax" />
                )}
                <Box bg="gray.800" borderRadius="12px" p="16px">
                  <Flex justifyContent="space-between" alignItems="center">
                    <Text
                      as="span"
                      color="gray.100"
                      fontWeight={700}
                      fontSize="15px"
                    >
                      Select a token:
                    </Text>
                    <RoseRadioButton
                      options={tokensData.map((t) => t.symbol)}
                      onChange={(nextValue: string): void => {
                        updateWithdrawFormState({
                          fieldName: "withdrawType",
                          value: nextValue,
                        })
                        setIsOpen(true)
                      }}
                    />
                  </Flex>
                </Box>
                <Stack spacing={3}>
                  <Text color="gray.100" fontSize="14px" fontWeight={700}>
                    % of share to withdraw:
                  </Text>
                  <Box p={3}>
                    <Slider
                      id="slider"
                      defaultValue={100}
                      min={0}
                      max={100}
                      mt="1"
                      onChange={(v) => {
                        setSliderValue(v)
                        updateWithdrawFormState({
                          fieldName: "percentage",
                          value: String(v),
                        })
                      }}
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                      color="gray.300"
                    >
                      <SliderMark value={0} mt="2.5" fontSize="xs">
                        0%
                      </SliderMark>
                      <SliderMark value={25} mt="2.5" ml="-2.5" fontSize="xs">
                        25%
                      </SliderMark>
                      <SliderMark value={50} mt="2.5" ml="-2.5" fontSize="xs">
                        50%
                      </SliderMark>
                      <SliderMark value={75} mt="2.5" ml="-2.5" fontSize="xs">
                        75%
                      </SliderMark>
                      <SliderMark value={100} mt="2.5" ml="-3" fontSize="xs">
                        100%
                      </SliderMark>
                      <SliderTrack bg="gray.700">
                        <SliderFilledTrack bg="red.500" />
                      </SliderTrack>
                      <Tooltip
                        hasArrow
                        bg="red.400"
                        color="gray.900"
                        placement="top"
                        isOpen={showTooltip}
                        label={`${sliderValue}%`}
                      >
                        <SliderThumb boxSize={5}>
                          <Box boxSize={3} as={FaCircle} color="red.400" />
                        </SliderThumb>
                      </Tooltip>
                    </Slider>
                  </Box>
                </Stack>
                <SlideFade in={isOpen} hidden={!isOpen} offsetY="-30px">
                  <Stack spacing="15px" mt={2}>
                    {tokensData.map((token, index) => {
                      let tokenUSDValue: number | BigNumber | undefined
                      if (poolData.lpTokenPriceUSD != Zero) {
                        tokenUSDValue = parseFloat(
                          formatBNToString(poolData.lpTokenPriceUSD, 18, 2),
                        )
                      } else {
                        tokenUSDValue = tokenPricesUSD?.[token.symbol]
                      }
                      return (
                        <Stack key={index} alignItems="flex-end" spacing={0}>
                          <SingleTokenInput
                            token={token}
                            inputValue={token.inputValue}
                            isInvalid={false}
                            readOnly={true}
                            onChangeInput={(e): void => {
                              updateWithdrawFormState({
                                fieldName: "tokenInputs",
                                value: e.target.value,
                                tokenSymbol: token.symbol,
                              })
                            }}
                          />
                          <Flex
                            justifyContent="flex-end"
                            w="full"
                            overflow="hidden"
                          >
                            <Text
                              textAlign="right"
                              fontSize="12px"
                              fontWeight={400}
                              color="gray.300"
                            >
                              ≈$
                              {commify(
                                formatBNToString(
                                  calculatePrice(
                                    token.inputValue,
                                    tokenUSDValue,
                                  ),
                                  18,
                                  2,
                                ),
                              )}
                            </Text>
                          </Flex>
                        </Stack>
                      )
                    })}
                    {withdrawFormState.error && (
                      <Text
                        textAlign="center"
                        color="red.600"
                        whiteSpace="nowrap"
                        fontSize="14px"
                      >
                        {withdrawFormState.error.message}
                      </Text>
                    )}
                  </Stack>
                </SlideFade>
                <Bonus amount={reviewWithdrawData.priceImpact} />
              </Stack>
            </TabPanel>
            <TabPanel>
              <Stack spacing={5} mt="10px">
                {poolData?.name === FRAX_STABLES_LP_POOL_NAME && (
                  <OutdatedPoolInfo poolName="Frax" route="/pools/frax" />
                )}
                <Text
                  fontSize="16px"
                  fontWeight={400}
                  color="gray.300"
                  textAlign="center"
                >
                  Type in below the amounts of each token you want to withdraw.
                </Text>
                {tokensData.map((token, index) => {
                  let tokenUSDValue: number | BigNumber | undefined
                  if (poolData.lpTokenPriceUSD != Zero) {
                    tokenUSDValue = parseFloat(
                      formatBNToString(poolData.lpTokenPriceUSD, 18, 2),
                    )
                  } else {
                    tokenUSDValue = tokenPricesUSD?.[token.symbol]
                  }
                  return (
                    <Stack key={index} alignItems="flex-end" spacing={0}>
                      <MaxFromBalance
                        onClickMax={() => {
                          updateWithdrawFormState({
                            fieldName: "tokenInputs",
                            value: token.max,
                            tokenSymbol: token.symbol,
                          })
                        }}
                        max={token.max}
                      />
                      <SingleTokenInput
                        token={token}
                        inputValue={token.inputValue}
                        isInvalid={false} // TODO: fix this
                        onChangeInput={(e): void => {
                          updateWithdrawFormState({
                            fieldName: "tokenInputs",
                            value: e.target.value,
                            tokenSymbol: token.symbol,
                          })
                        }}
                      />
                      <Flex justifyContent="space-between" w="full">
                        {!!withdrawFormState.tokenInputs[token.symbol].error &&
                          !!token.inputValue && (
                            <Text
                              color="red.600"
                              whiteSpace="nowrap"
                              fontSize="14px"
                            >
                              {
                                withdrawFormState.tokenInputs[token.symbol]
                                  .error
                              }
                            </Text>
                          )}
                        <Flex
                          justifyContent="flex-end"
                          w="full"
                          overflow="hidden"
                        >
                          <Text
                            textAlign="right"
                            fontSize="12px"
                            fontWeight={400}
                            color="gray.300"
                          >
                            ≈$
                            {commify(
                              formatBNToString(
                                calculatePrice(token.inputValue, tokenUSDValue),
                                18,
                                2,
                              ),
                            )}
                          </Text>
                        </Flex>
                      </Flex>
                    </Stack>
                  )
                })}
                {withdrawFormState.error && (
                  <Text
                    textAlign="center"
                    color="red.600"
                    whiteSpace="nowrap"
                    fontSize="14px"
                  >
                    {withdrawFormState.error.message}
                  </Text>
                )}
                <Bonus amount={reviewWithdrawData.priceImpact} />
              </Stack>
            </TabPanel>
          </TabPanels>
        </Tabs>
        <Button
          variant="primary"
          size="lg"
          width="100%"
          disabled={
            noShare ||
            !!withdrawFormState.error ||
            withdrawFormState.lpTokenAmountToSpend.isZero()
          }
          onClick={(): void => {
            setIsModalOpen(true)
          }}
        >
          {t("withdraw")}
        </Button>
        <ApprovalInfo />
      </Stack>
    </Box>
  )
}

export default Withdraw
