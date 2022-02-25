import "./DepositPage.scss"

import { Box, Button, Center } from "@chakra-ui/react"
import ConfirmTransaction, { ModalType } from "./ConfirmTransaction"
import {
  FRAX_STABLES_LP_POOL_NAME,
  UST_METAPOOL_NAME,
  isMetaPool,
} from "../constants"
import React, { ReactElement, useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import AdvancedOptions from "./AdvancedOptions"
import { BsSliders } from "react-icons/bs"
import { ContractReceipt } from "@ethersproject/contracts"
import { DepositTransaction } from "../interfaces/transactions"
import { IconButtonPopover } from "./Popover"
import Modal from "./Modal"
import { PoolDataType } from "../hooks/usePoolData"
import ReviewDeposit from "./ReviewDeposit"
import TokenInput from "./TokenInput"
import { formatBNToPercentString } from "../utils"
import { getEtherscanLink } from "../utils/getEtherscanLink"
import { logEvent } from "../utils/googleAnalytics"

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Props {
  title: string
  onConfirmTransaction: () => Promise<ContractReceipt | void>
  onChangeTokenInputValue: (tokenSymbol: string, value: string) => void
  onToggleDepositWrapped: () => void
  shouldDepositWrapped: boolean
  tokens: Array<{
    symbol: string
    name: string
    icon: string
    max: string
    inputValue: string
  }>
  exceedsWallet: boolean
  selected?: { [key: string]: any }
  poolData: PoolDataType | null
  transactionData: DepositTransaction
}

/* eslint-enable @typescript-eslint/no-explicit-any */
const DepositPage = (props: Props): ReactElement => {
  const { t } = useTranslation()
  const {
    tokens,
    exceedsWallet,
    poolData,
    transactionData,
    // shouldDepositWrapped,
    onChangeTokenInputValue,
    onConfirmTransaction,
    // onToggleDepositWrapped,
  } = props

  const [currentModal, setCurrentModal] = useState<string | null>(null)
  const [txnHash, setTxnHash] = useState<string | undefined>(undefined)

  const validDepositAmount =
    transactionData.to.totalAmount.gt(0) && !exceedsWallet
  const shouldDisplayWrappedOption = isMetaPool(poolData?.name)

  return (
    <Box>
      <Modal
        isOpen={!!currentModal}
        onClose={(): void => setCurrentModal(null)}
      >
        {currentModal === "review" ? (
          <ReviewDeposit
            transactionData={transactionData}
            onConfirm={(): void => {
              setTxnHash(undefined)
              setCurrentModal(ModalType.CONFIRM)
              logEvent("deposit", (poolData && { pool: poolData?.name }) || {})
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
                ? t("txFailed_internal", { tx: t("deposit") })
                : undefined
            }
          >
            {txnHash && (
              <Trans i18nKey="txFailed" t={t}>
                {{ tx: t("deposit") }}
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
            description={t("txConfirmed_deposit")}
            type={ModalType.SUCCESS}
          />
        ) : null}
      </Modal>
      <div className="form">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <h3>{t("addLiquidity")}</h3>
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
        {exceedsWallet ? (
          <div className="error">{t("depositBalanceExceeded")}</div>
        ) : null}
        {/* disable deposit wrapped button until gas limit is raised on aurora */}
        {/* {shouldDisplayWrappedOption && (
              <div className="wrappedDeposit">
                <Switch
                  colorScheme="red"
                  onChange={onToggleDepositWrapped}
                  isChecked={shouldDepositWrapped}
                />
                <span>
                  <small>{t("depositWrapped")}</small>
                </span>
              </div>
            )} */}
        {tokens.map((token, index) => (
          <div key={index}>
            <TokenInput
              {...token}
              disabled={poolData?.isPaused}
              onChange={(value): void =>
                onChangeTokenInputValue(token.symbol, value)
              }
            />
            {index === tokens.length - 1 ? (
              ""
            ) : (
              <div className="formSpace"></div>
            )}
          </div>
        ))}
        <div className="transactionInfo">
          <div className="transactionInfoItem">
            {transactionData.priceImpact.gte(0) ? (
              <span className="bonus">{`${t("bonus")}: `}</span>
            ) : (
              <span className="slippage">{t("priceImpact")}</span>
            )}
            <span
              className={
                "value " +
                (transactionData.priceImpact.gte(0) ? "bonus" : "slippage")
              }
            >
              {" "}
              {formatBNToPercentString(transactionData.priceImpact, 18, 4)}
            </span>
          </div>
        </div>
      </div>
      {shouldDisplayWrappedOption && (
        <div className="options">
          <p className="wrappedInfo">
            Deposit to the <a href="/#/pools/stables">Stables Pool</a> to get
            RoseStablesLP.{" "}
            {poolData?.name === UST_METAPOOL_NAME && (
              <>
                Get atUST by bridging UST from Terra on{" "}
                <a
                  href="https://app.allbridge.io/bridge?from=TRA&to=AURO&asset=UST"
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: "underline", margin: 0 }}
                >
                  Allbridge.
                </a>
              </>
            )}
          </p>
        </div>
      )}
      {poolData?.name === FRAX_STABLES_LP_POOL_NAME && (
        <div className="options">
          <p className="wrappedInfo">
            This pool is outdated. Please{" "}
            <a href="/#/pools/frax-stableslp">
              go here to withdraw any liquidity
            </a>{" "}
            from this pool and{" "}
            <a href="/#/pools/frax">use the new Frax pool instead.</a>
          </p>
        </div>
      )}
      <div className="options" style={{ height: "100%" }}>
        <Center width="100%">
          <Button
            variant="primary"
            size="lg"
            width="100%"
            onClick={(): void => {
              setCurrentModal("review")
            }}
            disabled={!validDepositAmount || poolData?.isPaused}
          >
            {t("deposit")}
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

export default DepositPage
