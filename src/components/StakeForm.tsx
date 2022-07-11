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
import { Field, FieldProps, Form, Formik, FormikProps } from "formik"
import React, { ReactElement, ReactNode } from "react"
import useChakraToast, { TransactionType } from "../hooks/useChakraToast"
import { BigNumber } from "@ethersproject/bignumber"
import { ContractReceipt } from "@ethersproject/contracts"
import FormWrapper from "./wrappers/FormWrapper"
import { basicTokenInputValidator } from "../utils/validators"
import { formatBNToString } from "../utils"
import parseStringToBigNumber from "../utils/parseStringToBigNumber"
import useHandlePostSubmit from "../hooks/useHandlePostSubmit"
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
  const handlePostSubmit = useHandlePostSubmit()

  const validator = (amount: string): string | undefined => {
    return basicTokenInputValidator(amount, 18, max)
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
                  bgColor="var(--secondary-background)"
                  borderRadius="10px"
                  isInvalid={!!form.errors?.[fieldName]}
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
                      isInvalid={!!form.errors?.[fieldName]}
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
                      {meta.error}
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
