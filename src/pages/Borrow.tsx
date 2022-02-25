import { BORROW_MARKET_MAP, BorrowMarketName } from "../constants"
import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  IconButton,
  Progress,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { FaHandHoldingMedical, FaInfoCircle } from "react-icons/fa"
import React, { ReactElement, useRef } from "react"
import { commify, formatBNToPercentString, formatBNToString } from "../utils"
import useChakraToast, { TransactionType } from "../hooks/useChakraToast"
import BackButton from "../components/BackButton"
import { BigNumber } from "@ethersproject/bignumber"
import BlockExplorerLink from "../components/BlockExplorerLink"
import BorrowForm from "../components/BorrowForm"
import ComponentWrapper from "../components/wrappers/ComponentWrapper"
import { ContractReceipt } from "ethers"
import PageWrapper from "../components/wrappers/PageWrapper"
import RepayForm from "../components/RepayForm"
import StakeDetails from "../components/StakeDetails"
import TabsWrapper from "../components/wrappers/TabsWrapper"
import { Zero } from "@ethersproject/constants"
import parseStringToBigNumber from "../utils/parseStringToBigNumber"
import { parseUnits } from "@ethersproject/units"
import useBorrowData from "../hooks/useBorrowData"
import { useCook } from "../hooks/useCook"
import { useTranslation } from "react-i18next"

interface Props {
  borrowName: BorrowMarketName
}

const Borrow = ({ borrowName }: Props): ReactElement => {
  const { t } = useTranslation()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [borrowData] = useBorrowData(borrowName)
  const btnRef = useRef<HTMLButtonElement>(null)
  const toast = useChakraToast()
  const cook = useCook(borrowName)

  const { borrowToken, collateralToken } = BORROW_MARKET_MAP[borrowName]

  const calculateMaxBorrow = (collateralAmount: string): BigNumber => {
    const totalCollateral = borrowData.collateralDeposited.add(
      parseStringToBigNumber(collateralAmount, 18, Zero).value,
    )
    if (totalCollateral.isZero()) return Zero
    const maxBorrow = borrowData.mcr
      .sub(
        borrowData.borrowed
          .mul(BigNumber.from(10).pow(18))
          .div(
            totalCollateral
              .mul(borrowData.priceOfCollateral)
              .div(BigNumber.from(10).pow(18)),
          ),
      )
      .mul(
        totalCollateral
          .mul(borrowData.priceOfCollateral)
          .div(BigNumber.from(10).pow(18)),
      )
      .div(BigNumber.from(10).pow(18))

    const maxBorrowAdj = maxBorrow.sub(
      maxBorrow.mul(borrowData.borrowFee).div(BigNumber.from(10).pow(18)),
    )

    return maxBorrowAdj.gt(parseUnits("0.01")) ? maxBorrowAdj : Zero
  }

  const calculateMaxWithdraw = (repayAmount: string): BigNumber => {
    const totalBorrowed = borrowData.borrowed.sub(
      parseUnits(repayAmount || "0"),
    )
    return borrowData.collateralDepositedUSDPrice
      .sub(totalBorrowed.mul(BigNumber.from(10).pow(18)).div(borrowData.mcr))
      .mul(BigNumber.from(10).pow(18))
      .div(borrowData.priceOfCollateral)
  }

  const validateBorrow = (
    borrowAmount: string,
    collateralAmount: string,
  ): string | undefined => {
    const generalValidation = validateAmount(borrowAmount)
    if (validateDepositCollateral(collateralAmount)) {
      return "Collateral field has errors."
    }
    if (generalValidation || borrowAmount === "") {
      return generalValidation || undefined
    }

    const currentBorrow = parseUnits(borrowAmount, 18)
    const maxBorrow = calculateMaxBorrow(collateralAmount)

    if (maxBorrow.isZero()) {
      return "Deposit collateral first to borrow."
    }
    if (currentBorrow.gt(maxBorrow)) {
      return `Must be less than ${formatBNToString(maxBorrow, 18, 5)} RUSD.`
    }
  }

  const validateDepositCollateral = (amount: string): string | undefined => {
    const generalValidation = validateAmount(amount)
    if (generalValidation || amount === "") {
      return generalValidation || undefined
    }
    if (parseUnits(amount, 18).gt(borrowData.collateralTokenBalance)) {
      return t("insufficientBalance")
    }
  }

  const validateRepay = (borrowAmount: string): string | undefined => {
    const generalValidation = validateAmount(borrowAmount)
    if (generalValidation || borrowAmount === "") {
      return generalValidation || undefined
    }
    if (parseUnits(borrowAmount, 18).gt(borrowData.borrowed)) {
      return t("insufficientBalance")
    }
  }

  const validateWithdrawCollateral = (
    borrowAmount: string,
    collateralAmount: string,
  ): string | undefined => {
    const generalValidation = validateAmount(collateralAmount)
    if (validateRepay(borrowAmount)) {
      return "Repay field has errors."
    }
    if (generalValidation || collateralAmount === "") {
      return generalValidation || undefined
    }

    const currentWithdraw = parseUnits(collateralAmount, 18)
    const maxWithdraw = calculateMaxWithdraw(borrowAmount)

    if (currentWithdraw.gt(maxWithdraw)) {
      return `Must be less than ${formatBNToString(maxWithdraw, 18, 5)} ${
        collateralToken.symbol
      }.`
    }
  }

  const validateAmount = (amount: string): string | null => {
    const decimalRegex = /^[0-9]\d*(\.\d{1,18})?$/
    if (amount && !decimalRegex.exec(amount)) {
      return t("Invalid number.")
    }
    return null
  }

  const liquidationPriceHelper = (
    borrow: BigNumber,
    collateral: BigNumber,
  ): BigNumber => {
    if (collateral.add(borrowData.collateralDeposited).isZero()) return Zero
    return borrowData.borrowedUSDPrice
      .add(
        borrow
          .mul(borrowData.priceOfCollateral)
          .div(BigNumber.from(10).pow(18)),
      )
      .mul(BigNumber.from(10).pow(18))
      .div(collateral.add(borrowData.collateralDeposited))
      .mul(BigNumber.from(10).pow(18))
      .div(borrowData.priceOfCollateral)
      .mul(borrowData.liquidationMultiplier)
      .div(BigNumber.from(10).pow(18))
  }

  const liquidationPriceFormatted = (
    borrow = Zero,
    collateral = Zero,
  ): string => {
    const price = liquidationPriceHelper(borrow, collateral)
    const formatted = price.lte(Zero)
      ? "$0.00"
      : `$${commify(formatBNToString(price, 18, 3))}`
    return formatted
  }

  const updateCurrLiquidationPrice = (
    borrowAmount: string,
    collateralAmount: string,
    negate = false,
  ): string => {
    const validateBorrow = validateAmount(borrowAmount)
    const validateCollateral = validateAmount(collateralAmount)
    if (validateBorrow || validateCollateral) return "$xx.xxx"
    const formattedBorrowAmount =
      borrowAmount && negate ? `-${borrowAmount}` : borrowAmount
    const formattedcollateralAmount =
      collateralAmount && negate ? `-${collateralAmount}` : collateralAmount
    const borrowAmountBn = parseUnits(formattedBorrowAmount || "0", 18)
    const collateralAmountBn = parseUnits(formattedcollateralAmount || "0", 18)
    return liquidationPriceFormatted(borrowAmountBn, collateralAmountBn)
  }

  const updatePositionHealth = (
    borrowAmount: string,
    collateralAmount: string,
    negate = false,
  ): number => {
    const validateBorrow = validateAmount(borrowAmount)
    const validateCollateral = validateAmount(collateralAmount)
    if (validateBorrow || validateCollateral) return 100

    const formattedBorrowAmount =
      borrowAmount && negate ? `-${borrowAmount}` : borrowAmount
    const formattedcollateralAmount =
      collateralAmount && negate ? `-${collateralAmount}` : collateralAmount

    const borrowAmountBn = parseUnits(formattedBorrowAmount || "0", 18)
    const collateralAmountBn = parseUnits(formattedcollateralAmount || "0", 18)

    const currentCollateralUSD = collateralAmountBn
      .mul(borrowData.priceOfCollateral)
      .div(BigNumber.from(10).pow(18))
      .add(borrowData.collateralDepositedUSDPrice)

    const currentPositionHealth = collateralAmountBn
      .add(borrowData.collateralDepositedUSDPrice)
      .isZero()
      ? parseUnits("1", 18)
      : parseUnits("1", 18).sub(
          borrowAmountBn
            .add(borrowData.borrowed)
            .mul(BigNumber.from(10).pow(18))
            .div(
              currentCollateralUSD.isZero()
                ? parseUnits("1", 18)
                : currentCollateralUSD,
            ),
        )

    return +formatBNToString(currentPositionHealth, 18) * 100
  }

  const positionHealth = (): number => {
    return +formatBNToString(borrowData.positionHealth, 18) * 100
  }

  const postTransaction = (
    receipt: ContractReceipt | null,
    transactionType: TransactionType,
    error?: { code: number; message: string },
  ): void => {
    const description = receipt?.transactionHash ? (
      <BlockExplorerLink
        txnType={transactionType}
        txnHash={receipt?.transactionHash}
        status={receipt?.status ? "Succeeded" : "Failed"}
      />
    ) : null
    if (receipt?.status) {
      toast.transactionSuccess({
        txnType: transactionType,
        description: description,
      })
    } else {
      toast.transactionFailed({
        txnType: transactionType,
        error,
        description: description,
      })
    }
  }

  const preTransaction = (txnType: TransactionType) =>
    toast.transactionPending({
      txnType,
    })

  const onSubmitting = {
    onMessageSignatureTransactionStart: () => toast.signatureRequired(),
    onApprovalTransactionStart: () => toast.approvalRequired(),
  }

  const submitButtonLabelText = (
    borrow: string,
    collateral: string,
    borrowError: string | undefined,
    collateralError: string | undefined,
    txnType: TransactionType,
  ) => {
    if (
      (borrow === "" && collateral === "") ||
      (!borrowError && !collateralError && +borrow !== 0 && +collateral !== 0)
    ) {
      return txnType === TransactionType.BORROW
        ? "Add Collateral & Borrow"
        : "Repay & Withdraw Collateral"
    }
    if (borrowError || collateralError) {
      return borrowError || collateralError
    }
    if (borrowError || borrow === "") {
      return txnType === TransactionType.BORROW
        ? "Deposit Collateral"
        : "Withdraw Collateral"
    }
    return txnType === TransactionType.BORROW ? "Borrow" : "Repay"
  }

  const FormDescription = (): ReactElement => {
    return (
      <Flex
        fontSize={{ base: "12px", sm: "16px" }}
        justifyContent="space-between"
        color="var(--text-lighter)"
      >
        <Box>1 {borrowToken.symbol} = 1 USD</Box>
        <Box>
          1 {collateralToken.symbol} ={" "}
          {+formatBNToString(borrowData.priceOfCollateral, 18, 3)} RUSD
        </Box>
      </Flex>
    )
  }

  return (
    <PageWrapper activeTab="borrow">
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>How TF do I Borrow?</DrawerHeader>
          <DrawerBody>Put SOme helpful shit here</DrawerBody>
          <DrawerFooter>Helpful footer shit</DrawerFooter>
        </DrawerContent>
      </Drawer>
      <ComponentWrapper
        top={<BackButton route="/borrow" buttonText="Go back to markets" />}
        left={
          <TabsWrapper
            tabsProps={{ variant: "primary" }}
            tab1={{
              name: t("borrow"),
              content: (
                <BorrowForm
                  borrowToken={borrowToken}
                  collateralToken={collateralToken}
                  max={formatBNToString(borrowData.collateralTokenBalance, 18)}
                  collateralUSDPrice={
                    +formatBNToString(borrowData.priceOfCollateral, 18)
                  }
                  formDescription={<FormDescription />}
                  borrowValidator={validateBorrow}
                  collateralValidator={validateDepositCollateral}
                  handlePreSubmit={preTransaction}
                  handleWhileSubmitting={onSubmitting}
                  handlePostSubmit={postTransaction}
                  getMaxBorrow={calculateMaxBorrow}
                  updateLiquidationPrice={updateCurrLiquidationPrice}
                  updatePositionHealth={updatePositionHealth}
                  handleSubmit={cook}
                  submitButtonLabelText={submitButtonLabelText}
                />
              ),
            }}
            tab2={{
              name: t("Repay"),
              content: (
                <RepayForm
                  borrowTokenSymbol={borrowToken.symbol}
                  borrowTokenIcon={borrowToken.icon}
                  collateralTokenSymbol={collateralToken.symbol}
                  collateralTokenIcon={collateralToken.icon}
                  max={formatBNToString(borrowData.borrowed, 18)}
                  maxRepayBn={borrowData.borrowed}
                  maxCollateralBn={borrowData.collateralDeposited}
                  getMaxWithdraw={calculateMaxWithdraw}
                  collateralUSDPrice={
                    +formatBNToString(borrowData.priceOfCollateral, 18)
                  }
                  formDescription={<FormDescription />}
                  repayValidator={validateRepay}
                  collateralValidator={validateWithdrawCollateral}
                  handlePreSubmit={preTransaction}
                  handleWhileSubmitting={onSubmitting}
                  handlePostSubmit={postTransaction}
                  updatePositionHealth={updatePositionHealth}
                  updateLiquidationPrice={updateCurrLiquidationPrice}
                  handleSubmit={cook}
                  submitButtonLabelText={submitButtonLabelText}
                />
              ),
            }}
          />
        }
        right={
          <StakeDetails
            extraStakeDetailChild={
              <Flex justifyContent="space-between" alignItems="center">
                <FaHandHoldingMedical
                  size="35px"
                  color="#cc3a59"
                  title="Your Position Health"
                />
                <Box width={230}>
                  <Progress
                    colorScheme={
                      positionHealth() <= 15
                        ? "red"
                        : positionHealth() > 50
                        ? "green"
                        : "orange"
                    }
                    height="30px"
                    value={positionHealth()}
                    title={`${positionHealth().toFixed(0)}%`}
                    isAnimated
                    hasStripe
                  />
                </Box>
              </Flex>
            }
            bottom={
              <Flex justifyContent="space-between" alignItems="center">
                <IconButton
                  ref={btnRef}
                  onClick={onOpen}
                  aria-label="Get Help"
                  variant="outline"
                  size="md"
                  icon={<FaInfoCircle />}
                  title="Get Help"
                />
                <Text>Need Help?</Text>
              </Flex>
            }
            balanceView={{
              title: t("Balances"),
              items: [
                {
                  tokenName: collateralToken.symbol,
                  icon: collateralToken.icon,
                  amount: commify(
                    formatBNToString(borrowData.collateralTokenBalance, 18, 5),
                  ),
                },
              ],
            }}
            stakedView={{
              title: t("My Open Position"),
              items: [
                {
                  tokenName: `${collateralToken.symbol} Collateral Deposited`,
                  icon: collateralToken.icon,
                  amount: `${formatBNToString(
                    borrowData.collateralDeposited,
                    18,
                    5,
                  )} ($${formatBNToString(
                    borrowData.collateralDepositedUSDPrice,
                    18,
                    2,
                  )})`,
                },
                {
                  tokenName: `${borrowToken.symbol} Borrowed`,
                  icon: borrowToken.icon,
                  amount: formatBNToString(borrowData.borrowed, 18, 5),
                },
              ],
            }}
            stats={[
              {
                statLabel: "Liquidation Price",
                statValue: liquidationPriceFormatted(),
              },
              {
                statLabel: "RUSD Left to Borrow",
                statValue: commify(
                  formatBNToString(borrowData.rusdLeftToBorrow, 18, 5),
                ),
              },
              {
                statLabel: "Maximum Debt Ratio",
                statValue: formatBNToPercentString(borrowData.mcr, 18, 0),
              },
              {
                statLabel: "Liquidation Fee",
                statValue: formatBNToPercentString(
                  borrowData.liquidationFee,
                  18,
                  0,
                ),
              },
              {
                statLabel: "Borrow Fee",
                statValue: formatBNToPercentString(borrowData.borrowFee, 18, 0),
              },
              {
                statLabel: "Interest",
                statValue: formatBNToPercentString(borrowData.interest, 18),
              },
            ]}
          />
        }
      />
    </PageWrapper>
  )
}
export default Borrow
