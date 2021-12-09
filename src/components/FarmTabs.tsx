import React, { ReactElement } from "react"
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react"
import {
  useFarmContract,
  useLPTokenContractForFarm,
} from "../hooks/useContract"
import { BigNumber } from "@ethersproject/bignumber"
import { ContractReceipt } from "@ethersproject/contracts"
import { FarmName } from "../constants"
import { ModalType } from "./ConfirmTransaction"
import StakeForm from "./StakeForm"
import { Zero } from "@ethersproject/constants"
import { formatBNToString } from "../utils"
import { parseUnits } from "@ethersproject/units"
import styles from "./FarmTabs.module.scss"
import { useApproveAndDepositFarm } from "../hooks/useApproveAndDepositFarm"
import { useCheckTokenRequiresApproval } from "../hooks/useCheckTokenRequiresApproval"
import { useTranslation } from "react-i18next"
import { useWithdrawFarm } from "../hooks/useWithdrawFarm"

interface Props {
  lpTokenName: string
  lpTokenIcon: string
  balance: BigNumber
  deposited: BigNumber
  farmName: FarmName
  handleModal: (modalType: ModalType, tx?: string | undefined) => void
}

const FarmTabs = (props: Props): ReactElement => {
  const {
    lpTokenName,
    balance,
    deposited,
    farmName,
    lpTokenIcon,
    handleModal,
  } = props
  const { t } = useTranslation()
  const farm = useApproveAndDepositFarm(farmName)
  const withdraw = useWithdrawFarm(farmName)

  const farmContract = useFarmContract(farmName)
  const lpTokenContract = useLPTokenContractForFarm(farmName)

  const [
    approved,
    loading,
    checkLpTokenApproved,
  ] = useCheckTokenRequiresApproval(lpTokenContract, farmContract)

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
      return t("Invalid number.")
    }
    if (parseUnits(amount, 18).lte(Zero)) {
      return t("Enter a positive amount.")
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
              tokenIcon={lpTokenIcon}
              submitButtonLabel={
                approved
                  ? t("deposit")
                  : t("approveAnd", { action: t("deposit") })
              }
              isLoading={loading}
              max={formatBNToString(balance || Zero, 18, 18)}
              handleSubmit={farm}
              handlePostSubmit={postDeposit}
              handlePreSubmit={() => handleModal(ModalType.CONFIRM)}
              handleInputChanged={checkLpTokenApproved}
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
              tokenIcon={lpTokenIcon}
              isLoading={false}
              submitButtonLabel={t("Withdraw")}
              max={formatBNToString(deposited || Zero, 18, 18)}
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
