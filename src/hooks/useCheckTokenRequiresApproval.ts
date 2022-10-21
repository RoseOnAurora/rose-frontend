import { Erc20 } from "../../types/ethers-contracts/Erc20"
import { LpTokenUnguarded } from "../../types/ethers-contracts/LpTokenUnguarded"
import { RoseStablesFarm } from "../../types/ethers-contracts/RoseStablesFarm"
import checkTokenAllowance from "../utils/checkTokenAllowance"
import parseStringToBigNumber from "../utils/parseStringToBigNumber"
import { useState } from "react"
import { useWeb3React } from "@web3-react/core"

export function useCheckTokenRequiresApproval(
  srcTokenContract: Erc20 | LpTokenUnguarded | null,
  dstTokenContract: RoseStablesFarm | Erc20 | null,
  timeout = 500,
): [boolean, boolean, (spendingValue: string) => void] {
  const { account } = useWeb3React()
  const [approved, setApproved] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [timer, setTimer] = useState<NodeJS.Timer>()
  const checkApproval = function tokenRequiresApproval(
    spendingValue: string,
  ): void {
    try {
      if (!account) throw new Error("Wallet must be connected")
      if (!srcTokenContract || !dstTokenContract)
        throw new Error("Contracts are not loaded")
      const valueSafe = parseStringToBigNumber(spendingValue, 18)
      clearTimeout(timer as NodeJS.Timer)
      setLoading(true)
      const newTimer = setTimeout(() => {
        checkTokenAllowance(
          srcTokenContract,
          dstTokenContract.address,
          account,
          valueSafe.value,
        )
          .then((isApproved) => {
            setApproved(isApproved)
            setLoading(false)
          })
          .catch((e) => console.error(e))
      }, timeout)
      setTimer(newTimer)
    } catch (e) {
      console.error(e)
    }
  }
  return [approved, loading, checkApproval]
}
