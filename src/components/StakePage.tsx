import React, { ReactElement } from "react"
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react"
import { commify, parseUnits } from "@ethersproject/units"
import { ContractReceipt } from "@ethersproject/contracts"
import StakeForm from "./StakeForm"
import { TokenDetails } from "../pages/Stake"
import { Zero } from "@ethersproject/constants"
import { formatBNToString } from "../utils"
import styles from "./StakePage.module.scss"
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
    if (parseUnits(amount, 18).gt(balance.amount)) {
      return t("insufficientBalance.")
    }
    return null
  }
  return (
    <div className={styles.stakeForm}>
      <Tabs isFitted variant="primary">
        <TabList mb="1em">
          <Tab>{`${t("stake")} Rose`}</Tab>
          <Tab>{t("unstake")}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <StakeForm
              title={`${t("stake")} Rose`}
              fieldName={"stake"}
              failedDescription={t("stakeFailed")}
              token={"ROSE"}
              max={commify(
                formatBNToString(
                  balance.amount || Zero,
                  balance.decimals || 0,
                  6,
                ),
              ).replace(",", "")}
              handleSubmit={approveStake}
              validator={validateBalance}
            />
          </TabPanel>
          <TabPanel>
            <StakeForm
              title={t("unstake")}
              fieldName={"unstake"}
              failedDescription={t("unstakeFailed")}
              token={"stRose"}
              max={commify(
                formatBNToString(
                  staked.amount || Zero,
                  staked.decimals || 0,
                  6,
                ),
              ).replace(",", "")}
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
