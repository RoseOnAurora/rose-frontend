import { AddressZero, One, Zero } from "@ethersproject/constants"
import {
  BORROW_MARKET_MAP,
  BorrowMarketName,
  TRANSACTION_TYPES,
} from "../constants"
import {
  useBorrowContract,
  useCollateralContract,
  useGardenContract,
  useOracleContract,
  useVaseContract,
} from "./useContract"
import { useEffect, useState } from "react"
import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import { Erc20 } from "../../types/ethers-contracts/Erc20"
import { Garden } from "../../types/ethers-contracts/Garden"
import { Oracle } from "../../types/ethers-contracts/Oracle"
import { Vase } from "../../types/ethers-contracts/Vase"
import { useSelector } from "react-redux"
import { useWeb3React } from "@web3-react/core"

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
  tvl: BigNumber
  rusdUserBalance: BigNumber
  feesOwed: BigNumber
}

type BorrowDataHookReturnType = [BorrowDataType, boolean]

const emptyBorrowData = {
  collateralTokenBalance: Zero,
  collateralDeposited: Zero,
  borrowed: Zero,
  liquidationMultiplier: Zero,
  mcr: Zero,
  borrowFee: Zero,
  liquidationFee: Zero,
  rusdLeftToBorrow: Zero,
  interest: Zero,
  collateralDepositedUSDPrice: Zero,
  positionHealth: Zero,
  borrowedUSDPrice: Zero,
  priceOfCollateral: Zero,
  totalRUSDLeftToBorrow: Zero,
  tvl: Zero,
  rusdUserBalance: Zero,
  feesOwed: Zero,
} as BorrowDataType

export default function useBorrowData(
  borrowMarket: BorrowMarketName,
): BorrowDataHookReturnType {
  const { account } = useWeb3React()
  const gardenContract = useGardenContract(borrowMarket) as Garden
  const collateralTokenContract = useCollateralContract(borrowMarket) as Erc20
  const oracleContract = useOracleContract(borrowMarket) as Oracle
  const vaseContract = useVaseContract(borrowMarket) as Vase
  const rusdContract = useBorrowContract(borrowMarket) as Erc20
  const { lastTransactionTimes } = useSelector(
    (state: AppState) => state.application,
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
        !gardenContract ||
        !oracleContract ||
        !vaseContract ||
        !rusdContract
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
          // raw borrow data
          const fees = await gardenContract.accrueInfo()
          const [
            ,
            ,
            ,
            ,
            mcr,
            liquidationMultiplier,
            borrowFee,
            interstPerSecond,
          ] = await gardenContract.cloneInfo()
          const exchangeRate = await oracleContract.latestAnswer()
          const totalRUSDLeft = await vaseContract.balanceOf(
            await gardenContract.roseUsd(),
            gardenContract.address,
          )
          const tvl = await vaseContract.balanceOf(
            collateralTokenContract.address,
            gardenContract.address,
          )
          const rusdBalance = await rusdContract.balanceOf(account)
          const collateralBalance = await collateralTokenContract.balanceOf(
            account,
          )
          const collateralDeposited = await gardenContract.userCollateralShare(
            account,
          )
          const borrowed = await gardenContract.userBorrowPart(account)

          // cast to 18 precision to facilitate BN math
          const exchangeRateAdj = exchangeRate.mul(BigNumber.from(10).pow(10)) // exchange rate is e^8 precision

          // usd conversion using exchange rate
          const USD_CONVERSION_BN = (factor: BigNumber) =>
            factor.mul(exchangeRateAdj).div(BigNumber.from(10).pow(18))

          // token conversions
          const borrowTokenConversion = BigNumber.from(10).pow(
            Math.abs(18 - BORROW_MARKET.borrowToken.decimals),
          )
          const collateralTokenConversion = BigNumber.from(10).pow(
            Math.abs(18 - BORROW_MARKET.collateralToken.decimals),
          )
          const mcrAdj = mcr.mul(BigNumber.from(10).pow(13)) // mcr is e^5 precision
          const borrowFeeAdj = borrowFee.mul(BigNumber.from(10).pow(13)) // borrowfee is e^5 precision
          const liquidationMultiplierAdj = liquidationMultiplier.mul(
            BigNumber.from(10).pow(13),
          ) // liquidationMultiplier is e^5 precision

          // interest per year using 31557600 sec in a year
          const interestPerYear = interstPerSecond.mul(
            BigNumber.from("31557600"),
          )
          const borrowedAdj = borrowed.mul(borrowTokenConversion)

          // handle case with > 18 decimals
          const collateralDepositedAdj =
            BORROW_MARKET.collateralToken.decimals > 18
              ? collateralDeposited.div(collateralTokenConversion)
              : collateralDeposited.mul(collateralTokenConversion)
          const collateralBalanceAdj =
            BORROW_MARKET.collateralToken.decimals > 18
              ? collateralBalance.div(collateralTokenConversion)
              : collateralBalance.mul(collateralTokenConversion)
          const tvlAdj =
            BORROW_MARKET.collateralToken.decimals > 18
              ? tvl.div(collateralTokenConversion)
              : tvl.mul(collateralTokenConversion)

          // get USD conversions
          const tvlUsd = USD_CONVERSION_BN(tvlAdj)
          const collateralDepositedUSDPrice = USD_CONVERSION_BN(
            collateralDepositedAdj,
          )
          const borrowedUSDPrice = USD_CONVERSION_BN(borrowedAdj)

          // compute position health as fx of borrow/collateral
          const positionHealth = collateralDepositedAdj.isZero()
            ? BigNumber.from(0)
            : borrowedAdj
                .mul(BigNumber.from(10).pow(18))
                .div(collateralDepositedUSDPrice)

          // compute rusd left for user as fx of mcr and collateral deposited
          // and adjust it
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
            .mul(
              collateralDepositedAdj
                .mul(exchangeRateAdj)
                .div(BigNumber.from(10).pow(18)),
            )
            .div(BigNumber.from(10).pow(18))
          const rusdLeftToBorrowAdj = rusdLeftToBorrow.sub(
            rusdLeftToBorrow.mul(borrowFeeAdj).div(BigNumber.from(10).pow(18)),
          )

          // set borrow data state
          setBorrowData((prevState) => [
            {
              ...prevState[0],
              marketName: borrowMarket,
              collateralTokenBalance: collateralBalanceAdj,
              collateralDeposited: collateralDepositedAdj,
              collateralDepositedUSDPrice: collateralDepositedUSDPrice,
              borrowed: borrowedAdj,
              rusdLeftToBorrow: rusdLeftToBorrowAdj,
              positionHealth: positionHealth,
              borrowedUSDPrice: borrowedUSDPrice,
              totalRUSDLeftToBorrow: totalRUSDLeft,
              liquidationMultiplier: liquidationMultiplierAdj,
              interest: interestPerYear,
              mcr: mcrAdj,
              borrowFee: borrowFeeAdj,
              liquidationFee: liquidationMultiplierAdj
                .sub(BigNumber.from("10").pow(18))
                .abs(),
              priceOfCollateral: exchangeRateAdj,
              tvl: tvlUsd,
              rusdUserBalance: rusdBalance,
              feesOwed: fees[1], // [1] is feesEarned in garden (i.e. fees owed)
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
    gardenContract,
    collateralTokenContract,
    oracleContract,
    vaseContract,
    rusdContract,
  ])

  return borrowData
}
