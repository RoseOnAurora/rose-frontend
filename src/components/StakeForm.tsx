import {
  Button,
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
import React, { ReactElement } from "react"
import { AppState } from "../state"
import classNames from "classnames"
import styles from "./StakeForm.module.scss"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

function StakeForm(): ReactElement {
  const { t } = useTranslation()
  const { userDarkMode } = useSelector((state: AppState) => state.user)
  return (
    <div className={styles.stakeForm}>
      <Tabs isFitted variant="primary">
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
              <InputGroup>
                <InputLeftElement
                  pointerEvents="none"
                  color="gray.300"
                  fontSize="1.2em"
                >
                  🌹
                </InputLeftElement>
                <Input
                  placeholder="0 ROSE"
                  variant="primary"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                    const value = e.target.value
                    if (value && !isNaN(+value)) {
                      // do something
                    }
                  }}
                />
                <InputRightElement width="4.5rem">
                  <Button variant="light" size="sm">
                    {t("max")}
                  </Button>
                </InputRightElement>
              </InputGroup>
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
              <InputGroup>
                <InputLeftElement pointerEvents="none" fontSize="1.2em">
                  🌷
                </InputLeftElement>
                <Input
                  placeholder="0 stROSE"
                  variant="primary"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                    const value = e.target.value
                    if (value && !isNaN(+value)) {
                      // do something
                    }
                  }}
                />
                <InputRightElement width="4.5rem">
                  <Button variant="light" size="sm">
                    {t("max")}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
      <div className={styles.submitButton}>
        <Button variant="primary" size="lg" width="450px">
          {t("approve")}
        </Button>
      </div>
    </div>
  )
}

export default StakeForm
