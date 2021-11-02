import React, { ReactElement, useMemo } from "react"
import { BigNumber } from "@ethersproject/bignumber"
import { ROSE_TOKENS_MAP } from "../constants"
import StakeDetails from "../components/StakeDetails"
import StakePage from "../components/StakePage"
import TopMenu from "../components/TopMenu"
import { Zero } from "@ethersproject/constants"
import { commify } from "@ethersproject/units"
import { formatBNToString } from "../utils"
import { isEmpty } from "lodash"
import styles from "./Stake.module.scss"
import { useApproveAndStake } from "../hooks/useApproveAndStake"
import { useApproveAndUnstake } from "../hooks/useApproveAndUnstake"
import { useRoseTokenBalances } from "../state/wallet/hooks"

export type BalanceDetails = {
  balance: TokenDetails
  staked: TokenDetails
}

export type TokenDetails = {
  amount: BigNumber
  decimals: number
}

const Stake = (): ReactElement => {
  const tokenBalances = useRoseTokenBalances()
  const stake = useApproveAndStake()
  const unstake = useApproveAndUnstake()
  const tokenBalanceDetails = useMemo((): BalanceDetails => {
    const [roseToken, stRoseToken] = Object.values(ROSE_TOKENS_MAP).map(
      ({ symbol, decimals }) => {
        const amount = tokenBalances?.[symbol] || Zero
        return {
          decimals,
          amount,
        }
      },
    )
    return {
      balance: {
        amount: roseToken.amount,
        decimals: roseToken.decimals,
      },
      staked: {
        amount: stRoseToken.amount,
        decimals: stRoseToken.decimals,
      },
    }
  }, [tokenBalances])
  return (
    <div className={styles.stakePage}>
      <TopMenu activeTab="stake" />
      <div className={styles.container}>
        <div className={styles.content}>
          <StakePage
            balance={tokenBalanceDetails.balance}
            staked={tokenBalanceDetails.staked}
            approveStake={stake}
            approveUnstake={unstake}
          />
          <StakeDetails
            balanceView={formatBNToString(
              tokenBalanceDetails.balance.amount || Zero,
              tokenBalanceDetails.balance.decimals || 0,
              6,
            )}
            stakedView={commify(
              formatBNToString(
                tokenBalanceDetails.staked.amount || Zero,
                tokenBalanceDetails.staked.decimals || 0,
                6,
              ),
            )}
            loading={isEmpty(tokenBalances) ? true : false}
          />
        </div>
      </div>
    </div>
  )
}

export default Stake
