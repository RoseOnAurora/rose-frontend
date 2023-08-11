import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Stack,
  Text,
} from "@chakra-ui/react"
import { Field, FieldProps, Form, Formik } from "formik"
import React, { ReactElement, ReactNode } from "react"
import ApprovalInfo from "./ApprovalInfo"
import { BigNumber } from "@ethersproject/bignumber"
import BorrowAdvancedOptions from "./BorrowAdvancedOptions"
import { ContractReceipt } from "@ethersproject/contracts"
import { CookAction } from "../hooks/useCook"
import FormTitle from "./FormTitleOptions"
import FormWrapper from "./wrappers/FormWrapper"
import MaxFromBalance from "./input/MaxFromBalance"
import SafetyTag from "./SafetyTag"
import SingleTokenInput from "./input/SingleTokenInput"
import { TransactionType } from "../hooks/useChakraToast"
import { formatBNToString } from "../utils"
import parseStringToBigNumber from "../utils/parseStringToBigNumber"
import { useTranslation } from "react-i18next"

export interface RepayFormTokenDetails {
  symbol: string
  icon: string
  decimals: number
  name: string
}

interface Props {
  borrowToken: RepayFormTokenDetails
  collateralToken: RepayFormTokenDetails
  max: string
  collateralUSDPrice: number
  isStable?: boolean
  formDescription?: ReactNode
  maxRepayBn: BigNumber
  maxCollateralBn: BigNumber
  updateLiquidationPrice: (
    borrowAmount: string,
    collateralAmount: string,
    negate: boolean,
  ) => string
  updatePositionHealth: (
    borrowAmount: string,
    collateralAmount: string,
    negate: boolean,
  ) => number
  getMaxWithdraw: (repayAmount: string) => BigNumber
  repayValidator: (amount: string) => string | undefined
  collateralValidator: (
    borrowAmount: string,
    collateralAmount: string,
  ) => string | undefined
  handleSubmit: (
    collateralAmount: string,
    borrowAmount: string,
    cookAction: CookAction,
    onMessageSignatureTransactionStart?: () => void,
    onApprovalTransactionStart?: () => void,
    repayMax?: boolean,
  ) => Promise<ContractReceipt | void>
  handleWhileSubmitting?: {
    onMessageSignatureTransactionStart?: () => void
    onApprovalTransactionStart?: () => void
  }
  handlePreSubmit?: (transactionType: TransactionType) => void
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

const RepayForm = (props: Props): ReactElement => {
  const {
    borrowToken,
    collateralToken,
    max,
    formDescription,
    collateralUSDPrice,
    isStable,
    handleWhileSubmitting,
    maxRepayBn,
    maxCollateralBn,
    updateLiquidationPrice,
    updatePositionHealth,
    getMaxWithdraw,
    repayValidator,
    collateralValidator,
    handleSubmit,
    handlePreSubmit,
    handlePostSubmit,
    submitButtonLabelText,
  } = props

  const { t } = useTranslation()

  return (
    <FormWrapper
      formDescription={formDescription}
      formTitle={
        <FormTitle
          title={`Repay ${borrowToken.symbol}`}
          popoverOptions={<BorrowAdvancedOptions />}
        />
      }
    >
      <Formik
        initialValues={{ collateral: "", borrow: "" }}
        onSubmit={async (values, actions) => {
          handlePreSubmit?.(TransactionType.REPAY)
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
              CookAction.REPAY,
              handleWhileSubmitting?.onMessageSignatureTransactionStart,
              handleWhileSubmitting?.onApprovalTransactionStart,
              parseStringToBigNumber(values?.borrow, 18).value.eq(maxRepayBn) &&
                parseStringToBigNumber(values?.collateral, 18).value.eq(
                  maxCollateralBn,
                ),
            )) as ContractReceipt
            handlePostSubmit?.(receipt, TransactionType.REPAY)
          } catch (e) {
            const error = e as { code: number; message: string }
            handlePostSubmit?.(receipt, TransactionType.REPAY, {
              code: error.code,
              message: error.message,
            })
          }
          actions.resetForm({ values: { collateral: "", borrow: "" } })
        }}
        validate={(values) => {
          const collateral = collateralValidator(
            values.borrow,
            values.collateral,
          )
          const borrow = repayValidator(values.borrow)
          if (collateral || borrow) {
            return {
              collateral,
              borrow,
            }
          }
        }}
      >
        {(props) => (
          <Form onSubmit={props.handleSubmit}>
            <Field name="borrow">
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
                  <Flex
                    justifyContent="space-between"
                    alignItems="baseline"
                    gridColumnGap="25px"
                    flexWrap={{ base: "wrap", md: "nowrap" }}
                    mb="20px"
                  >
                    <FormLabel
                      fontSize="18px"
                      fontWeight={700}
                      htmlFor="amount"
                      whiteSpace="nowrap"
                      mb="10px"
                    >
                      Repay RUSD
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
                        <Text justifySelf="end" fontWeight={700}>
                          {!form.errors.borrow && !form.errors.collateral
                            ? updateLiquidationPrice(
                                props.values.borrow,
                                props.values.collateral,
                                true,
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
                                true,
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
                              true,
                            )}
                            isStable={isStable}
                          />
                        </Box>
                      </Flex>
                    </Stack>
                  </Flex>
                  <Flex justifyContent="flex-end" alignItems="center">
                    <MaxFromBalance
                      max={max}
                      onClickMax={() => {
                        props.setFieldTouched("borrow", true)
                        props.setFieldValue("borrow", max)
                        props.setFieldValue("collateral", "")
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
                    onChangeInput={field.onChange}
                  />
                  {form.errors?.borrow ? (
                    <FormErrorMessage color="red.600">
                      {form.errors?.borrow}
                    </FormErrorMessage>
                  ) : (
                    <FormHelperText mt="15px" fontSize="sm" as="p">
                      {+props.values.borrow !== 0 &&
                        `You are about to repay ≈
                      ${(+props.values.borrow).toFixed(2)} ${
                          borrowToken.symbol
                        }.`}
                    </FormHelperText>
                  )}
                </FormControl>
              )}
            </Field>
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
                      Withdraw Collateral
                    </FormLabel>
                    <MaxFromBalance
                      max={formatBNToString(
                        getMaxWithdraw(props.values.borrow),
                        18,
                        3,
                      )}
                      onClickMax={() => {
                        const withdrawMax = formatBNToString(
                          getMaxWithdraw(props.values.borrow),
                          18,
                          collateralToken.decimals,
                        )
                        props.setFieldTouched("collateral", true)
                        props.setFieldValue("collateral", withdrawMax)
                      }}
                      label={t("max")}
                    />
                  </Flex>
                  <SingleTokenInput
                    inputValue={meta.value}
                    fieldProps={field}
                    isInvalid={!!meta.error}
                    token={{
                      name: collateralToken.name,
                      symbol: collateralToken.symbol,
                      icon: collateralToken.icon,
                    }}
                    onChangeInput={field.onChange}
                  />
                  {meta.error ? (
                    <FormErrorMessage color="red.600">
                      {form.errors?.collateral}
                    </FormErrorMessage>
                  ) : (
                    <FormHelperText mt="15px" fontSize="sm" as="p">
                      {+props.values.collateral !== 0 &&
                        `You are about to withdraw ≈
                      $${(
                        collateralUSDPrice * +props.values?.collateral
                      ).toFixed(2)}
                      ${collateralToken.symbol} as collateral.`}
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
                width="100%"
                type="submit"
                fontSize={{ base: "12px", sm: "16px" }}
                isDisabled={
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
                  TransactionType.REPAY,
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

export default RepayForm
