import React, { ReactElement } from "react"
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react"
import { BigNumber } from "@ethersproject/bignumber"
import { ContractReceipt } from "@ethersproject/contracts"
import { ModalType } from "./ConfirmTransaction"
import { PoolName } from "../constants"
import StakeForm from "./StakeForm"
import { Zero } from "@ethersproject/constants"
import { formatBNToString } from "../utils"
import { parseUnits } from "@ethersproject/units"
import styles from "./FarmTabs.module.scss"
import { useApproveAndDepositFarm } from "../hooks/useApproveAndDepositFarm"
import { useTranslation } from "react-i18next"
import { useWithdrawFarm } from "../hooks/useWithdrawFarm"

interface Props {
  lpTokenName: string
  lpTokenIcon: string
  balance: BigNumber
  deposited: BigNumber
  poolName: PoolName
  handleModal: (modalType: ModalType, tx?: string | undefined) => void
}

const FarmTabs = (props: Props): ReactElement => {
  const { lpTokenName, balance, deposited, poolName, handleModal } = props
  const { t } = useTranslation()
  const farm = useApproveAndDepositFarm(poolName)
  const withdraw = useWithdrawFarm()

  const validateBalance = (amount: string) => {
    const generalValidation = validateAmount(amount)
    if (generalValidation) {
      return generalValidation
    }
    if (parseUnits(amount, 18).gt(balance)) {
      return t("insufficientBalance")
    }
  }

  const validateDeposited = (amount: string) => {
    const generalValidation = validateAmount(amount)
    if (generalValidation) {
      return generalValidation
    }
    if (parseUnits(amount, 18).gt(deposited)) {
      return t("insufficientBalance")
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

  const postDeposit = (receipt: ContractReceipt | null) => {
    if (receipt?.status) {
      handleModal(ModalType.SUCCESS, t("deposit"))
    } else {
      handleModal(ModalType.FAILED, t("deposit"))
    }
  }

  const postWithdraw = (receipt: ContractReceipt | null) => {
    if (receipt?.status) {
      handleModal(ModalType.SUCCESS, t("Withdraw"))
    } else {
      handleModal(ModalType.FAILED, t("Withdraw"))
    }
  }

  return (
    <div className={styles.farmTabs}>
      <Tabs isFitted variant="primary">
        <TabList mb="1em">
          <Tab>{t("deposit")}</Tab>
          <Tab>{t("Withdraw")}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <h4 className={styles.farmTitle}>
              {t("farm")} {lpTokenName}
            </h4>
            <StakeForm
              fieldName={"deposit"}
              token={lpTokenName}
              tokenIcon={"🌹"}
              max={formatBNToString(balance || Zero, 18, 6)}
              handleSubmit={farm}
              handlePostSubmit={postDeposit}
              handlePreSubmit={() => handleModal(ModalType.CONFIRM)}
              validator={validateBalance}
            />
          </TabPanel>
          <TabPanel>
            <h4 className={styles.farmTitle}>
              {t("Withdraw")} {lpTokenName}
            </h4>
            <StakeForm
              fieldName={"withdraw"}
              token={lpTokenName}
              tokenIcon={"🌹"}
              max={formatBNToString(deposited || Zero, 18, 6)}
              handleSubmit={withdraw}
              validator={validateDeposited}
              handlePostSubmit={postWithdraw}
              handlePreSubmit={() => handleModal(ModalType.CONFIRM)}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  )
}

export default FarmTabs
