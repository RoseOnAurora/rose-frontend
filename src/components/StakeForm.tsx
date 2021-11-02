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
import React, { ReactElement, useState } from "react"
import { AppState } from "../state"
import ConfirmTransaction from "./ConfirmTransaction"
import { ContractReceipt } from "@ethersproject/contracts"
import FailedTransaction from "./FailedTransaction"
import Modal from "./Modal"
import SuccessTransaction from "./SuccessTransaction"
import classNames from "classnames"
import parseStringToBigNumber from "../utils/parseStringToBigNumber"
import styles from "./StakeForm.module.scss"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

interface Props {
  title: string
  fieldName: string
  token: string
  max: string
  failedDescription: string
  handleSubmit: (amount: string) => Promise<ContractReceipt | void>
  validator: (amount: string) => string | undefined
}
function StakeForm(props: Props): ReactElement {
  const { t } = useTranslation()
  const { userDarkMode } = useSelector((state: AppState) => state.user)
  const [currentModal, setCurrentModal] = useState<string | null>(null)
  const {
    title,
    failedDescription,
    fieldName,
    token,
    max,
    handleSubmit,
    validator,
  } = props

  return (
    <div>
      <Modal
        isOpen={!!currentModal}
        onClose={(): void => setCurrentModal(null)}
      >
        {currentModal === "confirm" ? (
          <ConfirmTransaction />
        ) : currentModal === "failed" ? (
          <FailedTransaction failedDescription={failedDescription} />
        ) : currentModal === "success" ? (
          <SuccessTransaction />
        ) : null}
      </Modal>
      <div className={styles.row}>
        <h3 className={styles.stakeTitle}>{title}</h3>
        <div
          className={classNames(
            styles.pill,
            { [styles.glowPill]: userDarkMode },
            { [styles.colorPill]: !userDarkMode },
          )}
        >
          <div>1 stROSE = 1.5 ROSE</div>
        </div>
      </div>
      <div className={styles.inputContainer}>
        <Formik
          initialValues={{ [fieldName]: "" }}
          onSubmit={async (values, actions) => {
            setCurrentModal("confirm")
            const valueSafe = parseStringToBigNumber(values?.[fieldName], 18)
            actions.resetForm({ values: { [fieldName]: "" } })
            const receipt = (await handleSubmit(
              valueSafe.value.toString(),
            )) as ContractReceipt
            if (receipt?.status) {
              setCurrentModal("success")
              setTimeout(() => {
                setCurrentModal(null)
              }, 1000)
            } else {
              setCurrentModal("failed")
            }
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
                        🌹
                      </InputLeftElement>
                      <Input
                        {...field}
                        isInvalid={form.errors?.[fieldName]}
                        placeholder={`${token} Token`}
                        variant="primary"
                      />
                      <InputRightElement width="4.5rem">
                        <Button
                          variant="light"
                          size="sm"
                          onClick={() => {
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
                        You are about to {fieldName} ≈
                        {+props.values?.[fieldName]} {token}
                        Token
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
                  size="lg"
                  width="450px"
                  type="submit"
                  disabled={!props.isValid || !props.dirty}
                >
                  {t("approve")}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}

export default StakeForm
