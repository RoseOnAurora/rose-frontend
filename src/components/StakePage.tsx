import ConfirmTransaction, {
  ConfirmTransactionProps,
  ModalType,
} from "./ConfirmTransaction"
import React, { ReactElement, useState } from "react"
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react"
import { commify, formatBNToString } from "../utils"
import { AppState } from "../state"
import { ContractReceipt } from "@ethersproject/contracts"
import Modal from "./Modal"
import StakeDetails from "./StakeDetails"
import StakeForm from "./StakeForm"
import { TokenDetails } from "../pages/Stake"
import { Zero } from "@ethersproject/constants"
import classNames from "classnames"
import { parseUnits } from "@ethersproject/units"
import styles from "./StakePage.module.scss"
import { useSelector } from "react-redux"
import useStakedRoseConversion from "../hooks/useStakedRoseConversion"
import { useTranslation } from "react-i18next"

interface Props {
  balance: TokenDetails
  staked: TokenDetails
  roseTokenIcon: string
  stRoseTokenIcon: string
  approveStake: (amount: string) => Promise<ContractReceipt | void>
  approveUnstake: (amount: string) => Promise<ContractReceipt | void>
}

function StakePage(props: Props): ReactElement {
  const { t } = useTranslation()
  const {
    balance,
    staked,
    roseTokenIcon,
    stRoseTokenIcon,
    approveStake,
    approveUnstake,
  } = props

  const { userDarkMode } = useSelector((state: AppState) => state.user)
  const [stakedRoseConversion] = useStakedRoseConversion()

  const [
    currentModal,
    setCurrentModal,
  ] = useState<ConfirmTransactionProps | null>(null)

  const validateBalance = (amount: string) => {
    const generalValidation = validateAmount(amount)
    if (generalValidation) {
      return generalValidation
    }
    if (parseUnits(amount, 18).gt(balance.amount)) {
      return t("insufficientBalance")
    }
  }

  const validateStaked = (amount: string) => {
    const generalValidation = validateAmount(amount)
    if (generalValidation) {
      return generalValidation
    }
    if (parseUnits(amount, 18).gt(staked.amount)) {
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
    if (parseUnits(amount, 18).lte(Zero)) {
      return t("Amount must be greater than zero!")
    }
    return null
  }

  const updateModal = (modalType: ModalType, tx?: string): void => {
    switch (modalType) {
      case ModalType.CONFIRM:
        setCurrentModal({ type: ModalType.CONFIRM })
        break
      case ModalType.SUCCESS:
        setCurrentModal({
          type: ModalType.SUCCESS,
          title: t("successTitle"),
          description: t("txConfirmed", { tx }),
        })
        break
      case ModalType.FAILED:
        setCurrentModal({
          type: ModalType.FAILED,
          title: t("failedTitle"),
          description: t("txFailed", { tx }),
        })
        break
      default:
        break
    }
  }

  const postStake = (receipt: ContractReceipt | null) => {
    if (receipt?.status) {
      updateModal(ModalType.SUCCESS, t("stake"))
    } else {
      updateModal(ModalType.FAILED, t("stake"))
    }
  }

  const postUnstake = (receipt: ContractReceipt | null) => {
    if (receipt?.status) {
      updateModal(ModalType.SUCCESS, t("unstake"))
    } else {
      updateModal(ModalType.FAILED, t("unstake"))
    }
  }

  return (
    <div className={styles.stakePage}>
      <div className={styles.stakeForm}>
        <Modal
          isOpen={!!currentModal}
          onClose={(): void => setCurrentModal(null)}
        >
          <ConfirmTransaction
            description={currentModal?.description}
            title={currentModal?.title}
            type={currentModal?.type}
          />
        </Modal>
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
                token={"ROSE"}
                tokenIcon={roseTokenIcon}
                max={formatBNToString(
                  balance.amount || Zero,
                  balance.decimals || 0,
                  balance.decimals,
                )}
                handlePreSubmit={() => updateModal(ModalType.CONFIRM)}
                handleSubmit={approveStake}
                handlePostSubmit={postStake}
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
                token={"stRose"}
                tokenIcon={stRoseTokenIcon}
                max={formatBNToString(
                  staked.amount || Zero,
                  staked.decimals || 0,
                  balance.decimals,
                )}
                handlePreSubmit={() => updateModal(ModalType.CONFIRM)}
                handleSubmit={approveUnstake}
                handlePostSubmit={postUnstake}
                validator={validateStaked}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
      <StakeDetails
        balanceView={commify(
          formatBNToString(balance.amount || Zero, balance.decimals || 0, 6),
        )}
        stakedView={commify(
          formatBNToString(staked.amount || Zero, staked.decimals || 0, 6),
        )}
      />
      <div className={styles.stakeInfo}>
        <div className={styles.stakeInfoContainer}>
          <h3>{t("stakingInformation")}</h3>
          <div className={styles.infoMessage}>
            <span>
              Stake your ROSE in order to accrue protocol fees in stROSE. After
              staking, the stROSE is locked for <b>24 hours</b> before transfers
              or withdraws can be made.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StakePage
