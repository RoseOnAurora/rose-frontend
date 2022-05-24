import React, { ReactElement, useMemo } from "react"
import { commify, formatBNToShortString, formatBNToString } from "../utils"
import { useRoseContract, useStRoseContract } from "../hooks/useContract"
import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import ComponentWrapper from "../components/wrappers/ComponentWrapper"
import { Erc20 } from "../../types/ethers-contracts/Erc20"
import PageWrapper from "../components/wrappers/PageWrapper"
import { ROSE_TOKENS_MAP } from "../constants"
import { StRose } from "../../types/ethers-contracts/StRose"
import StakeDetails from "../components/StakeDetails"
import StakeForm from "../components/StakeForm"
import StakePageTitle from "../components/StakePageTitle"
import StakingCountdown from "../components/StakingCountdown"
import TabsWrapper from "../components/wrappers/TabsWrapper"
import { TransactionType } from "../hooks/useChakraToast"
import { Zero } from "@ethersproject/constants"
import { useApproveAndStake } from "../hooks/useApproveAndStake"
import { useApproveAndUnstake } from "../hooks/useApproveAndUnstake"
import { useCheckTokenRequiresApproval } from "../hooks/useCheckTokenRequiresApproval"
import { useRoseTokenBalances } from "../state/wallet/hooks"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

export type BalanceDetails = {
  balance: BigNumber
  staked: BigNumber
}

const Stake = (): ReactElement => {
  const { t } = useTranslation()
  const tokenBalances = useRoseTokenBalances()
  const stake = useApproveAndStake()
  const unstake = useApproveAndUnstake()
  const roseContract = useRoseContract() as Erc20
  const stRoseContract = useStRoseContract() as StRose
  const [approved, loading, checkRoseApproved] = useCheckTokenRequiresApproval(
    roseContract,
    stRoseContract,
  )
  const { stakeStats } = useSelector((state: AppState) => state.application)

  const { priceRatio, tvl, totalRoseStaked, priceOfRose, apr } = {
    ...stakeStats,
  }

  const tokenBalanceDetails = useMemo((): BalanceDetails => {
    const [roseToken, stRoseToken] = Object.values(ROSE_TOKENS_MAP).map(
      ({ symbol }) => {
        const amount = tokenBalances?.[symbol] || Zero
        return {
          amount,
        }
      },
    )
    return {
      balance: roseToken.amount,
      staked: stRoseToken.amount,
    }
  }, [tokenBalances])

  return (
    <PageWrapper activeTab="stake">
      <ComponentWrapper
        left={
          <TabsWrapper
            tabsProps={{ variant: "primary" }}
            tab1={{
              name: t("stake"),
              content: (
                <StakeForm
                  fieldName={"stake"}
                  token={"ROSE"}
                  tokenIcon={ROSE_TOKENS_MAP.rose.icon}
                  submitButtonLabel={
                    approved
                      ? t("stake")
                      : t("approveAnd", { action: t("stake") })
                  }
                  formTitle={<StakePageTitle title={`${t("stake")} ROSE`} />}
                  formDescription={t("stakingInfo")}
                  isLoading={loading}
                  usdPrice={+(priceOfRose || 0)}
                  max={tokenBalanceDetails.balance}
                  txnType={TransactionType.STAKE}
                  handleInputChanged={checkRoseApproved}
                  handleSubmit={stake}
                />
              ),
            }}
            tab2={{
              name: t("unstake"),
              content: (
                <StakeForm
                  fieldName={"unstake"}
                  token={"stROSE"}
                  tokenIcon={ROSE_TOKENS_MAP.stRose.icon}
                  isLoading={false}
                  formTitle={
                    <StakePageTitle title={`${t("unstake")} stROSE`} />
                  }
                  formDescription={t("stakingInfo")}
                  submitButtonLabel={t("unstake")}
                  usdPrice={+(priceOfRose || 0) * +(priceRatio || 0)}
                  max={tokenBalanceDetails.staked}
                  txnType={TransactionType.UNSTAKE}
                  handleSubmit={unstake}
                />
              ),
            }}
          />
        }
        right={
          <StakeDetails
            extraStakeDetailChild={<StakingCountdown />}
            balanceView={{
              title: t("balance"),
              items: [
                {
                  tokenName: "ROSE",
                  icon: ROSE_TOKENS_MAP.rose.icon,
                  amount: commify(
                    formatBNToString(tokenBalanceDetails.balance, 18, 5),
                  ),
                },
              ],
            }}
            stakedView={{
              title: t("Staked"),
              items: [
                {
                  tokenName: "stROSE",
                  icon: ROSE_TOKENS_MAP.stRose.icon,
                  amount: commify(
                    formatBNToString(tokenBalanceDetails.staked, 18, 5),
                  ),
                },
              ],
            }}
            stats={[
              {
                statLabel: "Total ROSE Staked",
                statValue: totalRoseStaked
                  ? `${formatBNToShortString(
                      BigNumber.from(totalRoseStaked),
                      18,
                    )}`
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
              {
                statLabel: "APR",
                statValue: apr ?? "-",
              },
            ]}
          />
        }
      />
    </PageWrapper>
  )
}

export default Stake
