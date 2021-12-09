import { BigNumber } from "@ethersproject/bignumber"
import { Erc20 } from "../../types/ethers-contracts/Erc20"
import { RoseFraxLP } from "../../types/ethers-contracts/RoseFraxLP"
import { RoseStablesLP } from "../../types/ethers-contracts/RoseStablesLP"

export default async function checkTokenAllowance(
  srcTokenContract: Erc20 | RoseStablesLP | RoseFraxLP | null,
  swapAddress: string,
  spenderAddress: string,
  spendingValue: BigNumber,
): Promise<boolean> {
  if (srcTokenContract == null) return false
  if (spendingValue.eq(0)) return false

  const existingAllowance = await srcTokenContract.allowance(
    spenderAddress,
    swapAddress,
  )

  if (existingAllowance.gte(spendingValue)) return true

  return false
}
