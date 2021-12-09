// TODO: create types
/* eslint @typescript-eslint/no-unsafe-member-access: 0 */
/* eslint @typescript-eslint/no-unsafe-call: 0 */
/* eslint @typescript-eslint/no-unsafe-assignment: 0 */
/* eslint @typescript-eslint/no-explicit-any: 0 */
import {
  Button,
  FormControl,
  FormErrorMessage,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Text,
} from "@chakra-ui/react"
import { Field, FieldAttributes, Form, Formik } from "formik"
import React, { ReactElement } from "react"
import { ContractReceipt } from "@ethersproject/contracts"
import parseStringToBigNumber from "../utils/parseStringToBigNumber"
import styles from "./StakeForm.module.scss"
import { useTranslation } from "react-i18next"

interface Props {
  fieldName: string
  token: string
  tokenIcon: string
  max: string
  isLoading: boolean
  submitButtonLabel: string
  handleSubmit: (amount: string) => Promise<ContractReceipt | void>
  validator: (amount: string) => string | undefined
  handlePreSubmit?: () => void
  handlePostSubmit?: (receipt: ContractReceipt | null) => void
  handleInputChanged?: (value: string) => void
}
function StakeForm(props: Props): ReactElement {
  const { t } = useTranslation()
  const {
    fieldName,
    token,
    tokenIcon,
    max,
    isLoading,
    submitButtonLabel,
    handleSubmit,
    handleInputChanged,
    handlePreSubmit,
    handlePostSubmit,
    validator,
  } = props
  return (
    <div className={styles.inputContainer}>
      <Formik
        initialValues={{ [fieldName]: "" }}
        onSubmit={async (values, actions) => {
          handlePreSubmit?.()
          const valueSafe = parseStringToBigNumber(values?.[fieldName], 18)
          actions.resetForm({ values: { [fieldName]: "" } })
          const receipt = (await handleSubmit(
            valueSafe.value.toString(),
          )) as ContractReceipt
          handlePostSubmit?.(receipt)
        }}
      >
        {(props) => (
          <Form>
            <Field name={fieldName} validate={validator}>
              {({ field, form }: FieldAttributes<any>) => (
                <FormControl
                  isInvalid={
                    form.errors?.[fieldName] && form.touched?.[fieldName]
                  }
                >
                  <InputGroup>
                    <InputLeftElement
                      pointerEvents="none"
                      color="gray.300"
                      fontSize="1.2em"
                    >
                      <img src={tokenIcon} alt="roseIcon" />
                    </InputLeftElement>
                    <Input
                      {...field}
                      autoComplete="off"
                      autoCorrect="off"
                      isInvalid={form.errors?.[fieldName]}
                      placeholder={`${token} Token`}
                      variant="primary"
                      onChange={(e) => {
                        props.handleChange(e)
                        handleInputChanged?.(e.target.value)
                      }}
                    />
                    <InputRightElement width="4rem">
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() => {
                          handleInputChanged?.(max)
                          props.setFieldTouched(fieldName, true)
                          props.setFieldValue(fieldName, max)
                        }}
                      >
                        {t("max")}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                  {props.isValid && props.dirty ? (
                    <Text mt="5px" fontSize="sm" as="i">
                      You are about to {fieldName} ≈{+props.values?.[fieldName]}{" "}
                      {token} {"Token"}
                    </Text>
                  ) : (
                    <FormErrorMessage>
                      {form.errors?.[fieldName]}
                    </FormErrorMessage>
                  )}
                </FormControl>
              )}
            </Field>
            <div className={styles.submitButton}>
              <Button
                variant="primary"
                isLoading={isLoading}
                size="lg"
                width="450px"
                type="submit"
                disabled={!props.isValid || !props.dirty}
              >
                {props.isValid ? submitButtonLabel : props.errors?.[fieldName]}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default StakeForm
