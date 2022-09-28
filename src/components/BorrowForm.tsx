import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Stack,
  Text,
  Tooltip,
} from "@chakra-ui/react"
import { Field, FieldProps, Form, Formik } from "formik"
import React, { ReactElement, ReactNode, useState } from "react"
import ApprovalInfo from "./ApprovalInfo"
import { BigNumber } from "@ethersproject/bignumber"
import BorrowAdvancedOptions from "../components/BorrowAdvancedOptions"
import { ContractReceipt } from "@ethersproject/contracts"
import { CookAction } from "../hooks/useCook"
import { ErrorObj } from "../constants"
import { FaHandHoldingUsd } from "react-icons/fa"
import FormTitle from "./FormTitleOptions"
import FormWrapper from "./wrappers/FormWrapper"
import MaxFromBalance from "./input/MaxFromBalance"
import SafetyTag from "./SafetyTag"
import SingleTokenInput from "./input/SingleTokenInput"
import { TransactionType } from "../hooks/useChakraToast"
import { formatBNToString } from "../utils"
import parseStringToBigNumber from "../utils/parseStringToBigNumber"
import { parseUnits } from "@ethersproject/units"
import { useTranslation } from "react-i18next"

export interface BorrowFormTokenDetails {
  symbol: string
  icon: string
  decimals: number
  name: string
}

interface Props {
  borrowToken: BorrowFormTokenDetails
  collateralToken: BorrowFormTokenDetails
  max: string
  collateralUSDPrice: number
  formDescription?: ReactNode
  isStable?: boolean
  updateLiquidationPrice: (
    borrowAmount: string,
    collateralAmount: string,
  ) => string
  updatePositionHealth: (
    borrowAmount: string,
    collateralAmount: string,
  ) => number
  getMaxBorrow: (collateralAmount: string) => BigNumber
  borrowValidator: (
    borrowAmount: string,
    collateralAmount: string,
  ) => string | undefined
  collateralValidator: (amount: string) => string | undefined
  handleSubmit: (
    collateralAmount: string,
    borrowAmount: string,
    cookAction: CookAction,
    onMessageSignatureTransactionStart?: () => void,
    onApprovalTransactionStart?: () => void,
  ) => Promise<ContractReceipt | void>
  handleWhileSubmitting?: {
    onMessageSignatureTransactionStart?: () => void
    onApprovalTransactionStart?: () => void
  }
  handlePreSubmit?: (txnType: TransactionType) => void
  handlePostSubmit?: (
    receipt: ContractReceipt | null,
    transactionType: TransactionType,
    error?: { code: number; message: string },
  ) => void
  submitButtonLabelText: (
    borrow: string,
    collateral: string,
    borrowError: string | undefined,
    collateralError: string | undefined,
    txnType: TransactionType,
  ) => string | undefined
}

const BorrowForm = (props: Props): ReactElement => {
  const {
    borrowToken,
    collateralToken,
    max,
    formDescription,
    collateralUSDPrice,
    handleWhileSubmitting,
    isStable,
    updateLiquidationPrice,
    updatePositionHealth,
    getMaxBorrow,
    borrowValidator,
    collateralValidator,
    handleSubmit,
    handlePreSubmit,
    handlePostSubmit,
    submitButtonLabelText,
  } = props

  const { t } = useTranslation()
  const [sliderValue, setSliderValue] = useState(0)
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <FormWrapper
      formDescription={formDescription}
      formTitle={
        <FormTitle
          title={`Borrow ${borrowToken.symbol}`}
          popoverOptions={<BorrowAdvancedOptions />}
        />
      }
    >
      <Formik
        initialValues={{ collateral: "", borrow: "" }}
        onSubmit={async (values, actions) => {
          handlePreSubmit?.(TransactionType.BORROW)
          const collateralValueSafe = parseStringToBigNumber(
            values?.collateral,
            collateralToken.decimals,
          )
          const borrowValueSafe = parseStringToBigNumber(
            values?.borrow,
            borrowToken.decimals,
          )
          let receipt: ContractReceipt | null = null
          try {
            receipt = (await handleSubmit(
              collateralValueSafe.value.toString(),
              borrowValueSafe.value.toString(),
              CookAction.BORROW,
              handleWhileSubmitting?.onMessageSignatureTransactionStart,
              handleWhileSubmitting?.onApprovalTransactionStart,
            )) as ContractReceipt
            handlePostSubmit?.(receipt, TransactionType.BORROW)
          } catch (e) {
            console.error(e)
            const error = e as ErrorObj
            handlePostSubmit?.(receipt, TransactionType.BORROW, {
              code: error.code,
              message: error.message,
            })
          }
          actions.resetForm({ values: { collateral: "", borrow: "" } })
          setSliderValue(0)
        }}
        validate={(values) => {
          const collateral = collateralValidator(values.collateral)
          const borrow = borrowValidator(values.borrow, values.collateral)
          if (collateral || borrow) {
            return {
              collateral,
              borrow,
            }
          } else {
            setSliderValue(
              Math.round(
                Math.min(
                  +values?.borrow && values?.collateral
                    ? (+values.borrow /
                        collateralUSDPrice /
                        +values.collateral) *
                        100
                    : 0,
                  100,
                ),
              ),
            )
          }
        }}
      >
        {(props) => (
          <Form onSubmit={props.handleSubmit}>
            <Field name="collateral">
              {({
                field,
                form,
                meta,
              }: FieldProps<string, { [key: string]: string }>) => (
                <FormControl
                  padding="10px"
                  borderRadius="10px"
                  isInvalid={!!meta.error}
                >
                  <Flex justifyContent="space-between" alignItems="flex-end">
                    <FormLabel
                      fontSize="18px"
                      fontWeight={700}
                      htmlFor="amount"
                    >
                      Deposit Collateral
                    </FormLabel>
                    <MaxFromBalance
                      max={max}
                      onClickMax={() => {
                        props.setFieldTouched("collateral", true)
                        props.setFieldValue("collateral", max)
                        props.setFieldValue("borrow", "")
                      }}
                    />
                  </Flex>
                  <SingleTokenInput
                    inputValue={meta.value}
                    fieldProps={field}
                    isInvalid={!!meta?.error}
                    token={{
                      name: collateralToken.name,
                      symbol: collateralToken.symbol,
                      icon: collateralToken.icon,
                    }}
                    onChangeInput={field.onChange}
                  />
                  {form.errors?.collateral ? (
                    <FormErrorMessage color="red.600">
                      {form.errors?.collateral}
                    </FormErrorMessage>
                  ) : (
                    <FormHelperText mt="15px" fontSize="sm" as="p">
                      {+props.values.collateral !== 0 &&
                        `You are about to deposit ≈
                      $${(
                        collateralUSDPrice * +props.values.collateral
                      ).toFixed(2)}
                      ${collateralToken.symbol} as collateral.`}
                    </FormHelperText>
                  )}
                </FormControl>
              )}
            </Field>
            <Field name="borrow">
              {({
                field,
                form,
                meta,
              }: FieldProps<string, { [key: string]: string }>) => (
                <FormControl
                  padding="15px"
                  borderRadius="10px"
                  isInvalid={!!form.errors?.borrow}
                >
                  <Flex
                    justifyContent="space-between"
                    alignItems="baseline"
                    gridColumnGap="25px"
                    flexWrap={{ base: "wrap", md: "nowrap" }}
                  >
                    <FormLabel
                      fontSize="18px"
                      fontWeight={700}
                      htmlFor="amount"
                      whiteSpace="nowrap"
                    >
                      Borrow RUSD
                    </FormLabel>
                    <Stack spacing="10px" w="100%">
                      <Flex
                        gridGap="10px"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Text
                          color="gray.300"
                          fontSize={{ base: "13px", lg: "16px" }}
                        >
                          Expected Liquidation Price:
                        </Text>
                        <Text fontWeight={700} justifySelf="end">
                          {!form.errors.borrow && !form.errors.collateral
                            ? updateLiquidationPrice(
                                props.values.borrow,
                                props.values.collateral,
                              )
                            : "$xx.xxx"}
                        </Text>
                      </Flex>
                      <Flex
                        gridGap="10px"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Text
                          color="gray.300"
                          fontSize={{ base: "13px", lg: "16px" }}
                        >
                          Expected Position Health:
                        </Text>
                        <Text fontWeight={700} justifySelf="end">
                          {!form.errors.borrow && !form.errors.collateral
                            ? `${updatePositionHealth(
                                props.values.borrow,
                                props.values.collateral,
                              ).toFixed(0)}%`
                            : "xx%"}
                        </Text>
                      </Flex>

                      <Flex
                        gridGap="10px"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Text
                          color="gray.300"
                          fontSize={{ base: "13px", lg: "16px" }}
                        >
                          Expected Risk:
                        </Text>
                        <Box justifySelf="end">
                          <SafetyTag
                            safetyScore={updatePositionHealth(
                              props.values.borrow,
                              props.values.collateral,
                            )}
                            isStable={isStable}
                          />
                        </Box>
                      </Flex>
                    </Stack>
                  </Flex>
                  <Box p="10px">
                    <Slider
                      id="slider"
                      value={sliderValue}
                      min={0}
                      max={100}
                      mb="40px"
                      mt="20px"
                      isDisabled={
                        !!form.errors?.collateral ||
                        +props.values.collateral === 0
                      }
                      focusThumbOnChange={false}
                      onChange={(v) => {
                        setSliderValue(v)
                        props.setFieldValue(
                          "borrow",
                          formatBNToString(
                            parseUnits(props.values?.collateral || "0", 18)
                              .mul(
                                parseUnits(String(collateralUSDPrice || 0), 18),
                              )
                              .div(BigNumber.from(10).pow(18))
                              .mul(BigNumber.from(v).shl(18))
                              .div(BigNumber.from(100).shl(18)),
                            18,
                          ),
                        )
                      }}
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
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
                      <SliderTrack>
                        <SliderFilledTrack bg="red.500" />
                      </SliderTrack>
                      <Tooltip
                        hasArrow
                        color="gray.900"
                        bg="red.400"
                        placement="top"
                        isOpen={showTooltip}
                        label={`${sliderValue}%`}
                      >
                        <SliderThumb boxSize={6}>
                          <Box
                            boxSize={4}
                            color="red.400"
                            as={FaHandHoldingUsd}
                          />
                        </SliderThumb>
                      </Tooltip>
                    </Slider>
                  </Box>
                  <Flex justifyContent="flex-end" alignItems="center">
                    <MaxFromBalance
                      max={formatBNToString(
                        getMaxBorrow(props.values.collateral),
                        18,
                        3,
                      )}
                      label={t("max")}
                      onClickMax={() => {
                        const borrowMax = formatBNToString(
                          getMaxBorrow(props.values.collateral),
                          18,
                        )
                        props.setFieldTouched("borrow", true)
                        props.setFieldValue("borrow", borrowMax)
                      }}
                    />
                  </Flex>
                  <SingleTokenInput
                    inputValue={meta.value}
                    fieldProps={field}
                    isInvalid={!!meta.error}
                    token={{
                      name: borrowToken.name,
                      symbol: borrowToken.symbol,
                      icon: borrowToken.icon,
                    }}
                    onChangeInput={(e) => {
                      field.onChange(e)
                      const decimalRegex = /^[0-9]\d*(\.\d{1,18})?$/
                      const formattedVal = decimalRegex.exec(e.target.value)
                        ? +e.target.value
                        : 0
                      setSliderValue(
                        Math.round(
                          Math.min(
                            (formattedVal /
                              collateralUSDPrice /
                              (+props.values?.collateral || 1)) *
                              100,
                            100,
                          ),
                        ),
                      )
                    }}
                  />
                  {meta.error ? (
                    <FormErrorMessage color="red.600">
                      {form.errors?.borrow}
                    </FormErrorMessage>
                  ) : (
                    <FormHelperText mt="15px" fontSize="sm" as="p">
                      {+props.values.borrow !== 0 &&
                        `You are about to borrow ≈
                      ${(+props.values.borrow).toFixed(2)} ${
                          borrowToken.symbol
                        }.`}
                    </FormHelperText>
                  )}
                </FormControl>
              )}
            </Field>
            <Stack
              spacing={5}
              borderRadius="10px"
              py="15px"
              px={{ base: "5px", md: "15px" }}
            >
              <Button
                fontSize={{ base: "12px", sm: "16px" }}
                width="100%"
                type="submit"
                disabled={
                  props.errors.borrow !== undefined ||
                  props.errors.collateral !== undefined ||
                  (+props.values.borrow === 0 && +props.values.collateral === 0)
                }
              >
                {submitButtonLabelText(
                  props.values.borrow,
                  props.values.collateral,
                  props.errors.borrow,
                  props.errors.collateral,
                  TransactionType.BORROW,
                )}
              </Button>
              <ApprovalInfo />
            </Stack>
          </Form>
        )}
      </Formik>
    </FormWrapper>
  )
}

export default BorrowForm
