import {
  BoxProps,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  Stack,
  Text,
} from "@chakra-ui/react"
import { Field, FieldProps, Form, Formik, FormikProps } from "formik"
import React, { ReactElement, ReactNode } from "react"
import { commify, formatBNToString } from "../../utils"
import useChakraToast, { TransactionType } from "../../hooks/useChakraToast"
import ApprovalInfo from "../ApprovalInfo"
import { BigNumber } from "@ethersproject/bignumber"
import { ContractReceipt } from "@ethersproject/contracts"
import FormWrapper from "../wrappers/FormWrapper"
import SingleTokenInput from "../input/SingleTokenInput"
import { basicTokenInputValidator } from "../../utils/validators"
import parseStringToBigNumber from "../../utils/parseStringToBigNumber"
import useHandlePostSubmit from "../../hooks/useHandlePostSubmit"
import { useTranslation } from "react-i18next"

interface Props extends BoxProps {
  fieldName: string
  token: string
  tokenIcon: string
  tokenName: string
  max: BigNumber
  isLoading: boolean
  submitButtonLabel: string
  formTitle?: ReactNode
  formDescription?: ReactNode
  txnType: TransactionType
  usdPrice?: number
  handleSubmit: (
    amount: string,
    onApprovalTransactionStart?: () => void,
  ) => Promise<ContractReceipt | void>
  handleInputChanged?: (value: string) => void
}

function StakeForm(props: Props): ReactElement {
  const {
    fieldName,
    token,
    tokenIcon,
    tokenName,
    max,
    isLoading,
    submitButtonLabel,
    formTitle,
    formDescription,
    txnType,
    usdPrice,
    handleSubmit,
    handleInputChanged,
    ...rest
  } = props

  const { t } = useTranslation()
  const toast = useChakraToast()
  const handlePostSubmit = useHandlePostSubmit()

  const validator = (amount: string): string | undefined => {
    return basicTokenInputValidator(amount, 18, max)
  }

  // formatted from token balance
  // TO-DO: add decimals
  const formattedBalance = commify(formatBNToString(max, 18, 6))

  return (
    <FormWrapper
      formTitle={formTitle}
      formDescription={formDescription}
      {...rest}
    >
      <Formik
        initialValues={{ [fieldName]: "" }}
        onSubmit={async (values, actions) => {
          toast.transactionPending({
            txnType,
          })
          const valueSafe = parseStringToBigNumber(values?.[fieldName], 18)
          let receipt: ContractReceipt | null = null
          try {
            receipt = (await handleSubmit(
              valueSafe.value.toString(),
              toast.approvalRequired,
            )) as ContractReceipt
            handlePostSubmit?.(receipt, txnType)
          } catch (e) {
            const error = e as { code: number; message: string }
            handlePostSubmit?.(receipt, txnType, {
              code: error.code,
              message: error.message,
            })
          }
          actions.resetForm({ values: { [fieldName]: "" } })
        }}
      >
        {(props: FormikProps<{ [key: string]: string }>) => (
          <Form>
            <Field name={fieldName} validate={validator}>
              {({
                field,
                form,
                meta,
              }: FieldProps<string, { [key: string]: string }>) => (
                <FormControl
                  padding="10px"
                  borderRadius="10px"
                  isInvalid={!!form.errors?.[fieldName]}
                >
                  <Flex gap="5px" alignItems="center" justifyContent="flex-end">
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
                        const maxAsString = formatBNToString(max, 18)
                        handleInputChanged?.(maxAsString)
                        props.setFieldTouched(fieldName, true)
                        props.setFieldValue(fieldName, maxAsString)
                      }}
                    >
                      {formattedBalance}
                    </Text>
                  </Flex>
                  <SingleTokenInput
                    token={{ name: tokenName, icon: tokenIcon, symbol: token }}
                    inputValue={meta.value}
                    fieldProps={field}
                    isInvalid={!!form.errors?.[fieldName]}
                    onChangeInput={(e) => {
                      props.handleChange(e)
                      handleInputChanged?.(e.target.value)
                    }}
                  />
                  {props.isValid && +props.values?.[fieldName] !== 0 ? (
                    <Text mt="5px" fontSize="sm" as="p">
                      You are about to {fieldName} ≈{" "}
                      {`$${(
                        (usdPrice || 1) * +props.values?.[fieldName]
                      ).toFixed(2)}`}{" "}
                      {token} {"Token"}
                    </Text>
                  ) : (
                    <FormErrorMessage color="red.600">
                      {meta.error}
                    </FormErrorMessage>
                  )}
                </FormControl>
              )}
            </Field>
            <Stack
              mt="10px"
              spacing="30px"
              borderRadius="10px"
              py="15px"
              px={{ base: "5px", md: "15px" }}
            >
              <Button
                variant="primary"
                isLoading={isLoading || props.isSubmitting}
                size="lg"
                width="100%"
                type="submit"
                isDisabled={
                  !props.isValid ||
                  +props.values?.[fieldName] === 0 ||
                  props.isSubmitting
                }
              >
                {props.isValid ? submitButtonLabel : props.errors?.[fieldName]}
              </Button>
              <ApprovalInfo />
            </Stack>
          </Form>
        )}
      </Formik>
    </FormWrapper>
  )
}

export default StakeForm
