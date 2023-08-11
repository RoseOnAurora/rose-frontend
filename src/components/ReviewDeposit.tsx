import {
  Button,
  ButtonGroup,
  Center,
  Divider,
  Flex,
  Stack,
  Text,
} from "@chakra-ui/react"
import React, { ReactElement, useState } from "react"
import { commify, formatBNToPercentString, formatBNToString } from "../utils"
import { AppState } from "../state/index"
import { DepositTransaction } from "../types/transactions"
import HighPriceImpactConfirmation from "./HighPriceImpactConfirmation"
import ReviewInfoItem from "./ReviewInfoItem"
import ReviewItem from "./ReviewItem"
import { formatSlippageToString } from "../utils/slippage"
import { formatUnits } from "@ethersproject/units"
import { isHighPriceImpact } from "../utils/priceImpact"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

interface Props {
  onClose: () => void
  onConfirm: () => void
  transactionData: DepositTransaction
}

function ReviewDeposit({
  onClose,
  onConfirm,
  transactionData,
}: Props): ReactElement {
  const { t } = useTranslation()
  const { slippageCustom, slippageSelected } = useSelector(
    (state: AppState) => state.user,
  )
  const [hasConfirmedHighPriceImpact, setHasConfirmedHighPriceImpact] =
    useState(false)
  const isHighPriceImpactTxn = isHighPriceImpact(transactionData.priceImpact)

  return (
    <Stack p="10px">
      <Stack spacing={3}>
        <Text fontSize="18px" color="gray.100" fontWeight={700}>
          {t("depositing")}
        </Text>
        <Stack spacing={2}>
          {transactionData.from.items.map(({ token, amount }) => (
            <ReviewItem
              key={token.symbol}
              amount={commify(formatBNToString(amount, token.decimals))}
              icon={token.icon}
              symbol={token.symbol}
            />
          ))}
          <Flex justifyContent="space-between" alignItems="center">
            <Text as="span" color="gray.200" fontWeight={500}>
              <b>{t("total")}</b>
            </Text>
            <Text as="span" color="gray.50" fontWeight={700}>
              {commify(formatBNToString(transactionData.from.totalAmount, 18))}
            </Text>
          </Flex>
        </Stack>
        <Divider />
        <Text fontSize="18px" color="gray.100" fontWeight={700}>
          {t("receiving")}
        </Text>
        <ReviewItem
          amount={commify(
            formatBNToString(
              transactionData.to.item.amount,
              transactionData.to.item.token.decimals,
            ),
          )}
          icon={transactionData.to.item.token.icon}
          symbol={transactionData.to.item.token.symbol}
        />
        <Divider />
        <ReviewInfoItem
          label={t("shareOfPool")}
          value={formatBNToPercentString(transactionData.shareOfPool, 18)}
        />
        <ReviewInfoItem
          label={t("gas")}
          value={`${
            transactionData.txnGasCost?.amount
              ? formatUnits(transactionData.txnGasCost.amount, "gwei")
              : 0
          } GWEI`}
        />
        {transactionData.txnGasCost?.valueUSD && (
          <ReviewInfoItem
            label={t("estimatedTxCost")}
            value={`≈$${commify(
              formatBNToString(transactionData.txnGasCost.valueUSD, 18, 8),
            )}`}
          />
        )}
        <ReviewInfoItem
          label={t("maxSlippage")}
          value={`${formatSlippageToString(slippageSelected, slippageCustom)}%`}
        />
        <Divider />
        <Stack spacing={2}>
          <Text fontSize="18px" color="gray.100" fontWeight={700}>
            {t("rates")}
          </Text>
          <Stack spacing={1}>
            {transactionData.from.items.map(
              ({ token, singleTokenPriceUSD }) => (
                <ReviewInfoItem
                  key={token.symbol}
                  label={`1 ${token.symbol}`}
                  value={`≈$${commify(
                    formatBNToString(singleTokenPriceUSD, 18, 2),
                  )}`}
                />
              ),
            )}
            {[transactionData.to.item].map(({ token, singleTokenPriceUSD }) => (
              <ReviewInfoItem
                key={token.symbol}
                label={`1 ${token.symbol}`}
                value={`≈$${commify(
                  commify(formatBNToString(singleTokenPriceUSD, 18, 2)),
                )}`}
              />
            ))}
          </Stack>
        </Stack>
      </Stack>
      {isHighPriceImpactTxn && (
        <HighPriceImpactConfirmation
          checked={hasConfirmedHighPriceImpact}
          onCheck={(): void =>
            setHasConfirmedHighPriceImpact((prevState) => !prevState)
          }
        />
      )}
      <Stack spacing="30px" alignItems="center" p="15px">
        <Text fontSize="14px" color="gray.300" fontStyle="italic">
          {t("estimatedOutput")}
        </Text>
        <Center>
          <ButtonGroup isAttached>
            <Button
              onClick={onConfirm}
              isDisabled={isHighPriceImpactTxn && !hasConfirmedHighPriceImpact}
            >
              {t("confirmDeposit")}
            </Button>
            <Button onClick={onClose} variant="solid" borderRadius="12px">
              {t("cancel")}
            </Button>
          </ButtonGroup>
        </Center>
      </Stack>
    </Stack>
  )
}

export default ReviewDeposit
