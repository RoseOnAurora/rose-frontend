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
import React, { ReactElement, ReactNode } from "react"
import { AppState } from "../state"
import { ContractReceipt } from "@ethersproject/contracts"
import parseStringToBigNumber from "../utils/parseStringToBigNumber"
import styles from "./StakeForm.module.scss"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

interface Props {
  fieldName: string
  token: string
  tokenIcon: string
  max: string
  isLoading: boolean
  submitButtonLabel: string
  formDescription?: ReactNode
  handleSubmit: (amount: string) => Promise<ContractReceipt | void>
  validator: (amount: string) => string | undefined
  handlePreSubmit?: () => void
  handlePostSubmit?: (receipt: ContractReceipt | null) => void
  handleInputChanged?: (value: string) => void
}
function StakeForm(props: Props): ReactElement {
  const { t } = useTranslation()
  const { userDarkMode } = useSelector((state: AppState) => state.user)
  const {
    fieldName,
    token,
    tokenIcon,
    max,
    isLoading,
    submitButtonLabel,
    formDescription,
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
                  padding="10px"
                  bgColor={
                    userDarkMode
                      ? "rgba(28, 29, 33, 0.4)"
                      : "rgba(245, 239, 239, 0.6)"
                  }
                  borderRadius="10px"
                  isInvalid={
                    form.errors?.[fieldName] && form.touched?.[fieldName]
                  }
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
                      marginLeft="5px"
                      autoComplete="off"
                      autoCorrect="off"
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
                    <Text mt="5px" fontSize="sm" as="p">
                      You are about to {fieldName} ≈{+props.values?.[fieldName]}{" "}
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
            {formDescription && (
              <div className={styles.stakeInfoContainer}>
                <div className={styles.infoMessage}>
                  <span>{formDescription}</span>
                </div>
              </div>
            )}

            <div className={styles.submitButton}>
              <Button
                variant="primary"
                isLoading={isLoading}
                size="lg"
                width="100%"
                type="submit"
                disabled={!props.isValid || !props.dirty}
              >
                {props.isValid ? submitButtonLabel : props.errors?.[fieldName]}
              </Button>
              <div className={styles.approvalMessage}>
                Note: The &quot;Approve&quot; transaction is only needed the
                first time; subsequent actions will not require approval.
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default StakeForm
