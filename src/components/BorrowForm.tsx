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
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Stack,
  Text,
  Tooltip,
} from "@chakra-ui/react"
import { Field, FieldAttributes, Form, Formik } from "formik"
import React, { ReactElement, ReactNode, useState } from "react"
import { BigNumber } from "@ethersproject/bignumber"
import BorrowAdvancedOptions from "../components/BorrowAdvancedOptions"
import { ContractReceipt } from "@ethersproject/contracts"
import { CookAction } from "../hooks/useCook"
import { FaHandHoldingUsd } from "react-icons/fa"
import FormTitle from "./FormTitleOptions"
import FormWrapper from "./wrappers/FormWrapper"
import SafetyTag from "./SafetyTag"
import { TransactionType } from "../hooks/useChakraToast"
import { formatBNToString } from "../utils"
import parseStringToBigNumber from "../utils/parseStringToBigNumber"
import { parseUnits } from "@ethersproject/units"
import { useTranslation } from "react-i18next"

export interface BorrowFormTokenDetails {
  symbol: string
  icon: string
}

interface Props {
  borrowToken: BorrowFormTokenDetails
  collateralToken: BorrowFormTokenDetails
  max: string
  collateralUSDPrice: number
  formDescription?: ReactNode
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
            18,
          )
          const borrowValueSafe = parseStringToBigNumber(values?.borrow, 18)
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
            const error = e as { code: number; message: string }
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
              {({ field, form }: FieldAttributes<any>) => (
                <FormControl
                  padding="10px"
                  bgColor="var(--secondary-background)"
                  borderRadius="10px"
                  isInvalid={form.errors?.collateral}
                >
                  <FormLabel fontWeight={700} htmlFor="amount">
                    Deposit Collateral
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
                      fontSize={{ base: "12px", md: "16px" }}
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
                          props.setFieldTouched("collateral", true)
                          props.setFieldValue("collateral", max)
                          props.setFieldValue("borrow", "")
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
              {({ field, form }: FieldAttributes<any>) => (
                <FormControl
                  padding="10px"
                  mt="15px"
                  bgColor="var(--secondary-background)"
                  borderRadius="10px"
                  isInvalid={form.errors?.borrow}
                >
                  <Flex
                    justifyContent="space-between"
                    alignItems="baseline"
                    flexWrap={{ base: "wrap", md: "nowrap" }}
                  >
                    <FormLabel fontWeight={700} htmlFor="amount">
                      Borrow RUSD
                    </FormLabel>
                    <HStack spacing="20px" alignItems="center">
                      <Stack spacing="5px">
                        <Flex>
                          <Text
                            color="var(--text-lighter)"
                            fontSize={{ base: "14px", lg: "16px" }}
                          >
                            Updated Liquidation Price:&nbsp;
                          </Text>
                          <Text fontWeight={700}>
                            {!form.errors.borrow && !form.errors.collateral
                              ? updateLiquidationPrice(
                                  props.values.borrow,
                                  props.values.collateral,
                                )
                              : "$xx.xxx"}
                          </Text>
                        </Flex>
                        <Flex>
                          <Text
                            color="var(--text-lighter)"
                            fontSize={{ base: "14px", lg: "16px" }}
                          >
                            Updated Position Health:&nbsp;
                          </Text>
                          <Text fontWeight={700}>
                            {!form.errors.borrow && !form.errors.collateral
                              ? `${updatePositionHealth(
                                  props.values.borrow,
                                  props.values.collateral,
                                ).toFixed(0)}%`
                              : "xx%"}
                          </Text>
                        </Flex>
                      </Stack>
                      <SafetyTag
                        safetyScore={updatePositionHealth(
                          props.values.borrow,
                          props.values.collateral,
                        )}
                      />
                    </HStack>
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
                        form.errors?.collateral ||
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
                      <SliderMark value={25} mt="3" ml="-2.5" fontSize="sm">
                        25%
                      </SliderMark>
                      <SliderMark value={50} mt="3" ml="-2.5" fontSize="sm">
                        50%
                      </SliderMark>
                      <SliderMark value={75} mt="3" ml="-2.5" fontSize="sm">
                        75%
                      </SliderMark>
                      <SliderTrack>
                        <SliderFilledTrack bg="#cc3a59" />
                      </SliderTrack>
                      <Tooltip
                        hasArrow
                        bg="#cc3a59"
                        color="white"
                        placement="top"
                        isOpen={showTooltip}
                        label={`${sliderValue}%`}
                      >
                        <SliderThumb boxSize={6}>
                          <Box color="#cc3a59" as={FaHandHoldingUsd} />
                        </SliderThumb>
                      </Tooltip>
                    </Slider>
                  </Box>
                  <InputGroup>
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
                      fontSize={{ base: "12px", md: "16px" }}
                      type="text"
                      isInvalid={form.errors?.borrow}
                      placeholder="0.0"
                      variant="primary"
                      onChange={(e) => {
                        props.handleChange(e)
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
                    <InputRightElement width="6rem" padding="10px">
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() => {
                          const borrowMax = formatBNToString(
                            getMaxBorrow(props.values.collateral),
                            18,
                          )
                          props.setFieldTouched("borrow", true)
                          props.setFieldValue("borrow", borrowMax)
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
                        `You are about to borrow ≈
                      ${(+props.values.borrow).toFixed(2)} ${
                          borrowToken.symbol
                        }.`}
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
              <Box p="15px">
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
              </Box>
            </Flex>
          </Form>
        )}
      </Formik>
    </FormWrapper>
  )
}

export default BorrowForm
