// TODO: create types
/* eslint @typescript-eslint/no-unsafe-member-access: 0 */
/* eslint @typescript-eslint/no-unsafe-call: 0 */
/* eslint @typescript-eslint/no-unsafe-assignment: 0 */
/* eslint @typescript-eslint/no-explicit-any: 0 */
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Stack,
  Text,
} from "@chakra-ui/react"
import { Field, FieldAttributes, Form, Formik } from "formik"
import React, { ReactElement, ReactNode } from "react"
import useChakraToast, { TransactionType } from "../hooks/useChakraToast"
import { BigNumber } from "@ethersproject/bignumber"
import BlockExplorerLink from "./BlockExplorerLink"
import { ContractReceipt } from "@ethersproject/contracts"
import FormWrapper from "./wrappers/FormWrapper"
import { Zero } from "@ethersproject/constants"
import { formatBNToString } from "../utils"
import parseStringToBigNumber from "../utils/parseStringToBigNumber"
import { useTranslation } from "react-i18next"

interface Props {
  fieldName: string
  token: string
  tokenIcon: string
  max: BigNumber
  isLoading: boolean
  submitButtonLabel: string
  formTitle: ReactNode
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
    max,
    isLoading,
    submitButtonLabel,
    formTitle,
    formDescription,
    txnType,
    usdPrice,
    handleSubmit,
    handleInputChanged,
  } = props

  const { t } = useTranslation()
  const toast = useChakraToast()

  const validator = (amount: string): string | undefined => {
    const { value, isFallback } = parseStringToBigNumber(amount, 18, Zero)

    if (!amount) return

    if (isFallback) {
      return t("Invalid number.")
    }

    if (value.gt(max)) return t("insufficientBalance")
  }

  const handlePostSubmit = (
    receipt: ContractReceipt | null,
    transactionType: TransactionType,
    error?: { code: number; message: string },
  ): void => {
    const description = receipt?.transactionHash ? (
      <BlockExplorerLink
        txnType={transactionType}
        txnHash={receipt.transactionHash}
        status={receipt?.status ? "Succeeded" : "Failed"}
      />
    ) : null
    if (receipt?.status) {
      toast.transactionSuccess({
        txnType: transactionType,
        description: description,
      })
    } else {
      toast.transactionFailed({
        txnType: transactionType,
        error,
        description: description,
      })
    }
  }

  return (
    <FormWrapper formTitle={formTitle} formDescription={formDescription}>
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
        {(props) => (
          <Form>
            <Field name={fieldName} validate={validator}>
              {({ field, form }: FieldAttributes<any>) => (
                <FormControl
                  padding="10px"
                  bgColor="var(--secondary-background)"
                  borderRadius="10px"
                  isInvalid={form.errors?.[fieldName]}
                >
                  <InputGroup>
                    <InputLeftElement
                      pointerEvents="none"
                      color="gray.300"
                      fontSize="2em"
                      marginLeft="5px"
                    >
                      <img src={tokenIcon} alt="roseIcon" />
                    </InputLeftElement>
                    <Input
                      {...field}
                      paddingLeft="60px"
                      autoComplete="off"
                      autoCorrect="off"
                      type="text"
                      isInvalid={form.errors?.[fieldName]}
                      placeholder="0.0"
                      variant="primary"
                      onChange={(e) => {
                        props.handleChange(e)
                        handleInputChanged?.(e.target.value)
                      }}
                    />
                    <InputRightElement width="6rem" padding="10px">
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() => {
                          const maxAsString = formatBNToString(max, 18)
                          handleInputChanged?.(maxAsString)
                          props.setFieldTouched(fieldName, true)
                          props.setFieldValue(fieldName, maxAsString)
                        }}
                      >
                        {t("max")}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                  {props.isValid && +props.values?.[fieldName] !== 0 ? (
                    <Text mt="5px" fontSize="sm" as="p">
                      You are about to {fieldName} ≈{" "}
                      {`$${(
                        (usdPrice || 1) * +props.values?.[fieldName]
                      ).toFixed(2)}`}{" "}
                      {token} {"Token"}
                    </Text>
                  ) : (
                    <FormErrorMessage color="#cc3a59">
                      {form.errors?.[fieldName]}
                    </FormErrorMessage>
                  )}
                </FormControl>
              )}
            </Field>
            <Stack
              mt="20px"
              spacing="5px"
              bg="var(--secondary-background)"
              border="1px solid var(--outline)"
              borderRadius="10px"
              padding="15px"
            >
              <Button
                variant="primary"
                isLoading={isLoading}
                size="lg"
                width="100%"
                type="submit"
                disabled={!props.isValid || +props.values?.[fieldName] === 0}
              >
                {props.isValid ? submitButtonLabel : props.errors?.[fieldName]}
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
            </Stack>
          </Form>
        )}
      </Formik>
    </FormWrapper>
  )
}

export default StakeForm
