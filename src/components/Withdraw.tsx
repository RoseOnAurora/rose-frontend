/* eslint @typescript-eslint/no-unsafe-assignment: 0 */
/* eslint @typescript-eslint/no-unsafe-call: 0 */
/* eslint @typescript-eslint/no-explicit-any: 0 */
import "./WithdrawPage.scss"
import {
  Box,
  Button,
  Center,
  SlideFade,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tooltip,
} from "@chakra-ui/react"
import { Contract, ContractReceipt } from "@ethersproject/contracts"
import { FRAX_STABLES_LP_POOL_NAME, POOLS_MAP, PoolName } from "../constants"
import React, { ReactElement, useEffect, useState } from "react"
import { commify, formatUnits, parseUnits } from "@ethersproject/units"
import { formatBNToPercentString, formatBNToString } from "../utils"
import AdvancedOptions from "./AdvancedOptions"
import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import { BsSliders } from "react-icons/bs"
import { IconButtonPopover } from "./Popover"
import Modal from "./Modal"
import RadioButton from "./RadioButton"
import ReviewWithdraw from "./ReviewWithdraw"
import TokenInput from "./TokenInput"
import { TransactionType } from "../hooks/useChakraToast"
import { Zero } from "@ethersproject/constants"
import { calculatePriceImpact } from "../utils/priceImpact"
import { formatSlippageToString } from "../utils/slippage"
import { logEvent } from "../utils/googleAnalytics"
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
    error?: { code: number; message: string },
  ) => void
}

function Withdraw({
  poolName,
  handlePreSubmit,
  handlePostSubmit,
}: Props): ReactElement {
  const { t } = useTranslation()
  const [poolData, userShareData] = usePoolData(poolName)
  const [withdrawFormState, updateWithdrawFormState] = useWithdrawFormState(
    poolName,
  )
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
    const {
      withdrawType,
      tokenInputs,
      lpTokenAmountToSpend,
    } = withdrawFormState
    const receipt = await approveAndWithdraw({
      tokenFormState: tokenInputs,
      withdrawType,
      lpTokenAmountToSpend,
    })
    updateWithdrawFormState({ fieldName: "reset", value: "reset" })

    return receipt
  }

  const tokensData = React.useMemo(
    () =>
      POOL.poolTokens.map(({ name, symbol, icon, decimals }) => ({
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
      })),
    [withdrawFormState, POOL.poolTokens, userShareData?.tokens],
  )
  // TO-DO: fix gas price calculation
  // const gasPrice = Zero
  // const gasPrice = ethers.utils.parseUnits(
  //   formatGasToString(
  //     { gasStandard, gasFast, gasInstant },
  //     gasPriceSelected,
  //     gasCustom,
  //   ),
  //   "gwei",
  // )
  // const gasAmount = calculateGasEstimate("removeLiquidityImbalance").mul(
  //   gasPrice,
  // ) // units of gas * GWEI/Unit of gas
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

  POOL.poolTokens.forEach(({ name, decimals, icon, symbol }) => {
    if (BigNumber.from(withdrawFormState.tokenInputs[symbol].valueSafe).gt(0)) {
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

  const noShare = !userShareData || userShareData.lpTokenBalance.eq(Zero)

  return (
    <Box>
      <Modal isOpen={isModalOpen} onClose={(): void => setIsModalOpen(false)}>
        <ReviewWithdraw
          data={reviewWithdrawData}
          onClose={(): void => setIsModalOpen(false)}
          gas={gasPriceSelected}
          onConfirm={async () => {
            setIsModalOpen(false)
            logEvent("withdraw", (poolData && { pool: poolData?.name }) || {})
            handlePreSubmit?.(TransactionType.WITHDRAW)
            try {
              const receipt = (await onConfirmTransaction?.()) as ContractReceipt
              handlePostSubmit?.(receipt, TransactionType.WITHDRAW)
            } catch (e) {
              const error = e as { code: number; message: string }
              handlePostSubmit?.(null, TransactionType.WITHDRAW, {
                code: error.code,
                message: error.message,
              })
            }
          }}
        />
      </Modal>
      <div className="form">
        <Tabs
          isFitted
          variant="primary"
          onChange={() => {
            updateWithdrawFormState({ fieldName: "reset", value: "reset" })
            setIsOpen(false)
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <h3>{t("withdraw")}</h3>
            <IconButtonPopover
              IconButtonProps={{
                "aria-label": "Configure Settings",
                variant: "outline",
                size: "lg",
                icon: <BsSliders size="25px" />,
                title: "Configure Settings",
              }}
              PopoverBodyContent={<AdvancedOptions />}
            />
          </div>
          <TabList>
            <Tab>Single Token</Tab>
            <Tab>Multi Token</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              {poolData?.name === FRAX_STABLES_LP_POOL_NAME && (
                <p className="outdatedInfo">
                  This pool is outdated. Please withdraw your liquidity and{" "}
                  <a href="/#/pools/frax">migrate to the new Frax pool.</a>
                </p>
              )}
              <div className="horizontalDisplay">
                <span>Select a token: </span>
                <div>
                  {tokensData.map((t) => {
                    return (
                      <RadioButton
                        key={t.symbol}
                        checked={withdrawFormState.withdrawType === t.symbol}
                        onChange={(): void => {
                          updateWithdrawFormState({
                            fieldName: "withdrawType",
                            value: t.symbol,
                          })
                          setIsOpen(true)
                        }}
                        label={t.name}
                      />
                    )
                  })}
                </div>
              </div>
              <span>
                <small>% of share to withdraw:</small>
              </span>
              <div className="percentage">
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
                >
                  <SliderMark value={0} mt="1" ml="-2.5" fontSize="sm">
                    0%
                  </SliderMark>
                  <SliderMark value={50} mt="1" ml="-2.5" fontSize="sm">
                    50%
                  </SliderMark>
                  <SliderMark value={100} mt="1" ml="-2.5" fontSize="sm">
                    100%
                  </SliderMark>
                  <SliderTrack>
                    <SliderFilledTrack bg="#cc3a59" />
                  </SliderTrack>
                  <Tooltip
                    hasArrow
                    bg="#cc3a59"
                    color="white"
                    placement="top"
                    isOpen={showTooltip}
                    label={`${sliderValue}%`}
                  >
                    <SliderThumb />
                  </Tooltip>
                </Slider>
              </div>
              {withdrawFormState.error ? (
                <div className="error">{withdrawFormState.error.message}</div>
              ) : null}
              <SlideFade in={isOpen} hidden={!isOpen} offsetY="-30px">
                <Box mt="50px">
                  {tokensData.map((token, index) => (
                    <div key={index}>
                      <TokenInput
                        {...token}
                        max={undefined}
                        readonly={true}
                        // inputValue={parseFloat(token.inputValue).toFixed(5)}
                        onChange={(value): void =>
                          updateWithdrawFormState({
                            fieldName: "tokenInputs",
                            value: value,
                            tokenSymbol: token.symbol,
                          })
                        }
                      />
                      {index === tokensData.length - 1 ? (
                        ""
                      ) : (
                        <div
                          className="formSpace"
                          style={{ marginBottom: "10px" }}
                        ></div>
                      )}
                    </div>
                  ))}
                </Box>
                <div className={"transactionInfoContainer"}>
                  <div className="transactionInfo">
                    <div className="transactionInfoItem">
                      {reviewWithdrawData.priceImpact.gte(0) ? (
                        <span className="bonus">{t("bonus")}: </span>
                      ) : (
                        <span className="slippage">{t("priceImpact")}</span>
                      )}
                      <span
                        className={
                          "value " +
                          (reviewWithdrawData.priceImpact.gte(0)
                            ? "bonus"
                            : "slippage")
                        }
                      >
                        {" "}
                        {formatBNToPercentString(
                          reviewWithdrawData.priceImpact,
                          18,
                          4,
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </SlideFade>
            </TabPanel>
            <TabPanel>
              {poolData?.name === FRAX_STABLES_LP_POOL_NAME && (
                <p className="outdatedInfo">
                  This pool is outdated. Please withdraw your liquidity and{" "}
                  <a href="/#/pools/frax">migrate to the new Frax pool.</a>
                </p>
              )}
              <p className="instructions">
                Type in below the amounts of each token you want to withdraw.
              </p>
              {withdrawFormState.error ? (
                <div className="error">{withdrawFormState.error.message}</div>
              ) : null}
              {tokensData.map((token, index) => (
                <div key={index}>
                  <TokenInput
                    {...token}
                    // inputValue={parseFloat(token.inputValue).toFixed(5)}
                    onChange={(value): void =>
                      updateWithdrawFormState({
                        fieldName: "tokenInputs",
                        value: value,
                        tokenSymbol: token.symbol,
                      })
                    }
                  />
                  {index === tokensData.length - 1 ? (
                    ""
                  ) : (
                    <div className="formSpace"></div>
                  )}
                </div>
              ))}
              <div className={"transactionInfoContainer"}>
                <div className="transactionInfo">
                  <div className="transactionInfoItem">
                    {reviewWithdrawData.priceImpact.gte(0) ? (
                      <span className="bonus">{t("bonus")}: </span>
                    ) : (
                      <span className="slippage">{t("priceImpact")}</span>
                    )}
                    <span
                      className={
                        "value " +
                        (reviewWithdrawData.priceImpact.gte(0)
                          ? "bonus"
                          : "slippage")
                      }
                    >
                      {" "}
                      {formatBNToPercentString(
                        reviewWithdrawData.priceImpact,
                        18,
                        4,
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
      <div className="options" style={{ height: "100%" }}>
        <Center width="100%">
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
        </Center>
        <div className="approvalMessage">
          Note: The &quot;Approve&quot; transaction is only needed the first
          time; subsequent actions will not require approval.
        </div>
      </div>
    </Box>
  )
}

export default Withdraw
