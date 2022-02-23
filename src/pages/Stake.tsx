import { FaLock, FaUnlock } from "react-icons/fa"
import { Flex, Text, Tooltip } from "@chakra-ui/react"
import React, { ReactElement, useEffect, useMemo, useState } from "react"
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
import TabsWrapper from "../components/wrappers/TabsWrapper"
import { TransactionType } from "../hooks/useChakraToast"
import { Zero } from "@ethersproject/constants"
import { useApproveAndStake } from "../hooks/useApproveAndStake"
import { useApproveAndUnstake } from "../hooks/useApproveAndUnstake"
import { useCheckTokenRequiresApproval } from "../hooks/useCheckTokenRequiresApproval"
import useCountDown from "react-countdown-hook"
import useLastStakedTime from "../hooks/useLastStakedTime"
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
  const [diff, setDiff] = useState(0)
  const lastStaked = useLastStakedTime()

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

  useEffect(() => {
    const d = new Date(lastStaked ? +lastStaked * 1000 : 0)
    d.setDate(d.getDate() + 1)
    setDiff((Date.now() - d.getTime()) * -1)
  }, [lastStaked])

  const [timeLeft, actions] = useCountDown(diff, 1000)

  useEffect(() => {
    actions.start(diff)
  }, [actions, diff, lastStaked])

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
                  formTitle={<StakePageTitle title={`${t("stake")} ROSE`} />}
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
            extraStakeDetailChild={
              <Flex justifyContent="space-between" alignItems="center">
                {timeLeft && timeLeft > 0 ? (
                  <FaLock
                    size="25px"
                    color="#cc3a59"
                    title="Your stROSE is locked."
                  />
                ) : (
                  <FaUnlock
                    size="25px"
                    color="#4BB543"
                    title="Your stROSE is unlocked."
                  />
                )}
                <Tooltip
                  bgColor="#cc3a59"
                  closeOnClick={false}
                  label="This is an estimate of time remaining until you can unstake. Refresh the page for better accuracy."
                >
                  <Text
                    fontSize="25px"
                    fontWeight={700}
                    color="var(--text-title)"
                    borderBottom="1px dotted var(--text)"
                    cursor="help"
                  >
                    {new Date((timeLeft / 1000) * 1000)
                      .toISOString()
                      .substr(11, 8)}
                  </Text>
                </Tooltip>
              </Flex>
            }
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
