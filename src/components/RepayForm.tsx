// TODO: create types
/* eslint @typescript-eslint/no-unsafe-member-access: 0 */
/* eslint @typescript-eslint/no-unsafe-call: 0 */
/* eslint @typescript-eslint/no-unsafe-assignment: 0 */
/* eslint @typescript-eslint/no-explicit-any: 0 */
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Stack,
  Text,
} from "@chakra-ui/react"
import { Field, FieldAttributes, Form, Formik } from "formik"
import React, { ReactElement, ReactNode } from "react"
import { BigNumber } from "@ethersproject/bignumber"
import BorrowAdvancedOptions from "./BorrowAdvancedOptions"
import { ContractReceipt } from "@ethersproject/contracts"
import { CookAction } from "../hooks/useCook"
import FormTitle from "./FormTitleOptions"
import FormWrapper from "./wrappers/FormWrapper"
import SafetyTag from "./SafetyTag"
import { TransactionType } from "../hooks/useChakraToast"
import { formatBNToString } from "../utils"
import parseStringToBigNumber from "../utils/parseStringToBigNumber"
import { useTranslation } from "react-i18next"

export interface RepayFormTokenDetails {
  symbol: string
  icon: string
  decimals: number
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
              {({ field, form }: FieldAttributes<any>) => (
                <FormControl
                  padding="15px"
                  mt="15px"
                  bgColor="var(--secondary-background)"
                  borderRadius="10px"
                  whiteSpace="nowrap"
                  isInvalid={form.errors?.borrow}
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
                          color="var(--text-lighter)"
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
                          color="var(--text-lighter)"
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
                          color="var(--text-lighter)"
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
                  <InputGroup mt="25px">
                    <InputLeftElement
                      pointerEvents="none"
                      color="gray.300"
                      fontSize="2em"
                      marginLeft="5px"
                    >
                      <img src={borrowToken.icon} alt="tokenIcon" />
                    </InputLeftElement>
                    <Input
                      {...field}
                      paddingLeft="60px"
                      autoComplete="off"
                      autoCorrect="off"
                      type="text"
                      isInvalid={form.errors?.borrow}
                      placeholder="0.0"
                      variant="primary"
                    />
                    <InputRightElement width="6rem" padding="10px">
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() => {
                          props.setFieldTouched("borrow", true)
                          props.setFieldValue("borrow", max)
                          props.setFieldValue("collateral", "")
                        }}
                      >
                        {t("max")}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                  {form.errors?.borrow ? (
                    <FormErrorMessage color="#cc3a59">
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
              {({ field, form }: FieldAttributes<any>) => (
                <FormControl
                  padding="10px"
                  mt="15px"
                  bgColor="var(--secondary-background)"
                  borderRadius="10px"
                  isInvalid={form.errors?.collateral}
                >
                  <FormLabel fontSize="18px" fontWeight={700} htmlFor="amount">
                    Withdraw Collateral
                  </FormLabel>
                  <InputGroup mt="25px">
                    <InputLeftElement
                      pointerEvents="none"
                      color="gray.300"
                      fontSize="2em"
                      marginLeft="5px"
                    >
                      <img src={collateralToken.icon} alt="tokenIcon" />
                    </InputLeftElement>
                    <Input
                      {...field}
                      paddingLeft="60px"
                      autoComplete="off"
                      autoCorrect="off"
                      type="text"
                      isInvalid={form.errors?.collateral}
                      placeholder="0.0"
                      variant="primary"
                    />
                    <InputRightElement width="6rem" padding="10px">
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() => {
                          const withdrawMax = formatBNToString(
                            getMaxWithdraw(props.values.borrow),
                            18,
                            collateralToken.decimals > 18
                              ? 18
                              : collateralToken.decimals,
                          )
                          props.setFieldTouched("collateral", true)
                          props.setFieldValue("collateral", withdrawMax)
                        }}
                      >
                        {t("max")}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                  {form.errors?.collateral ? (
                    <FormErrorMessage color="#cc3a59">
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
            <Flex
              mt="20px"
              alignItems="center"
              justifyContent="center"
              flexDirection="column"
              bg="var(--secondary-background)"
              border="1px solid var(--outline)"
              borderRadius="10px"
              padding="10px"
            >
              <Button
                variant="primary"
                size="lg"
                width="100%"
                type="submit"
                fontSize={{ base: "12px", sm: "16px" }}
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
                  TransactionType.REPAY,
                )}
              </Button>
              <Text
                as="p"
                p="20px 0 10px"
                textAlign="center"
                color="var(--text-lighter)"
                fontSize="14px"
              >
                Note: The &quot;Approve&quot; transaction is only needed the
                first time; subsequent actions will not require approval.
              </Text>
            </Flex>
          </Form>
        )}
      </Formik>
    </FormWrapper>
  )
}

export default RepayForm
