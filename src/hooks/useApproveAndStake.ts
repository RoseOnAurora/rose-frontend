/* eslint @typescript-eslint/no-unsafe-member-access: 0 */
/* eslint @typescript-eslint/no-unsafe-call: 0 */
/* eslint @typescript-eslint/no-explicit-any: 0 */
import { ChainId, TRANSACTION_TYPES } from "../constants"
import { useDispatch, useSelector } from "react-redux"
import { useRoseContract, useStRoseContract } from "./useContract"
import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import { ContractReceipt } from "@ethersproject/contracts"
import { Erc20 } from "../../types/ethers-contracts/Erc20"
import { GasPrices } from "../state/user"
import { StRose } from "../../types/ethers-contracts/StRose"
import { Zero } from "@ethersproject/constants"
import checkAndApproveTokenForTrade from "../utils/checkAndApproveTokenForTrade"
import { parseUnits } from "ethers/lib/utils"
import { updateLastTransactionTimes } from "../state/application"
import { useWeb3React } from "@web3-react/core"

export function useApproveAndStake(): (
  amount: string,
) => Promise<ContractReceipt | void> {
  const roseContract = useRoseContract() as Erc20
  const stRoseContract = useStRoseContract() as StRose
  const { account, chainId } = useWeb3React()
  const { gasPriceSelected, gasCustom } = useSelector(
    (state: AppState) => state.user,
  )
  const { gasStandard, gasFast, gasInstant } = useSelector(
    (state: AppState) => state.application,
  )
  const dispatch = useDispatch()
  return async function approveAndStake(
    amount: string,
    onApprovalTransactionStart?: () => void,
  ): Promise<ContractReceipt | void> {
    try {
      if (!account) throw new Error("Wallet must be connected")
      if (!roseContract || !stRoseContract)
        throw new Error("Rose contract is not loaded")
      let gasPrice: any
      if (gasPriceSelected === GasPrices.Custom) {
        gasPrice = gasCustom?.valueSafe
      } else if (gasPriceSelected === GasPrices.Fast) {
        gasPrice = gasFast
      } else if (gasPriceSelected === GasPrices.Instant) {
        gasPrice = gasInstant
      } else {
        gasPrice = gasStandard
      }
      gasPrice = parseUnits(gasPrice?.toString() || "45", "gwei")

      const amountToStake = BigNumber.from(amount)
      await checkAndApproveTokenForTrade(
        roseContract,
        stRoseContract.address,
        account,
        amountToStake,
        true,
        chainId === ChainId.AURORA_TESTNET ? Zero : gasPrice,
        {
          onTransactionStart: () => {
            onApprovalTransactionStart?.()
            return undefined
          },
        },
      )
      const tx = await stRoseContract.mint(amountToStake)
      const receipt = await tx.wait()
      dispatch(
        updateLastTransactionTimes({
          [TRANSACTION_TYPES.STAKE]: Date.now(),
        }),
      )
      return receipt
    } catch (e) {
      const error = e as { code: number; message: string }
      throw error
    }
  }
}
