/* eslint @typescript-eslint/no-explicit-any: 0 */
/* eslint @typescript-eslint/no-unsafe-assignment: 0 */
/* eslint @typescript-eslint/no-unsafe-call: 0 */
/* eslint @typescript-eslint/no-unsafe-member-access: 0 */
/* eslint @typescript-eslint/no-unsafe-return: 0 */
import { Contract, ContractReceipt } from "@ethersproject/contracts"
import { POOLS_MAP, PoolName, TRANSACTION_TYPES } from "../constants"
import { addSlippage, subtractSlippage } from "../utils/slippage"
import { useLPTokenContract, usePoolContract } from "./useContract"
import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import { NumberInputState } from "../utils/numberInputState"
import checkAndApproveTokenForTrade from "../utils/checkAndApproveTokenForTrade"
import { formatUnits } from "@ethersproject/units"
import { updateLastTransactionTimes } from "../state/application"
import { useDispatch } from "react-redux"
import useGasPrice from "./useGasPrice"
import { useSelector } from "react-redux"
import { useWeb3React } from "@web3-react/core"

interface ApproveAndWithdrawStateArgument {
  tokenFormState: { [symbol: string]: NumberInputState }
  withdrawType: string
  lpTokenAmountToSpend: BigNumber
}

export function useApproveAndWithdraw(
  poolName: PoolName,
): (state: ApproveAndWithdrawStateArgument) => Promise<ContractReceipt | void> {
  const dispatch = useDispatch()
  const poolContract = usePoolContract(poolName) as Contract
  const { account, provider } = useWeb3React()
  const gasPrice = useGasPrice()

  const { slippageCustom, slippageSelected, infiniteApproval } = useSelector(
    (state: AppState) => state.user,
  )
  const lpTokenContract = useLPTokenContract(poolName)
  const POOL = POOLS_MAP[poolName]

  return async function approveAndWithdraw(
    state: ApproveAndWithdrawStateArgument,
  ): Promise<ContractReceipt | void> {
    try {
      if (!account) throw new Error("Wallet must be connected")
      if (!provider) throw new Error("Not connected to web3.")
      if (!poolContract) throw new Error("Swap contract is not loaded")
      if (state.lpTokenAmountToSpend.isZero()) return
      if (lpTokenContract == null) return

      const allowanceAmount =
        state.withdrawType === "IMBALANCE"
          ? addSlippage(
              state.lpTokenAmountToSpend,
              slippageSelected,
              slippageCustom,
            )
          : state.lpTokenAmountToSpend
      await checkAndApproveTokenForTrade(
        lpTokenContract,
        poolContract.address,
        account,
        allowanceAmount,
        infiniteApproval,
        gasPrice,
        {
          onTransactionError: () => {
            throw new Error("Your transaction could not be completed")
          },
        },
      )

      console.debug(
        `lpTokenAmountToSpend: ${formatUnits(state.lpTokenAmountToSpend, 18)}`,
      )
      let spendTransaction
      if (state.withdrawType === "ALL") {
        const txnAmounts: BigNumber[] = POOL.poolTokens.map((poolToken) => {
          return subtractSlippage(
            BigNumber.from(state.tokenFormState[poolToken.symbol].valueSafe),
            slippageSelected,
            slippageCustom,
          )
        })
        spendTransaction = await poolContract.remove_liquidity(
          state.lpTokenAmountToSpend,
          txnAmounts,
          {
            gasPrice,
          },
        )
      } else if (state.withdrawType === "IMBALANCE") {
        const txnAmounts: string[] = POOL.poolTokens.map((poolToken) => {
          return state.tokenFormState[poolToken.symbol].valueSafe
        })
        spendTransaction = await poolContract.remove_liquidity_imbalance(
          txnAmounts,
          addSlippage(
            state.lpTokenAmountToSpend,
            slippageSelected,
            slippageCustom,
          ),
          {
            gasPrice,
          },
        )
      } else {
        // state.withdrawType === [TokenSymbol]
        spendTransaction = await poolContract.remove_liquidity_one_coin(
          state.lpTokenAmountToSpend,
          POOL.poolTokens.findIndex(
            ({ symbol }) => symbol === state.withdrawType,
          ),
          subtractSlippage(
            BigNumber.from(
              state.tokenFormState[state.withdrawType || ""].valueSafe,
            ),
            slippageSelected,
            slippageCustom,
          ),
          {
            gasPrice,
          },
        )
      }

      const receipt = await spendTransaction.wait()
      dispatch(
        updateLastTransactionTimes({
          [TRANSACTION_TYPES.WITHDRAW]: Date.now(),
        }),
      )
      return receipt
    } catch (e) {
      console.error(e)
      throw e
    }
  }
}
