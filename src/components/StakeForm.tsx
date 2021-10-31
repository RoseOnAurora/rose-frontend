/* eslint @typescript-eslint/no-unsafe-member-access: 0 */
/* eslint @typescript-eslint/no-unsafe-assignment: 0 */
import {
  Button,
  FormControl,
  FormErrorMessage,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react"
import { Field, FieldAttributes, Form, Formik } from "formik"
import React, { ReactElement } from "react"
import { AppState } from "../state"
import classNames from "classnames"
import styles from "./StakeForm.module.scss"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

interface Props {
  balance: string
  staked: string
  onTabSwitch: (index: number) => void
}

function StakeForm(props: Props): ReactElement {
  const { t } = useTranslation()
  const { userDarkMode } = useSelector((state: AppState) => state.user)
  const { balance, staked, onTabSwitch } = props

  const validateAmount = (amount: string) => {
    const decimalRegex = /^[0-9]\d*(\.\d+)?$/
    if (!amount) {
      return t("You must enter a value.")
    }
    if (!decimalRegex.exec(amount.trim())) {
      console.log("AMOUNT!!! ", amount)
      return t("Numbers only!")
    }
    if (+amount <= 0) {
      return t("Amount must be greater than zero!")
    }
  }
  return (
    <div className={styles.stakeForm}>
      <Tabs isFitted variant="primary" onChange={(index) => onTabSwitch(index)}>
        <TabList mb="1em">
          <Tab>{`${t("stake")} Rose`}</Tab>
          <Tab>{t("unstake")}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <div className={styles.row}>
              <h3 className={styles.stakeTitle}>{`${t("stake")} ROSE`}</h3>
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
                initialValues={{ amount: "" }}
                // TO-DO: change to actual submit logic
                onSubmit={(values, actions) => {
                  setTimeout(() => {
                    alert(JSON.stringify(values, null, 2))
                    actions.setSubmitting(false)
                  }, 1000)
                  actions.resetForm({ values: { amount: "" } })
                }}
              >
                {(props) => (
                  <Form>
                    <Field name="amount" validate={validateAmount}>
                      {({ field, form }: FieldAttributes<any>) => (
                        <FormControl
                          isInvalid={form.errors.amount && form.touched.amount}
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
                              isInvalid={form.errors.amount}
                              placeholder="0 ROSE"
                              variant="primary"
                            />
                            <InputRightElement width="4.5rem">
                              <Button
                                variant="light"
                                size="sm"
                                onClick={() => {
                                  props.setFieldTouched("amount", true)
                                  props.setFieldValue("amount", balance)
                                }}
                              >
                                {t("max")}
                              </Button>
                            </InputRightElement>
                          </InputGroup>
                          <FormErrorMessage>
                            {form.errors.amount}
                          </FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                    <div className={styles.submitButton}>
                      <Button
                        isLoading={props.isSubmitting}
                        variant="primary"
                        size="lg"
                        width="450px"
                        type="submit"
                        disabled={!props.isValid}
                      >
                        {t("approve")}
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </TabPanel>
          <TabPanel>
            <div className={styles.row}>
              <h3 className={styles.stakeTitle}>{t("unstake")}</h3>
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
                initialValues={{ amount: "" }}
                onSubmit={(values, actions) => {
                  // TO-DO: change to actual submit logic
                  setTimeout(() => {
                    alert(JSON.stringify(values, null, 2))
                    actions.setSubmitting(false)
                  }, 1000)
                  actions.resetForm({ values: { amount: "" } })
                }}
              >
                {(props) => (
                  <Form>
                    <Field name="amount" validate={validateAmount}>
                      {({ field, form }: FieldAttributes<any>) => (
                        <FormControl
                          isInvalid={form.errors.amount && form.touched.amount}
                        >
                          <InputGroup>
                            <InputLeftElement
                              pointerEvents="none"
                              color="gray.300"
                              fontSize="1.2em"
                            >
                              🌷
                            </InputLeftElement>
                            <Input
                              {...field}
                              isInvalid={form.errors.amount}
                              placeholder="0 stROSE"
                              variant="primary"
                            />
                            <InputRightElement width="4.5rem">
                              <Button
                                variant="light"
                                size="sm"
                                onClick={() => {
                                  props.setFieldTouched("amount", true)
                                  props.setFieldValue("amount", staked)
                                }}
                              >
                                {t("max")}
                              </Button>
                            </InputRightElement>
                          </InputGroup>
                          <FormErrorMessage>
                            {form.errors.amount}
                          </FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                    <div className={styles.submitButton}>
                      <Button
                        isLoading={props.isSubmitting}
                        variant="primary"
                        size="lg"
                        width="450px"
                        type="submit"
                        disabled={!props.isValid}
                      >
                        {t("approve")}
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  )
}

export default StakeForm
