import {
  Button,
  ButtonGroup,
  Center,
  Divider,
  Stack,
  Text,
} from "@chakra-ui/react"
import React, { ReactElement, useState } from "react"
import { commify, formatBNToString } from "../utils"
import { AppState } from "../state/index"
import HighPriceImpactConfirmation from "./HighPriceImpactConfirmation"
import ReviewInfoItem from "./ReviewInfoItem"
import ReviewItem from "./ReviewItem"
import { ReviewWithdrawData } from "./Withdraw"
import { formatSlippageToString } from "../utils/slippage"
import { formatUnits } from "@ethersproject/units"
import { isHighPriceImpact } from "../utils/priceImpact"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

interface Props {
  onClose: () => void
  onConfirm: () => void
  data: ReviewWithdrawData
}

function ReviewWithdraw({ onClose, onConfirm, data }: Props): ReactElement {
  const { t } = useTranslation()
  const { slippageCustom, slippageSelected } = useSelector(
    (state: AppState) => state.user,
  )
  const [hasConfirmedHighPriceImpact, setHasConfirmedHighPriceImpact] =
    useState(false)
  const isHighSlippageTxn = isHighPriceImpact(data.priceImpact)

  return (
    <Stack p="10px">
      <Stack spacing={3}>
        <Text fontSize="18px" color="gray.100" fontWeight={700}>
          {t("youWillReceive")}
        </Text>
        <Stack spacing={2}>
          {data.withdraw.map((token) => (
            <ReviewItem
              key={token.name}
              amount={token.value}
              icon={token.icon}
              symbol={token.name}
            />
          ))}
        </Stack>
      </Stack>
      <Divider />
      <ReviewInfoItem
        label={t("gas")}
        value={`${
          data.txnGasCost?.amount
            ? formatUnits(data.txnGasCost.amount, "gwei")
            : 0
        } GWEI`}
      />
      {data.txnGasCost?.valueUSD && (
        <ReviewInfoItem
          label={t("estimatedTxCost")}
          value={`≈$${commify(
            formatBNToString(data.txnGasCost.valueUSD, 18, 8),
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
          {data.rates.map(({ name, rate }, index) => (
            <ReviewInfoItem
              key={index}
              label={`1 ${name}`}
              value={`$${rate}`}
            />
          ))}
        </Stack>
      </Stack>
      {isHighSlippageTxn && (
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
              isDisabled={isHighSlippageTxn && !hasConfirmedHighPriceImpact}
            >
              {t("confirmWithdraw")}
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

export default ReviewWithdraw
