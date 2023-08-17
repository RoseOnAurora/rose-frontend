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
  useDisclosure,
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
import React, {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import { SwapFormValues, SwapState, SwapTokenOption } from "../../types/swap"
import {
  calculatePrice,
  commify,
  fixDecimalsOnRawVal,
  formatBNToPercentString,
  formatBNToString,
} from "../../utils"
import { AppState } from "../../state"
import ApprovalInfo from "../ApprovalInfo"
import { ContractReceipt } from "@ethersproject/contracts"
import MultiTokenInput from "../input/MultiTokenInput"
import SwapInfo from "./SwapInfo"
import SwapTokenSelectModal from "./SwapTokenSelectModal"
import { TOKENS_MAP } from "../../constants"
import { Zero } from "@ethersproject/constants"
import { basicTokenInputValidator } from "../../utils/validators"
import i18next from "i18next"
import { isHighPriceImpact } from "../../utils/priceImpact"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

interface SwapFormProps {
  tokenOptions: {
    from: SwapTokenOption[]
    to: SwapTokenOption[]
  }
  swapData: SwapState
  onUpdateFrom: (fromSymbol: string | undefined) => void
  onUpdateTo: (toSymbol: string | undefined) => void
  onSwitchDirection: (fromAmount: string) => void
  onCalculateSwapAmount: (amount: string) => Promise<void> | undefined
  onSubmit: (amount: string) => Promise<ContractReceipt | void>
}

const InnerSwapForm = (
  props: SwapFormProps & FormikProps<SwapFormValues>,
): ReactElement => {
  const {
    values,
    isSubmitting,
    isValid,
    errors,
    isValidating,
    tokenOptions,
    swapData,
    setFieldValue,
    onSwitchDirection,
    onUpdateFrom,
    onUpdateTo,
  } = props

  // hooks
  const { t } = useTranslation()
  const { isOpen, onOpen, onClose } = useDisclosure()

  // state
  const { tokenPricesUSD } = useSelector((state: AppState) => state.application)
  const [modalTokenOptions, setModalTokenOptions] = useState(tokenOptions.from)
  const [inputField, setInputField] = useState<"from" | "to">("from")
  const [isLoading, setIsLoading] = useState(false)

  // to and from tokens
  const toToken = useMemo(() => {
    return tokenOptions.to.find(({ symbol }) => symbol === swapData.to.symbol)
  }, [tokenOptions.to, swapData.to.symbol])
  const fromToken = useMemo(() => {
    return tokenOptions.from.find(
      ({ symbol }) => symbol === swapData.from.symbol,
    )
  }, [tokenOptions.from, swapData.from.symbol])

  // formatted from token balance
  const formattedBalance = commify(
    formatBNToString(fromToken?.amount || Zero, fromToken?.decimals || 0, 6),
  )

  // get the to and from tokens in USD
  const fromUSDValue = useMemo(
    () => calculatePrice(values.from, tokenPricesUSD?.[swapData.from.symbol]),
    [values.from, tokenPricesUSD, swapData.from.symbol],
  )
  const toUSDValue = useMemo(
    () => calculatePrice(values.to, tokenPricesUSD?.[swapData.to.symbol]),
    [values.to, tokenPricesUSD, swapData.to.symbol],
  )

  // handlers
  const onModalOpen = useCallback(
    (option: "from" | "to") => {
      setInputField(option)
      setModalTokenOptions(tokenOptions[option])
      onOpen()
    },
    [tokenOptions, onOpen],
  )

  // generically listen for input changes to calculate swap amount
  useEffect(() => {
    const toValue = formatBNToString(
      swapData.to.value,
      toToken?.decimals || 18,
      toToken?.decimals || 18,
    )
    if (errors.from === t("Invalid number.") || +values.from === 0) {
      setFieldValue("to", "0.0")
      return
    }
    if ((!!values.from.trim() && toValue !== values.to) || +values.to === 0) {
      setFieldValue("to", toValue)
      setFieldValue("from", values.from)
    }
  }, [
    swapData,
    values.from,
    values.to,
    errors.from,
    toToken?.decimals,
    isValidating,
    t,
    setFieldValue,
  ])

  // UI loading animation
  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (isLoading) {
      timeout = setTimeout(() => setIsLoading(false), 750)
    }
    return () => clearTimeout(timeout)
  }, [isLoading])

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
                    props.setFieldValue("from", balance)
                    setIsLoading(true)
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
              inputProps={{ isDisabled: isSubmitting }}
              onToggleTokenSelect={() => onModalOpen("from")}
              onChangeInput={(e) => {
                props.handleChange(e)
                setIsLoading(true)
              }}
            />
            <Flex justifyContent="space-between" alignItems="center" w="full">
              {!!meta.error && (
                <FormErrorMessage color="red.600" whiteSpace="nowrap">
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
                  ≈${commify(formatBNToString(fromUSDValue, 18, 2))}
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
          setFieldValue(
            "from",
            fixDecimalsOnRawVal(
              values.from,
              swapData.from.symbol,
              swapData.to.symbol,
            ),
          )
          onSwitchDirection(values.from)
          setIsLoading(true)
        }}
        isDisabled={
          !fromToken ||
          !toToken ||
          isSubmitting ||
          errors.from === t("Invalid number.")
        }
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
              onToggleTokenSelect={() => onModalOpen("to")}
              onChangeInput={props.handleChange}
            />
            <Flex justifyContent="flex-end" w="full" overflow="hidden">
              <Text
                textAlign="right"
                fontSize="12px"
                fontWeight={400}
                color="gray.300"
              >
                ≈${commify(formatBNToString(toUSDValue, 18, 2))}
              </Text>
            </Flex>
          </FormControl>
        )}
      </Field>
      <Collapse
        in={!!fromToken && !!toToken && errors.from !== t("Invalid number.")}
        animateOpacity
      >
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
              loading={isLoading}
            />
          </Box>
        )}
      </Collapse>
      <Fade in={isHighPriceImpact(swapData.priceImpact)}>
        {isHighPriceImpact(swapData.priceImpact) && (
          <Flex
            color="gray.900"
            bgColor="red.600"
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
          isDisabled={
            !isValid || isSubmitting || !+props.values.from || !+props.values.to
          }
        >
          {t("swap")}
        </Button>
      </Center>
      <ApprovalInfo />
      <SwapTokenSelectModal
        tokens={modalTokenOptions}
        isOpen={isOpen}
        onClose={onClose}
        onSelectToken={(symbol) => {
          if (inputField === "from") onUpdateFrom(symbol)
          else onUpdateTo(symbol)
          setIsLoading(true)
        }}
      />
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
    if (!errors.from || errors.from !== i18next.t("Invalid number.")) {
      void props.onCalculateSwapAmount(values.from)
    }
    return errors
  },
  handleSubmit: async (values, bag) => {
    await bag.props.onSubmit(values.from)
    bag.resetForm({ values: { from: "", to: "" } })
  },
})(InnerSwapForm)

export default SwapForm
