import "./DepositPage.scss"

import {
  ALETH_POOL_NAME,
  FRAX_STABLES_LP_POOL_NAME,
  UST_METAPOOL_NAME,
  VETH2_POOL_NAME,
  isMetaPool,
} from "../constants"
import { Button, Center } from "@chakra-ui/react"
import ConfirmTransaction, { ModalType } from "./ConfirmTransaction"
import { PoolDataType, UserShareType } from "../hooks/usePoolData"
import React, { ReactElement, useState } from "react"
import { Trans, useTranslation } from "react-i18next"

import AdvancedOptions from "./AdvancedOptions"
import BackButton from "./BackButton"
import { ContractReceipt } from "@ethersproject/contracts"
import { DepositTransaction } from "../interfaces/transactions"
import LPStakingBanner from "./LPStakingBanner"
import Modal from "./Modal"
import MyShareCard from "./MyShareCard"
import PoolInfoCard from "./PoolInfoCard"
import ReviewDeposit from "./ReviewDeposit"
// import { Switch } from "@chakra-ui/react"
import TokenInput from "./TokenInput"
import TopMenu from "./TopMenu"
import { Zero } from "@ethersproject/constants"
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
  myShareData: UserShareType | null
  transactionData: DepositTransaction
}

/* eslint-enable @typescript-eslint/no-explicit-any */
const DepositPage = (props: Props): ReactElement => {
  const { t } = useTranslation()
  const {
    tokens,
    exceedsWallet,
    poolData,
    myShareData,
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
    <div className="deposit">
      <TopMenu activeTab={"deposit"} />
      {poolData?.aprs?.keep?.apr.gt(Zero) &&
        myShareData?.lpTokenBalance.gt(0) && (
          <LPStakingBanner
            stakingLink={"https://dashboard.keep.network/liquidity"}
          />
        )}
      {poolData?.name === VETH2_POOL_NAME &&
        myShareData?.lpTokenBalance.gt(0) && (
          <LPStakingBanner stakingLink={"https://www.sharedstake.org/earn"} />
        )}
      {poolData?.name === ALETH_POOL_NAME &&
        myShareData?.lpTokenBalance.gt(0) && (
          <LPStakingBanner stakingLink={"https://app.alchemix.fi/farms"} />
        )}

      <div className="content">
        <div className="left">
          <div className="form">
            <h3>{t("addLiquidity")}</h3>
            {exceedsWallet ? (
              <div className="error">{t("depositBalanceExceeded")}</div>
            ) : null}
            {poolData?.isPaused && poolData?.name === VETH2_POOL_NAME ? (
              <div className="error">
                <Trans i18nKey="sgtPoolPaused" t={t}>
                  This pool is paused, please see{" "}
                  <a
                    href="https://medium.com/immunefi/sharedstake-insider-exploit-postmortem-17fa93d5c90e"
                    target="_blank"
                    rel="noreferrer"
                    style={{ textDecoration: "underline" }}
                  >
                    this postmortem
                  </a>{" "}
                  for more information.
                </Trans>
              </div>
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
            {shouldDisplayWrappedOption && (
              <p className="wrappedInfo">
                Deposit to the{" "}
                <a href="/#/pools/stables/deposit">Stables Pool</a> to get
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
                      Allbridge
                    </a>
                    .
                  </>
                )}
              </p>
            )}
            {poolData?.name === FRAX_STABLES_LP_POOL_NAME && (
              <p className="wrappedInfo">
                This pool is outdated. Please{" "}
                <a href="/#/pools/frax-stableslp/withdraw">
                  go here to withdraw any liquidity
                </a>{" "}
                from this pool and{" "}
                <a href="/#/pools/frax/deposit">
                  use the new Frax pool instead
                </a>
                .
              </p>
            )}
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
            <div className={"transactionInfoContainer"}>
              <div className="transactionInfo">
                {poolData?.aprs?.keep?.apr.gt(Zero) && (
                  <div className="transactionInfoItem">
                    <a
                      href="https://docs.saddle.finance/faq#what-are-saddles-liquidity-provider-rewards"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>{`KEEP APR:`}</span>
                    </a>{" "}
                    <span className="value">
                      {formatBNToPercentString(poolData.aprs.keep.apr, 18)}
                    </span>
                  </div>
                )}
                {poolData?.aprs?.sharedStake?.apr.gt(Zero) && (
                  <div className="transactionInfoItem">
                    <a
                      href="https://docs.saddle.finance/faq#what-are-saddles-liquidity-provider-rewards"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>{`SGT APR:`}</span>
                    </a>{" "}
                    <span className="value">
                      {formatBNToPercentString(
                        poolData.aprs.sharedStake.apr,
                        18,
                      )}
                    </span>
                  </div>
                )}
                <div className="transactionInfoItem">
                  {transactionData.priceImpact.gte(0) ? (
                    <span className="bonus">{`${t("bonus")}: `}</span>
                  ) : (
                    <span className="slippage">{t("priceImpact")}</span>
                  )}
                  <span
                    className={
                      "value " +
                      (transactionData.priceImpact.gte(0)
                        ? "bonus"
                        : "slippage")
                    }
                  >
                    {" "}
                    {formatBNToPercentString(
                      transactionData.priceImpact,
                      18,
                      4,
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <BackButton
            route="/pools"
            wrapperClass="goBack"
            buttonText="Go back to pools"
          />
          <AdvancedOptions />
          <Center width="100%" py={6}>
            <Button
              variant="primary"
              size="lg"
              width="240px"
              onClick={(): void => {
                setCurrentModal("review")
              }}
              disabled={!validDepositAmount || poolData?.isPaused}
            >
              {t("deposit")}
            </Button>
          </Center>
        </div>
        <div className="infoPanels">
          <MyShareCard data={myShareData} />
          <div
            style={{
              display: myShareData ? "block" : "none",
            }}
            className="divider"
          ></div>{" "}
          <PoolInfoCard data={poolData} />
        </div>
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
                logEvent(
                  "deposit",
                  (poolData && { pool: poolData?.name }) || {},
                )
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
                    blockscout.
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
      </div>
    </div>
  )
}

export default DepositPage
