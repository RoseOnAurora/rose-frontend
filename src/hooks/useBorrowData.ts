import { AddressZero, One, Zero } from "@ethersproject/constants"
import {
  BORROW_MARKET_MAP,
  BorrowMarketName,
  TRANSACTION_TYPES,
} from "../constants"
import {
  useBentoBoxContract,
  useCauldronContract,
  useCollateralContract,
  useOracleContract,
} from "./useContract"
import { useEffect, useState } from "react"
import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import { Cauldron } from "../../types/ethers-contracts/Cauldron"
import { Erc20 } from "../../types/ethers-contracts/Erc20"
import { Oracle } from "../../types/ethers-contracts/Oracle"
import { parseUnits } from "ethers/lib/utils"
import { useActiveWeb3React } from "."
import { useSelector } from "react-redux"

export interface BorrowDataType {
  marketName: BorrowMarketName
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
  positionHealth: BigNumber
  borrowedUSDPrice: BigNumber
  priceOfCollateral: BigNumber
  totalRUSDLeftToBorrow: BigNumber
}

type BorrowDataHookReturnType = [BorrowDataType, boolean]

const emptyBorrowData = {
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
  positionHealth: parseUnits("1", 18),
  borrowedUSDPrice: Zero,
  priceOfCollateral: parseUnits("1", 18),
  totalRUSDLeftToBorrow: Zero,
} as BorrowDataType

export default function useBorrowData(
  borrowMarket: BorrowMarketName,
): BorrowDataHookReturnType {
  const { account } = useActiveWeb3React()
  const cauldronContract = useCauldronContract(borrowMarket) as Cauldron
  const collateralTokenContract = useCollateralContract(borrowMarket) as Erc20
  const oracleContract = useOracleContract(borrowMarket) as Oracle
  const bentoBoxContract = useBentoBoxContract(borrowMarket)
  const { lastTransactionTimes } = useSelector(
    (state: AppState) => state.application,
    (l, r) =>
      l.lastTransactionTimes[TRANSACTION_TYPES.BORROW] ===
      r.lastTransactionTimes[TRANSACTION_TYPES.BORROW],
  )
  const lastBorrowTime = lastTransactionTimes[TRANSACTION_TYPES.BORROW]

  const [borrowData, setBorrowData] = useState<BorrowDataHookReturnType>([
    {
      ...emptyBorrowData,
      marketName: borrowMarket,
    },
    true,
  ])

  useEffect(() => {
    async function getBorrowData(): Promise<void> {
      if (
        !collateralTokenContract ||
        !cauldronContract ||
        !oracleContract ||
        !bentoBoxContract
      ) {
        setBorrowData([
          {
            ...emptyBorrowData,
            marketName: borrowMarket,
          },
          false,
        ])
        return
      }

      const BORROW_MARKET = BORROW_MARKET_MAP[borrowMarket]

      if (account && account != AddressZero && account != null) {
        try {
          const exchangeRate = await oracleContract.latestAnswer()
          const USD_CONVERSION_BN = (factor: BigNumber) =>
            factor.mul(exchangeRate).div(BigNumber.from(10).pow(18))
          const liquidationMultiplier = await cauldronContract.LIQUIDATION_MULTIPLIER()
          const mcr = await cauldronContract.COLLATERIZATION_RATE()
          const borrowFee = await cauldronContract.BORROW_OPENING_FEE()
          const totalRUSDLeft = await bentoBoxContract.balanceOf(
            await cauldronContract.roseUsd(),
            cauldronContract.address,
          )

          // cast to 18 precision to facilitate BN math
          const mcrAdj = mcr.mul(BigNumber.from(10).pow(13)) // mcr is e^5 precision
          const borrowFeeAdj = borrowFee.mul(BigNumber.from(10).pow(13)) // borrowfee is e^5 precision
          const liquidationMultiplierAdj = liquidationMultiplier.mul(
            // liquidationMultiplier is e^5 precision
            BigNumber.from(10).pow(13),
          )
          const accrueInfo = await cauldronContract.accrueInfo()
          const interestPerYear = accrueInfo[2].mul(BigNumber.from("31557600"))
          const collateralBalance = await collateralTokenContract.balanceOf(
            account,
          )
          const collateralDeposited = await cauldronContract.userCollateralShare(
            account,
          )
          const borrowed = await cauldronContract.userBorrowPart(account)

          const borrowedAdj = borrowed.mul(
            BigNumber.from(10).pow(18 - BORROW_MARKET.borrowToken.decimals),
          )
          const collateralDepositedAdj = collateralDeposited.mul(
            BigNumber.from(10).pow(18 - BORROW_MARKET.collateralToken.decimals),
          )
          const collateralBalanceAdj = collateralBalance.mul(
            BigNumber.from(10).pow(18 - BORROW_MARKET.collateralToken.decimals),
          )
          const collateralDepositedUSDPrice = USD_CONVERSION_BN(
            collateralDepositedAdj,
          )
          const positionHealth = collateralDepositedAdj.isZero()
            ? parseUnits("1", 18)
            : parseUnits("1", 18).sub(
                borrowedAdj
                  .mul(BigNumber.from(10).pow(18))
                  .div(collateralDepositedUSDPrice),
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
              marketName: borrowMarket,
              collateralTokenBalance: collateralBalanceAdj,
              collateralDeposited: collateralDepositedAdj,
              collateralDepositedUSDPrice: collateralDepositedUSDPrice,
              borrowed: borrowedAdj,
              rusdLeftToBorrow: rusdLeftToBorrow,
              positionHealth: positionHealth,
              borrowedUSDPrice: borrowedUSDPrice,
              totalRUSDLeftToBorrow: totalRUSDLeft,
              liquidationMultiplier: liquidationMultiplierAdj,
              interest: interestPerYear,
              mcr: mcrAdj,
              borrowFee: borrowFeeAdj,
              liquidationFee: liquidationMultiplierAdj.sub(
                BigNumber.from("10").pow(18),
              ),
              priceOfCollateral: exchangeRate.isZero()
                ? parseUnits("1", 18)
                : exchangeRate,
            },
            false,
          ])
        } catch (e) {
          console.log(e)
          setBorrowData((prevState) => [prevState[0], false])
        }
      } else {
        setBorrowData([
          {
            ...emptyBorrowData,
            marketName: borrowMarket,
          },
          false,
        ])
      }
    }
    void getBorrowData()
  }, [
    lastBorrowTime,
    borrowMarket,
    account,
    cauldronContract,
    collateralTokenContract,
    oracleContract,
    bentoBoxContract,
  ])

  return borrowData
}
