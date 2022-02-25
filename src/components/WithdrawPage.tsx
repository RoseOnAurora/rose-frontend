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
import ConfirmTransaction, { ModalType } from "./ConfirmTransaction"
import { PoolDataType, UserShareType } from "../hooks/usePoolData"
import React, { ReactElement, useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import AdvancedOptions from "./AdvancedOptions"
import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import { BsSliders } from "react-icons/bs"
import { ContractReceipt } from "@ethersproject/contracts"
import { FRAX_STABLES_LP_POOL_NAME } from "../constants"
import { IconButtonPopover } from "./Popover"
import Modal from "./Modal"
import RadioButton from "./RadioButton"
import ReviewWithdraw from "./ReviewWithdraw"
import TokenInput from "./TokenInput"
import { WithdrawFormState } from "../hooks/useWithdrawFormState"
import { Zero } from "@ethersproject/constants"
import { formatBNToPercentString } from "../utils"
import { getEtherscanLink } from "../utils/getEtherscanLink"
import { logEvent } from "../utils/googleAnalytics"
import { useSelector } from "react-redux"

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

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Props {
  title: string
  tokensData: Array<{
    symbol: string
    name: string
    icon: string
    inputValue: string
    max: string
  }>
  reviewData: ReviewWithdrawData
  selected?: { [key: string]: any }
  poolData: PoolDataType | null
  myShareData: UserShareType | null
  formStateData: WithdrawFormState
  onFormChange: (action: any) => void
  onConfirmTransaction: () => Promise<ContractReceipt | void>
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const WithdrawPage = (props: Props): ReactElement => {
  const { t } = useTranslation()
  const {
    tokensData,
    poolData,
    myShareData,
    onFormChange,
    formStateData,
    reviewData,
    onConfirmTransaction,
  } = props

  const { gasPriceSelected } = useSelector((state: AppState) => state.user)
  const [currentModal, setCurrentModal] = useState<string | null>(null)
  const [sliderValue, setSliderValue] = React.useState(100)
  const [showTooltip, setShowTooltip] = React.useState(false)

  const [isOpen, setIsOpen] = useState(false)

  const onSubmit = (): void => {
    setCurrentModal("review")
  }
  const noShare = !myShareData || myShareData.lpTokenBalance.eq(Zero)
  const [txnHash, setTxnHash] = useState<string | undefined>(undefined)

  return (
    <Box>
      <Modal
        isOpen={!!currentModal}
        onClose={(): void => setCurrentModal(null)}
      >
        {currentModal === "review" ? (
          <ReviewWithdraw
            data={reviewData}
            gas={gasPriceSelected}
            onConfirm={(): void => {
              setTxnHash(undefined)
              setCurrentModal(ModalType.CONFIRM)
              logEvent("withdraw", (poolData && { pool: poolData?.name }) || {})
              onConfirmTransaction?.()
                .then((res) => {
                  if (res?.status) {
                    setCurrentModal(ModalType.SUCCESS)
                  } else {
                    setCurrentModal(ModalType.FAILED)
                    setTxnHash(res?.transactionHash)
                  }
                })
                .catch(() => {
                  setCurrentModal(ModalType.FAILED)
                })
            }}
            onClose={(): void => setCurrentModal(null)}
          />
        ) : null}
        {currentModal === ModalType.CONFIRM ? (
          <ConfirmTransaction />
        ) : currentModal === ModalType.FAILED ? (
          <ConfirmTransaction
            title={t("failedTitle")}
            type={ModalType.FAILED}
            description={
              !txnHash
                ? t("txFailed_internal", { tx: t("withdraw") })
                : undefined
            }
          >
            {txnHash && (
              <Trans i18nKey="txFailed" t={t}>
                {{ tx: t("withdraw") }}
                <a
                  href={getEtherscanLink(txnHash, "tx")}
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: "underline", margin: 0 }}
                >
                  aurorascan.
                </a>
              </Trans>
            )}
          </ConfirmTransaction>
        ) : currentModal === ModalType.SUCCESS ? (
          <ConfirmTransaction
            title={t("successTitle")}
            description={t("txConfirmed_withdraw")}
            type={ModalType.SUCCESS}
          />
        ) : null}
      </Modal>
      <div className="form">
        <Tabs
          isFitted
          variant="primary"
          onChange={() => {
            onFormChange({ fieldName: "reset", value: "reset" })
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
                        checked={formStateData.withdrawType === t.symbol}
                        onChange={(): void => {
                          onFormChange({
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
                    onFormChange({
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
              {formStateData.error ? (
                <div className="error">{formStateData.error.message}</div>
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
                          onFormChange({
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
                      {reviewData.priceImpact.gte(0) ? (
                        <span className="bonus">{t("bonus")}: </span>
                      ) : (
                        <span className="slippage">{t("priceImpact")}</span>
                      )}
                      <span
                        className={
                          "value " +
                          (reviewData.priceImpact.gte(0) ? "bonus" : "slippage")
                        }
                      >
                        {" "}
                        {formatBNToPercentString(reviewData.priceImpact, 18, 4)}
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
              {formStateData.error ? (
                <div className="error">{formStateData.error.message}</div>
              ) : null}
              {tokensData.map((token, index) => (
                <div key={index}>
                  <TokenInput
                    {...token}
                    // inputValue={parseFloat(token.inputValue).toFixed(5)}
                    onChange={(value): void =>
                      onFormChange({
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
                    {reviewData.priceImpact.gte(0) ? (
                      <span className="bonus">{t("bonus")}: </span>
                    ) : (
                      <span className="slippage">{t("priceImpact")}</span>
                    )}
                    <span
                      className={
                        "value " +
                        (reviewData.priceImpact.gte(0) ? "bonus" : "slippage")
                      }
                    >
                      {" "}
                      {formatBNToPercentString(reviewData.priceImpact, 18, 4)}
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
              !!formStateData.error ||
              formStateData.lpTokenAmountToSpend.isZero()
            }
            onClick={onSubmit}
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

export default WithdrawPage
