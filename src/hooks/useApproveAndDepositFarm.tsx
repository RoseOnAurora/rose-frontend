/* eslint sort-imports: 0 */
/* eslint @typescript-eslint/no-unsafe-member-access: 0 */
/* eslint @typescript-eslint/no-unsafe-call: 0 */
import { FarmName, TRANSACTION_TYPES } from "../constants"
import { useFarmContract, useLPTokenContractForFarm } from "./useContract"
import { BigNumber } from "@ethersproject/bignumber"
import { ContractReceipt } from "@ethersproject/contracts"
import { RoseStablesFarm } from "../../types/ethers-contracts/RoseStablesFarm"
// import { Zero } from "@ethersproject/constants"
import checkAndApproveTokenForTrade from "../utils/checkAndApproveTokenForTrade"
import { updateLastTransactionTimes } from "../state/application"
import { useActiveWeb3React } from "."
import { useDispatch, useSelector } from "react-redux"
import { AppState } from "../state"
import { GasPrices } from "../state/user"
import { parseUnits } from "ethers/lib/utils"

export function useApproveAndDepositFarm(
  farmName: FarmName,
): (amount: string) => Promise<ContractReceipt | void> {
  const dispatch = useDispatch()
  const farmContract = useFarmContract(farmName) as RoseStablesFarm
  const lpTokenContract = useLPTokenContractForFarm(farmName)
  const { gasPriceSelected, gasCustom } = useSelector(
    (state: AppState) => state.user,
  )
  const { gasStandard, gasFast, gasInstant } = useSelector(
    (state: AppState) => state.application,
  )
  const { account } = useActiveWeb3React()
  return async function approveAndStake(
    amount: string,
  ): Promise<ContractReceipt | void> {
    try {
      if (!account) throw new Error("Wallet must be connected")
      if (!farmContract) throw new Error("Farm contract is not loaded")
      if (!lpTokenContract) throw new Error("LP Token contract is not loaded")
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
        lpTokenContract,
        farmContract.address,
        account,
        amountToStake,
        true,
        gasPrice,
        {
          onTransactionError: (error) => {
            console.error(error)
            throw new Error("Your transaction could not be completed")
          },
        },
      )
      const tx = await farmContract.stake(amountToStake)
      const receipt = await tx.wait()
      dispatch(
        updateLastTransactionTimes({
          [TRANSACTION_TYPES.DEPOSIT]: Date.now(),
        }),
      )
      return receipt
    } catch (e) {
      console.error(e)
    }
  }
}
