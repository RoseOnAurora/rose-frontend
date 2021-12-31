/* eslint @typescript-eslint/no-unsafe-assignment: 0 */
import ConfirmTransaction, {
  ConfirmTransactionProps,
  ModalType,
} from "./ConfirmTransaction"
import React, { ReactElement, useState } from "react"
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react"
import { commify, formatBNToShortString, formatBNToString } from "../utils"
import { useRoseContract, useStRoseContract } from "../hooks/useContract"
import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import { ContractReceipt } from "@ethersproject/contracts"
import { Erc20 } from "../../types/ethers-contracts/Erc20"
import Modal from "./Modal"
import { StRose } from "../../types/ethers-contracts/StRose"
import StakeDetails from "./StakeDetails"
import StakeForm from "./StakeForm"
import StakeLockedTimer from "./StakeLockedTimer"
import { TokenDetails } from "../pages/Stake"
import { Zero } from "@ethersproject/constants"
import classNames from "classnames"
import { parseUnits } from "@ethersproject/units"
import styles from "./StakePage.module.scss"
import { useCheckTokenRequiresApproval } from "../hooks/useCheckTokenRequiresApproval"
import { useSelector } from "react-redux"
import useStakeStats from "../hooks/useStakeStats"
import { useTranslation } from "react-i18next"

interface Props {
  balance: TokenDetails
  staked: TokenDetails
  roseTokenIcon: string
  stRoseTokenIcon: string
  timeLeft: number
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
    timeLeft,
    approveStake,
    approveUnstake,
  } = props

  const { userDarkMode } = useSelector((state: AppState) => state.user)
  const { priceRatio, tvl, totalRoseStaked, priceOfRose } = useStakeStats()

  const [
    currentModal,
    setCurrentModal,
  ] = useState<ConfirmTransactionProps | null>(null)

  const roseContract = useRoseContract() as Erc20
  const stRoseContract = useStRoseContract() as StRose

  const [approved, loading, checkRoseApproved] = useCheckTokenRequiresApproval(
    roseContract,
    stRoseContract,
  )

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
      return t("Invalid number.")
    }
    if (parseUnits(amount, 18).lte(Zero)) {
      return t("Enter a positive amount.")
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
                  <div>
                    1 stROSE ≈ {priceRatio ? (+priceRatio).toFixed(5) : "1.00"}{" "}
                    ROSE
                  </div>
                </div>
              </div>
              <StakeForm
                fieldName={"stake"}
                token={"ROSE"}
                tokenIcon={roseTokenIcon}
                submitButtonLabel={
                  approved
                    ? t("stake")
                    : t("approveAnd", { action: t("stake") })
                }
                isLoading={loading}
                formDescription={t("stakingInfo")}
                max={formatBNToString(
                  balance.amount || Zero,
                  balance.decimals || 0,
                  balance.decimals,
                )}
                handlePreSubmit={() => updateModal(ModalType.CONFIRM)}
                handleInputChanged={checkRoseApproved}
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
                  <div>
                    1 stROSE ≈ {priceRatio ? (+priceRatio).toFixed(5) : "1.00"}{" "}
                    ROSE
                  </div>
                </div>
              </div>
              <StakeForm
                fieldName={"unstake"}
                token={"stRose"}
                tokenIcon={stRoseTokenIcon}
                isLoading={false}
                submitButtonLabel={t("unstake")}
                formDescription={t("stakingInfo")}
                max={formatBNToString(
                  staked.amount || Zero,
                  staked.decimals || 0,
                  staked.decimals,
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
        balanceView={{
          title: t("balance"),
          tokenName: "ROSE",
          icon: roseTokenIcon,
          amount: commify(
            formatBNToString(balance.amount || Zero, balance.decimals || 0, 5),
          ),
        }}
        stakedView={{
          title: t("Staked"),
          tokenName: "stROSE",
          icon: stRoseTokenIcon,
          amount: commify(
            formatBNToString(staked.amount || Zero, staked.decimals || 0, 5),
          ),
        }}
        stats={[
          {
            statLabel: "Total ROSE Staked",
            statValue: totalRoseStaked
              ? `${formatBNToShortString(BigNumber.from(totalRoseStaked), 18)}`
              : "-",
          },
          {
            statLabel: "Price of ROSE",
            statValue: `$${Number(priceOfRose).toFixed(3)}`,
          },
          {
            statLabel: "TVL",
            statValue: tvl
              ? `$${formatBNToShortString(BigNumber.from(tvl), 18)}`
              : "-",
          },
        ]}
      />
      {staked.amount.gt(Zero) ? <StakeLockedTimer timeLeft={timeLeft} /> : null}
    </div>
  )
}

export default StakePage
