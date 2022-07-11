import {
  Box,
  Button,
  Center,
  Collapse,
  Fade,
  Flex,
  FormControl,
  FormErrorMessage,
  Text,
} from "@chakra-ui/react"
import { FaArrowDown, FaArrowUp } from "react-icons/fa"
import {
  Field,
  FieldProps,
  Form,
  FormikErrors,
  FormikProps,
  withFormik,
} from "formik"
import React, { ReactElement, useEffect, useMemo } from "react"
import { SwapFormValues, SwapState, SwapTokenOption } from "../../types/swap"
import { commify, formatBNToPercentString, formatBNToString } from "../../utils"
import { ContractReceipt } from "@ethersproject/contracts"
import MultiTokenInput from "../input/MultiTokenInput"
import SwapInfo from "./SwapInfo"
import { TOKENS_MAP } from "../../constants"
import { Zero } from "@ethersproject/constants"
import { basicTokenInputValidator } from "../../utils/validators"
import i18next from "i18next"
import { isHighPriceImpact } from "../../utils/priceImpact"
import { useTranslation } from "react-i18next"

interface SwapFormProps {
  tokenOptions: {
    from: SwapTokenOption[]
    to: SwapTokenOption[]
  }
  swapData: SwapState
  onSwitchDirection: () => void
  onChooseToken: (option: "from" | "to") => void
  onInputChange: (amount: string) => void
  onCalculateSwapAmount: (amount: string) => Promise<void> | undefined
  onSubmit: (
    amount?: string,
    onApprovalTransactionStart?: () => void,
  ) => Promise<ContractReceipt | void>
}

const InnerSwapForm = (
  props: SwapFormProps & FormikProps<SwapFormValues>,
): ReactElement => {
  const {
    values,
    setFieldValue,
    isSubmitting,
    isValidating,
    tokenOptions,
    swapData,
    onSwitchDirection,
    onChooseToken,
    onInputChange,
  } = props
  // hooks
  const { t } = useTranslation()

  // state
  const fromToken = useMemo(() => {
    return tokenOptions.from.find(
      ({ symbol }) => symbol === swapData.from.symbol,
    )
  }, [tokenOptions.from, swapData.from.symbol])

  const toToken = useMemo(() => {
    return tokenOptions.to.find(({ symbol }) => symbol === swapData.to.symbol)
  }, [tokenOptions.to, swapData.to.symbol])

  const formattedBalance = commify(
    formatBNToString(fromToken?.amount || Zero, fromToken?.decimals || 0, 6),
  )

  // generically listen for input changes to calculate swap amount
  useEffect(() => {
    const toValue = formatBNToString(
      swapData.to.value,
      toToken?.decimals || 18,
      toToken?.decimals || 18,
    )
    if (
      (!!values.from.trim() && toValue !== values.to) ||
      (+values.to === 0 && !isSubmitting && !isValidating)
    ) {
      setFieldValue("to", toValue)
      setFieldValue("from", values.from)
    }
  }, [swapData, setFieldValue])

  return (
    <Form style={{ width: "100%" }}>
      <Field name="from">
        {({ field, meta }: FieldProps<string, SwapFormValues>) => (
          <FormControl isInvalid={!!meta.error}>
            <Flex justifyContent="space-between" alignItems="center" w="full">
              <Text
                fontSize="12px"
                fontWeight={700}
                lineHeight="14px"
                textTransform="uppercase"
                color="gray.100"
              >
                {t("from")}
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
                  onClick={() => {
                    const balance = formatBNToString(
                      fromToken?.amount || Zero,
                      fromToken?.decimals || 18,
                      18,
                    )
                    onInputChange(balance)
                    props.setFieldValue("from", balance)
                  }}
                >
                  {formattedBalance}
                </Text>
              </Flex>
            </Flex>
            <MultiTokenInput
              selectedToken={TOKENS_MAP[swapData.from.symbol]}
              inputValue={meta.value}
              fieldProps={field}
              isInvalid={!!meta.error}
              onToggleTokenSelect={() => onChooseToken("from")}
              onChangeInput={(e) => {
                props.handleChange(e)
                onInputChange(e.target.value)
              }}
            />
            <Flex justifyContent="space-between" alignItems="center" w="full">
              {!!meta.error && (
                <FormErrorMessage color="red.400" whiteSpace="nowrap">
                  {meta.error}
                </FormErrorMessage>
              )}
              <Flex justifyContent="flex-end" w="full" overflow="hidden">
                <Text
                  textAlign="right"
                  fontSize="12px"
                  fontWeight={400}
                  color="gray.300"
                >
                  ≈$
                  {commify(formatBNToString(swapData.from.valueUSD, 18, 2))}
                </Text>
              </Flex>
            </Flex>
          </FormControl>
        )}
      </Field>
      <Button
        variant="solid"
        size="md"
        m="auto"
        onClick={() => {
          onSwitchDirection()
        }}
        disabled={!fromToken || !toToken || isSubmitting}
      >
        <FaArrowUp size="1em" />
        <FaArrowDown size="1em" />
      </Button>
      <Field name="to">
        {({ field, meta }: FieldProps<string, SwapFormValues>) => (
          <FormControl>
            <Flex justifyContent="flex-start" w="full">
              <Text
                fontSize="12px"
                fontWeight={700}
                lineHeight="14px"
                textTransform="uppercase"
                color="gray.100"
                textAlign="right"
              >
                {t("to")}
              </Text>
            </Flex>
            <MultiTokenInput
              selectedToken={TOKENS_MAP[swapData.to.symbol]}
              inputValue={meta.value}
              fieldProps={field}
              isInvalid={false}
              readOnly={true}
              onToggleTokenSelect={() => onChooseToken("to")}
              onChangeInput={props.handleChange}
            />
            <Flex justifyContent="flex-end" w="full" overflow="hidden">
              <Text
                textAlign="right"
                fontSize="12px"
                fontWeight={400}
                color="gray.300"
              >
                ≈$
                {commify(formatBNToString(swapData.to.valueUSD, 18, 2))}
              </Text>
            </Flex>
          </FormControl>
        )}
      </Field>
      <Collapse in={!!fromToken && !!toToken} animateOpacity>
        {fromToken && toToken && (
          <Box mt="15px">
            <SwapInfo
              exchangeRateInfo={{
                pair: `${fromToken.symbol}/${toToken.symbol}`,
                exchangeRate: swapData.exchangeRate,
                priceImpact: swapData.priceImpact,
              }}
              swapType={swapData.swapType}
              from={{ icon: fromToken.icon, symbol: fromToken.symbol }}
              to={{ icon: toToken.icon, symbol: toToken.symbol }}
            />
          </Box>
        )}
      </Collapse>
      <Fade in={isHighPriceImpact(swapData.priceImpact)}>
        {isHighPriceImpact(swapData.priceImpact) && (
          <Flex
            color="gray.900"
            bgColor="red.400"
            w="full"
            p="8px"
            borderRadius="8px"
            justifyContent="center"
          >
            {t("highPriceImpact", {
              rate: commify(formatBNToPercentString(swapData.priceImpact, 18)),
            })}
          </Flex>
        )}
      </Fade>
      <Center width="100%" mt="20px">
        <Button
          width="100%"
          type="submit"
          isLoading={isSubmitting}
          disabled={
            !!props.errors.from ||
            !!props.errors.to ||
            !+props.values.from ||
            !+props.values.to
          }
        >
          {t("swap")}
        </Button>
      </Center>
    </Form>
  )
}

const SwapForm = withFormik<SwapFormProps, SwapFormValues>({
  mapPropsToValues: () => {
    return {
      from: "",
      to: "",
    }
  },
  validate: (values: SwapFormValues, props: SwapFormProps) => {
    const errors: FormikErrors<SwapFormValues> = {}
    const fromToken = props.tokenOptions.from.find(
      ({ symbol }) => symbol === props.swapData.from.symbol,
    )
    if (!fromToken) return errors
    const validation = basicTokenInputValidator(
      values.from,
      fromToken?.decimals,
      fromToken?.amount || Zero,
    )
    if (validation) {
      errors.from = validation
    }
    if (
      (!errors.from || errors.from === i18next.t("insufficientBalance")) &&
      values.from
    ) {
      void props.onCalculateSwapAmount(values.from)
    }
    return errors
  },
  handleSubmit: async (values, bag) => {
    await bag.props.onSubmit()
    bag.resetForm({ values: { from: "", to: "" } })
  },
})(InnerSwapForm)

export default SwapForm
