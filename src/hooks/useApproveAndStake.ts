import { useRoseContract, useStRoseContract } from "./useContract"
import { BigNumber } from "@ethersproject/bignumber"
import { ContractReceipt } from "@ethersproject/contracts"
import { Erc20 } from "../../types/ethers-contracts/Erc20"
import { StRose } from "../../types/ethers-contracts/StRose"
import { Zero } from "@ethersproject/constants"
import checkAndApproveTokenForTrade from "../utils/checkAndApproveTokenForTrade"
import { useActiveWeb3React } from "."

export function useApproveAndStake(): (
  amount: string,
) => Promise<ContractReceipt | void> {
  const roseContract = useRoseContract() as Erc20
  const stRoseContract = useStRoseContract() as StRose
  const { account } = useActiveWeb3React()
  return async function approveAndStake(
    amount: string,
  ): Promise<ContractReceipt | void> {
    try {
      if (!account) throw new Error("Wallet must be connected")
      if (!roseContract || !stRoseContract)
        throw new Error("Rose contract is not loaded")
      const gasPrice = Zero
      const amountToStake = BigNumber.from(amount)
      await checkAndApproveTokenForTrade(
        roseContract,
        stRoseContract.address,
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
      const tx = await stRoseContract.mint(amountToStake)
      return await tx.wait()
    } catch (e) {
      console.error(e)
    }
  }
}
