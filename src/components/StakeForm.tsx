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
import ConfirmTransaction, { ModalType } from "./ConfirmTransaction"
import { Field, FieldAttributes, Form, Formik } from "formik"
import React, { ReactElement, useState } from "react"
import { ContractReceipt } from "@ethersproject/contracts"
import Modal from "./Modal"
import parseStringToBigNumber from "../utils/parseStringToBigNumber"
import styles from "./StakeForm.module.scss"
import { useTranslation } from "react-i18next"

interface Props {
  fieldName: string
  token: string
  tokenIcon: string
  max: string
  failedDescription: string
  handleSubmit: (amount: string) => Promise<ContractReceipt | void>
  validator: (amount: string) => string | undefined
}
function StakeForm(props: Props): ReactElement {
  const { t } = useTranslation()
  const [currentModal, setCurrentModal] = useState<string | null>(null)
  const {
    failedDescription,
    fieldName,
    token,
    tokenIcon,
    max,
    handleSubmit,
    validator,
  } = props
  return (
    <>
      <Modal
        isOpen={!!currentModal}
        onClose={(): void => setCurrentModal(null)}
      >
        {currentModal === ModalType.CONFIRM ? (
          <ConfirmTransaction />
        ) : currentModal === ModalType.FAILED ? (
          <ConfirmTransaction
            description={failedDescription}
            title={t("failedTitle")}
            type={ModalType.FAILED}
          />
        ) : currentModal === ModalType.SUCCESS ? (
          <ConfirmTransaction
            title={t("successTitle")}
            type={ModalType.SUCCESS}
          />
        ) : null}
      </Modal>
      <div className={styles.inputContainer}>
        <Formik
          initialValues={{ [fieldName]: "" }}
          onSubmit={async (values, actions) => {
            setCurrentModal(ModalType.CONFIRM)
            const valueSafe = parseStringToBigNumber(values?.[fieldName], 18)
            actions.resetForm({ values: { [fieldName]: "" } })
            const receipt = (await handleSubmit(
              valueSafe.value.toString(),
            )) as ContractReceipt
            if (receipt?.status) {
              setCurrentModal(ModalType.SUCCESS)
              setTimeout(() => {
                setCurrentModal(null)
              }, 1000)
            } else {
              setCurrentModal(ModalType.FAILED)
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
                        {tokenIcon}
                      </InputLeftElement>
                      <Input
                        {...field}
                        isInvalid={form.errors?.[fieldName]}
                        placeholder={`${token} Token`}
                        variant="primary"
                      />
                      <InputRightElement width="4rem">
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
    </>
  )
}

export default StakeForm
