import "./SwapPage.scss"

import { Button, Center } from "@chakra-ui/react"
import { FaArrowDown, FaArrowUp } from "react-icons/fa"
import React, { ReactElement, useMemo, useState } from "react"
import { SWAP_TYPES, getIsVirtualSwap } from "../constants"
import { formatBNToPercentString, formatBNToString } from "../utils"
import useChakraToast, { TransactionType } from "../hooks/useChakraToast"

import AdvancedOptions from "./AdvancedOptions"
import { AppState } from "../state/index"
import { BigNumber } from "@ethersproject/bignumber"
import BlockExplorerLink from "./BlockExplorerLink"
import { BsSliders } from "react-icons/bs"
import { ContractReceipt } from "@ethersproject/contracts"
import { IconButtonPopover } from "./Popover"
import { ReactComponent as InfoIcon } from "../assets/icons/info.svg"
import Modal from "./Modal"
import ReviewSwap from "./ReviewSwap"
import { Slippages } from "../state/user"
import SwapInput from "./SwapInput"
import type { TokenOption } from "../pages/Swap"
import TopMenu from "./TopMenu"
import { Zero } from "@ethersproject/constants"
import classNames from "classnames"
import { commify } from "../utils"
import { isHighPriceImpact } from "../utils/priceImpact"
import { logEvent } from "../utils/googleAnalytics"
import { useActiveWeb3React } from "../hooks"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

interface Props {
  tokenOptions: {
    from: TokenOption[]
    to: TokenOption[]
  }
  exchangeRateInfo: {
    pair: string
    exchangeRate: BigNumber
    priceImpact: BigNumber
    route: string[]
  }
  txnGasCost: {
    amount: BigNumber
    valueUSD: BigNumber | null // amount * ethPriceUSD
  }
  error: string | null
  swapType: SWAP_TYPES
  fromState: { symbol: string; value: string; valueUSD: BigNumber }
  toState: { symbol: string; value: string; valueUSD: BigNumber }
  onChangeFromToken: (tokenSymbol: string) => void
  onChangeFromAmount: (amount: string) => void
  onChangeToToken: (tokenSymbol: string) => void
  onConfirmTransaction: () => Promise<ContractReceipt | void>
  onClickReverseExchangeDirection: () => void
}

const SwapPage = (props: Props): ReactElement => {
  const {
    tokenOptions,
    exchangeRateInfo,
    txnGasCost,
    error,
    fromState,
    toState,
    swapType,
    onChangeFromToken,
    onChangeFromAmount,
    onChangeToToken,
    onConfirmTransaction,
    onClickReverseExchangeDirection,
  } = props

  const { t } = useTranslation()
  const { account } = useActiveWeb3React()
  const toast = useChakraToast()

  const [isOpen, setIsOpen] = useState(false)

  const { slippageCustom, slippageSelected } = useSelector(
    (state: AppState) => state.user,
  )

  const postTransaction = (
    transactionType: TransactionType,
    receipt?: ContractReceipt | null,
    error?: { code: number; message: string },
  ): void => {
    const description = receipt?.transactionHash ? (
      <BlockExplorerLink
        txnType={transactionType}
        txnHash={receipt?.transactionHash}
        status={receipt?.status ? "Succeeded" : "Failed"}
      />
    ) : null
    if (receipt?.status) {
      toast.transactionSuccess({
        txnType: transactionType,
        description: description,
      })
    } else {
      console.log(error)
      toast.transactionFailed({
        txnType: transactionType,
        error,
        description: description,
      })
    }
  }

  const preTransaction = (txnType: TransactionType) =>
    toast.transactionPending({
      txnType,
    })

  const fromToken = useMemo(() => {
    return tokenOptions.from.find(({ symbol }) => symbol === fromState.symbol)
  }, [tokenOptions.from, fromState.symbol])

  const formattedPriceImpact = commify(
    formatBNToPercentString(exchangeRateInfo.priceImpact, 18),
  )
  const formattedExchangeRate = commify(
    formatBNToString(exchangeRateInfo.exchangeRate, 18, 6),
  )
  const formattedRoute = exchangeRateInfo.route.join(" > ")
  const formattedBalance = commify(
    formatBNToString(fromToken?.amount || Zero, fromToken?.decimals || 0, 6),
  )
  const isVirtualSwap = getIsVirtualSwap(swapType)
  const isHighSlippage =
    slippageSelected === Slippages.OneTenth ||
    (slippageSelected === Slippages.Custom &&
      parseFloat(slippageCustom?.valueRaw || "0") < 0.5)

  return (
    <div className="swapPage">
      <TopMenu activeTab={"swap"} />
      <div className="content">
        <div className="swapHeader">
          <h3 className="swapTitle">{t("swap")}</h3>
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
        <div className="swapForm">
          <div className="row">
            <h3 className="swapTitle">{t("from")}</h3>
            <div className="balanceContainer">
              <span>{t("balance")}:</span>
              &nbsp;
              <a
                onClick={() => {
                  if (fromToken == null) return
                  const amtStr = formatBNToString(
                    fromToken.amount,
                    fromToken.decimals || 0,
                  )
                  onChangeFromAmount(amtStr)
                }}
              >
                {formattedBalance}
              </a>
            </div>
          </div>
          <div className="row">
            <SwapInput
              tokens={tokenOptions.from.filter(
                ({ symbol }) => symbol !== toState.symbol,
              )}
              onSelect={onChangeFromToken}
              onChangeAmount={onChangeFromAmount}
              selected={fromState.symbol}
              inputValue={fromState.value}
              inputValueUSD={fromState.valueUSD}
              isSwapFrom={true}
            />
          </div>
          <div className="row swapButtonContainer">
            <h3 className="swapTitle">{t("to")}</h3>
            <Button
              variant="light"
              width="50px"
              size="sm"
              onClick={onClickReverseExchangeDirection}
              disabled={!fromState.symbol || !toState.symbol}
            >
              <FaArrowUp size="1em" />
              <FaArrowDown size="1em" />
            </Button>
          </div>
          <div className="row">
            <SwapInput
              tokens={tokenOptions.to.filter(
                ({ symbol }) => symbol !== fromState.symbol,
              )}
              onSelect={onChangeToToken}
              selected={toState.symbol}
              inputValue={toState.value}
              inputValueUSD={toState.valueUSD}
              isSwapFrom={false}
            />
          </div>
          <div style={{ height: "24px" }}></div>
          {fromState.symbol && toState.symbol && (
            <div className="row">
              <div>
                <span>{t("rate")}</span>
                &nbsp;
                <span>{exchangeRateInfo.pair}</span>
                &nbsp;
              </div>
              <span className="exchRate">{formattedExchangeRate}</span>
            </div>
          )}
          <div className="row">
            <span>{t("priceImpact")}</span>
            <span>{formattedPriceImpact}</span>
          </div>
          {formattedRoute && (
            <>
              <div className="row">
                <span>{t("route")}</span>
                <span>{formattedRoute}</span>
              </div>
              {isVirtualSwap && (
                <div className="row">
                  <span></span>
                  <span>
                    <a
                      href="https://docs.saddle.finance/saddle-faq#what-is-virtual-swap"
                      style={{ textDecoration: "underline" }}
                      target="_blank"
                      rel="noreferrer"
                    >
                      ({t("virtualSwap")})
                    </a>
                  </span>
                </div>
              )}
              {isVirtualSwap && isHighSlippage && (
                <div className="exchangeWarning">
                  {t("lowSlippageVirtualSwapWarning")}
                </div>
              )}
            </>
          )}
        </div>
        {account && isHighPriceImpact(exchangeRateInfo.priceImpact) ? (
          <div className="exchangeWarning">
            {t("highPriceImpact", {
              rate: formattedPriceImpact,
            })}
          </div>
        ) : null}
        {isVirtualSwap && (
          <div className="virtualSwapInfoBubble">
            <InfoIcon />
            {t("crossAssetSwapsUseVirtualSwaps")} {"<"}
            <a
              href="https://docs.saddle.finance/saddle-faq#what-is-virtual-swap"
              target="_blank"
              rel="noreferrer"
            >
              {t("learnMore")}
            </a>
            {">"}
          </div>
        )}
        <Center width="100%" className="submitButtonWrapper">
          <Button
            variant="primary"
            size="lg"
            width="100%"
            onClick={(): void => {
              setIsOpen(true)
            }}
            disabled={!!error || +toState.value <= 0}
          >
            {t("swap")}
          </Button>
          <div className={classNames({ showError: !!error }, "error")}>
            {error}
          </div>
        </Center>
        <Modal isOpen={isOpen} onClose={(): void => setIsOpen(false)}>
          <ReviewSwap
            onClose={(): void => setIsOpen(false)}
            onConfirm={async () => {
              setIsOpen(false)
              logEvent("swap", {
                from: fromState.symbol,
                to: toState.symbol,
              })
              preTransaction(TransactionType.SWAP)
              try {
                const receipt = (await onConfirmTransaction?.()) as ContractReceipt
                postTransaction(TransactionType.SWAP, receipt)
              } catch (e) {
                const error = e as { code: number; message: string }
                postTransaction(TransactionType.SWAP, null, {
                  code: error.code,
                  message: error.message,
                })
              }
            }}
            data={{
              from: fromState,
              to: toState,
              exchangeRateInfo,
              txnGasCost,
              swapType,
            }}
          />
        </Modal>
      </div>
    </div>
  )
}

export default SwapPage
