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
  Text,
  useColorModeValue,
} from "@chakra-ui/react"
import { Field, FieldAttributes, Form, Formik } from "formik"
import React, { ReactElement, ReactNode } from "react"
import { BigNumber } from "@ethersproject/bignumber"
import { ContractReceipt } from "@ethersproject/contracts"
import { CookAction } from "../hooks/useCook"
import SafetyTag from "./SafetyTag"
import { formatBNToString } from "../utils"
import parseStringToBigNumber from "../utils/parseStringToBigNumber"
import { useTranslation } from "react-i18next"

interface Props {
  borrowTokenSymbol: string
  borrowTokenIcon: string
  collateralTokenSymbol: string
  collateralTokenIcon: string
  max: string
  submitButtonLabel: string
  collateralUSDPrice: number
  formDescription?: ReactNode
  updateLiquidationPrice: (
    borrowAmount: string,
    collateralAmount: string,
    negate: boolean,
  ) => { valueRaw: BigNumber; formatted: string }
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
  ) => Promise<ContractReceipt | void>
  handlePreSubmit?: () => void
  handlePostSubmit?: (receipt: ContractReceipt | null) => void
}

const RepayForm = (props: Props): ReactElement => {
  const {
    borrowTokenSymbol,
    borrowTokenIcon,
    collateralTokenSymbol,
    collateralTokenIcon,
    max,
    submitButtonLabel,
    formDescription,
    collateralUSDPrice,
    updateLiquidationPrice,
    getMaxWithdraw,
    repayValidator,
    collateralValidator,
    handleSubmit,
    handlePreSubmit,
    handlePostSubmit,
  } = props
  const { t } = useTranslation()
  const collateralFieldBgColor = useColorModeValue(
    "rgba(245, 239, 239, 0.6)",
    "rgba(28, 29, 33, 0.4)",
  )
  const borrowFieldBgColor = useColorModeValue(
    "rgba(245, 239, 239, 0.6)",
    "rgba(28, 29, 33, 0.4)",
  )

  const submitButtonLabelText = (
    borrow: string,
    collateral: string,
    borrowError: string | undefined,
    collateralError: string | undefined,
  ) => {
    if (
      (borrow === "" && collateral === "") ||
      (!borrowError && !collateralError && +borrow !== 0 && +collateral !== 0)
    ) {
      return submitButtonLabel
    }
    if (borrowError || collateralError) {
      return borrowError || collateralError
    }
    if (borrowError || borrow === "") {
      return "Withdraw Collateral"
    }
    return "Repay"
  }

  return (
    <Box pt="15px">
      {formDescription && (
        <Box
          mb="15px"
          bg="var(--secondary-background)"
          border="1px solid var(--outline)"
          borderRadius="10px"
          p="24px"
          width="100%"
        >
          {formDescription}
        </Box>
      )}
      <Formik
        initialValues={{ collateral: "", borrow: "" }}
        onSubmit={async (values, actions) => {
          handlePreSubmit?.()
          const collateralValueSafe = parseStringToBigNumber(
            values?.collateral,
            18,
          )
          const borrowValueSafe = parseStringToBigNumber(values?.borrow, 18)
          const receipt = (await handleSubmit(
            collateralValueSafe.value.toString(),
            borrowValueSafe.value.toString(),
            CookAction.REPAY,
          )) as ContractReceipt
          actions.resetForm({ values: { collateral: "", borrow: "" } })
          handlePostSubmit?.(receipt)
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
                  padding="10px"
                  mt="15px"
                  bgColor={borrowFieldBgColor}
                  borderRadius="10px"
                  isInvalid={form.errors?.borrow}
                >
                  <Flex
                    justifyContent="space-between"
                    alignItems="baseline"
                    flexWrap={{ base: "wrap", md: "nowrap" }}
                  >
                    <FormLabel fontWeight={700} htmlFor="amount">
                      Repay RUSD
                    </FormLabel>
                    <HStack spacing="20px">
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
                                true,
                              ).formatted
                            : "$xx.xxx"}
                        </Text>
                      </Flex>
                      <SafetyTag
                        safetyScore={
                          (+formatBNToString(
                            updateLiquidationPrice(
                              props.values.borrow,
                              props.values.collateral,
                              true,
                            ).valueRaw,
                            18,
                          ) /
                            collateralUSDPrice) *
                          100
                        }
                      />
                    </HStack>
                  </Flex>
                  <InputGroup mt="25px">
                    <InputLeftElement
                      pointerEvents="none"
                      color="gray.300"
                      fontSize="2em"
                      marginLeft="5px"
                    >
                      <img src={borrowTokenIcon} alt="tokenIcon" />
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
                      ${(+props.values.borrow).toFixed(
                        2,
                      )} ${borrowTokenSymbol}.`}
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
                  bgColor={collateralFieldBgColor}
                  borderRadius="10px"
                  isInvalid={form.errors?.collateral}
                >
                  <FormLabel fontWeight={700} htmlFor="amount">
                    Withdraw Collateral
                  </FormLabel>
                  <InputGroup mt="25px">
                    <InputLeftElement
                      pointerEvents="none"
                      color="gray.300"
                      fontSize="2em"
                      marginLeft="5px"
                    >
                      <img src={collateralTokenIcon} alt="tokenIcon" />
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
                      ${collateralTokenSymbol} as collateral.`}
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
    </Box>
  )
}

export default RepayForm
