import { AddressZero, One, Zero } from "@ethersproject/constants"
import {
  BORROW_MARKET_MAP,
  BorrowMarketName,
  TRANSACTION_TYPES,
} from "../constants"
import { formatBNToString, getContract } from "../utils"
import { useEffect, useState } from "react"
import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import CAULDRON_ABI from "../constants/abis/Cauldron.json"
import { Cauldron } from "../../types/ethers-contracts/Cauldron"
import ERC20_ABI from "../constants/abis/erc20.json"
import { Erc20 } from "../../types/ethers-contracts/Erc20"
import { parseUnits } from "ethers/lib/utils"
import { useActiveWeb3React } from "."
import { useSelector } from "react-redux"

export interface BorrowDataType {
  collateralTokenBalance: BigNumber
  collateralDeposited: BigNumber
  borrowed: BigNumber
  liquidationMultiplier: BigNumber
  mcr: BigNumber
  borrowFee: BigNumber
  liquidationFee: BigNumber
  rusdLeftToBorrow: BigNumber
  interest: BigNumber
  collateralDepositedUSDPrice: BigNumber
  borrowedUSDPrice: BigNumber
  priceOfCollateral: number
}

type BorrowDataHookReturnType = [BorrowDataType, boolean]

const emptyBorrowData = [
  {
    collateralTokenBalance: Zero,
    collateralDeposited: Zero,
    borrowed: Zero,
    liquidationMultiplier: One,
    mcr: parseUnits("0.9", 18),
    borrowFee: parseUnits("0.01"),
    liquidationFee: parseUnits("0.05"),
    rusdLeftToBorrow: Zero,
    interest: parseUnits("0.0249"),
    collateralDepositedUSDPrice: Zero,
    borrowedUSDPrice: Zero,
    priceOfCollateral: 1,
  },
  true,
] as BorrowDataHookReturnType

export default function useBorrowData(
  borrowMarket: BorrowMarketName,
): BorrowDataHookReturnType {
  const { account, library, chainId } = useActiveWeb3React()
  const { lastTransactionTimes, tokenPricesUSD } = useSelector(
    (state: AppState) => state.application,
  )
  const lastBorrowTime = lastTransactionTimes[TRANSACTION_TYPES.BORROW]

  const [borrowData, setBorrowData] = useState<BorrowDataHookReturnType>(
    emptyBorrowData,
  )

  useEffect(() => {
    async function getBorrowData(): Promise<void> {
      if (library == null || chainId == null) {
        setBorrowData([emptyBorrowData[0], false])
        return
      }

      const BORROW_MARKET = BORROW_MARKET_MAP[borrowMarket]

      const priceOfCollateral =
        tokenPricesUSD?.[BORROW_MARKET.collateralToken.symbol] || 1

      const USD_CONVERSION_BN = (factor: BigNumber) =>
        factor
          .mul(parseUnits(String(priceOfCollateral || 0), 18))
          .div(BigNumber.from(10).pow(18))

      const collateralTokenContract = getContract(
        BORROW_MARKET.collateralToken.addresses[chainId],
        ERC20_ABI,
        library,
        account ?? undefined,
      ) as Erc20

      const cauldronContract = getContract(
        BORROW_MARKET.cauldronAddresses[chainId],
        JSON.stringify(CAULDRON_ABI),
        library,
        account ?? undefined,
      ) as Cauldron

      if (account && account != AddressZero && account != null) {
        try {
          const collateralBalance = await collateralTokenContract.balanceOf(
            account,
          )
          const collateralDeposited = await cauldronContract.userCollateralShare(
            account,
          )
          console.log(
            "EXCHANGE RATE: ",
            formatBNToString(await cauldronContract.exchangeRate(), 18),
          )
          const borrowed = await cauldronContract.userBorrowPart(account)
          const liquidationMultiplier = await cauldronContract.LIQUIDATION_MULTIPLIER()
          const mcr = await cauldronContract.COLLATERIZATION_RATE()
          const borrowFee = await cauldronContract.BORROW_OPENING_FEE()

          // cast to 18 precision to facilitate BN math
          const mcrAdj = mcr.mul(BigNumber.from(10).pow(13)) // mcr is e^5 precision
          const borrowFeeAdj = borrowFee.mul(BigNumber.from(10).pow(13)) // borrowfee is e^5 precision
          const liquidationMultiplierAdj = liquidationMultiplier.mul(
            // liquidationMultiplier is e^5 precision
            BigNumber.from(10).pow(13),
          )
          const borrowedAdj = borrowed.mul(
            BigNumber.from(10).pow(18 - BORROW_MARKET.borrowToken.decimals),
          )
          const collateralDepositedAdj = collateralDeposited.mul(
            BigNumber.from(10).pow(18 - BORROW_MARKET.collateralToken.decimals),
          )
          const collateralBalanceAdj = collateralBalance.mul(
            BigNumber.from(10).pow(18 - BORROW_MARKET.collateralToken.decimals),
          )
          const accrueInfo = await cauldronContract.accrueInfo()
          const interestPerSecond = accrueInfo[2].mul(
            BigNumber.from("31557600"),
          )
          const collateralDepositedUSDPrice = USD_CONVERSION_BN(
            collateralDepositedAdj,
          )
          const borrowedUSDPrice = USD_CONVERSION_BN(borrowedAdj)
          const rusdLeftToBorrow = mcrAdj
            .sub(
              borrowed
                .mul(BigNumber.from(10).pow(18))
                .div(
                  collateralDepositedUSDPrice.isZero()
                    ? One
                    : collateralDepositedUSDPrice,
                ),
            )
            .mul(collateralDepositedAdj)
            .div(BigNumber.from(10).pow(18))
          setBorrowData((prevState) => [
            {
              ...prevState[0],
              collateralTokenBalance: collateralBalanceAdj,
              collateralDeposited: collateralDepositedAdj,
              collateralDepositedUSDPrice: collateralDepositedUSDPrice,
              borrowed: borrowedAdj,
              liquidationMultiplier: liquidationMultiplierAdj,
              interest: interestPerSecond,
              mcr: mcrAdj,
              borrowFee: borrowFeeAdj,
              liquidationFee: liquidationMultiplierAdj.sub(
                BigNumber.from("10").pow(18),
              ),
              rusdLeftToBorrow: rusdLeftToBorrow,
              priceOfCollateral: priceOfCollateral,
              borrowedUSDPrice: borrowedUSDPrice,
            },
            false,
          ])
        } catch (e) {
          console.error(e)
          setBorrowData((prevState) => [{ ...prevState[0] }, false])
        }
      } else {
        setBorrowData([emptyBorrowData[0], false])
      }
    }
    void getBorrowData()
  }, [lastBorrowTime, borrowMarket, account, library, chainId, tokenPricesUSD])

  return borrowData
}
