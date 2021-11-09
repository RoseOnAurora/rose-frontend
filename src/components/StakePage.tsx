import React, { ReactElement } from "react"
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react"
import { AppState } from "../state"
import { ContractReceipt } from "@ethersproject/contracts"
import StakeForm from "./StakeForm"
import { TokenDetails } from "../pages/Stake"
import { Zero } from "@ethersproject/constants"
import classNames from "classnames"
import { formatBNToString } from "../utils"
import { parseUnits } from "@ethersproject/units"
import styles from "./StakePage.module.scss"
import { useSelector } from "react-redux"
import useStakedRoseConversion from "../hooks/useStakedRoseConversion"
import { useTranslation } from "react-i18next"

interface Props {
  balance: TokenDetails
  staked: TokenDetails
  approveStake: (amount: string) => Promise<ContractReceipt | void>
  approveUnstake: (amount: string) => Promise<ContractReceipt | void>
}

function StakePage(props: Props): ReactElement {
  const { t } = useTranslation()
  const { balance, staked, approveStake, approveUnstake } = props

  const { userDarkMode } = useSelector((state: AppState) => state.user)
  const [stakedRoseConversion] = useStakedRoseConversion()

  const validateBalance = (amount: string) => {
    const generalValidation = validateAmount(amount)
    if (generalValidation) {
      return generalValidation
    }
    if (parseUnits(amount, 18).gt(balance.amount)) {
      return t("Insufficient Balance.")
    }
  }

  const validateStaked = (amount: string) => {
    const generalValidation = validateAmount(amount)
    if (generalValidation) {
      return generalValidation
    }
    if (parseUnits(amount, 18).gt(staked.amount)) {
      return t("Insufficient Balance.")
    }
  }

  const validateAmount = (amount: string) => {
    const decimalRegex = /^[0-9]\d*(\.\d{1,18})?$/
    if (!amount) {
      return t("You must enter a value.")
    }
    if (!decimalRegex.exec(amount)) {
      return t("Amount must be a valid number up to 18 decimal points.")
    }
    if (+amount <= 0) {
      return t("Amount must be greater than zero!")
    }
    return null
  }
  return (
    <div className={styles.stakeForm}>
      <Tabs isFitted variant="primary">
        <TabList mb="1em">
          <Tab>{`${t("stake")} Rose`}</Tab>
          <Tab>{`${t("unstake")} stRose`}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <div className={styles.row}>
              <h3 className={styles.stakeTitle}>{`${t("stake")} Rose`}</h3>
              <div
                className={classNames(
                  styles.pill,
                  { [styles.glowPill]: userDarkMode },
                  { [styles.colorPill]: !userDarkMode },
                )}
              >
                <div>1 stROSE = {stakedRoseConversion} ROSE</div>
              </div>
            </div>
            <StakeForm
              fieldName={"stake"}
              failedDescription={t("txFailed_stake")}
              token={"ROSE"}
              tokenIcon={"🌹"}
              max={formatBNToString(
                balance.amount || Zero,
                balance.decimals || 0,
                6,
              )}
              handleSubmit={approveStake}
              validator={validateBalance}
            />
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
                <div>1 stROSE = {stakedRoseConversion} ROSE</div>
              </div>
            </div>
            <StakeForm
              fieldName={"unstake"}
              failedDescription={t("txFailed_unstake")}
              token={"stRose"}
              tokenIcon={"🌷"}
              max={formatBNToString(
                staked.amount || Zero,
                staked.decimals || 0,
                6,
              )}
              handleSubmit={approveUnstake}
              validator={validateStaked}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  )
}

export default StakePage
