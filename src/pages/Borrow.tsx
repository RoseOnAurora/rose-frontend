import { BORROW_MARKET_MAP, BorrowMarketName } from "../constants"
import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerOverlay,
  Flex,
  IconButton,
  Link,
  Progress,
  Text,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react"
import { BsCurrencyDollar, BsExclamationTriangle } from "react-icons/bs"
import {
  FaDivide,
  FaGlassWhiskey,
  FaHandHoldingMedical,
  FaHandHoldingUsd,
  FaInfoCircle,
} from "react-icons/fa"
import { One, Zero } from "@ethersproject/constants"
import React, { ReactElement, useRef } from "react"
import {
  calculatePositionHealthColor,
  commify,
  formatBNToPercentString,
  formatBNToString,
} from "../utils"
import useChakraToast, { TransactionType } from "../hooks/useChakraToast"
import BackButton from "../components/BackButton"
import { BigNumber } from "@ethersproject/bignumber"
import BlockExplorerLink from "../components/BlockExplorerLink"
import BorrowForm from "../components/BorrowForm"
import ComponentWrapper from "../components/wrappers/ComponentWrapper"
import { ContractReceipt } from "ethers"
import OverviewInfo from "../components/OverviewInfo"
import PageWrapper from "../components/wrappers/PageWrapper"
import RepayForm from "../components/RepayForm"
import StakeDetails from "../components/StakeDetails"
import TabsWrapper from "../components/wrappers/TabsWrapper"
import parseStringToBigNumber from "../utils/parseStringToBigNumber"
import { parseUnits } from "@ethersproject/units"
import useBorrowData from "../hooks/useBorrowData"
import { useCook } from "../hooks/useCook"
import { useTranslation } from "react-i18next"

interface Props {
  borrowName: BorrowMarketName
  isStable?: boolean
}

const Borrow = ({ borrowName, isStable }: Props): ReactElement => {
  const { t } = useTranslation()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [borrowData] = useBorrowData(borrowName)
  const btnRef = useRef<HTMLButtonElement>(null)
  const toast = useChakraToast()
  const cook = useCook(borrowName)

  const drawerBg = useColorModeValue(
    "linear-gradient(to bottom, #f7819a, #ebd9c2, #e9e0d9)",
    "linear-gradient(to right, #141414, #200122, #791038)",
  )
  // const borrowCollapseTextColor = useColorModeValue("#555555", "#bbbbbb")

  const { borrowToken, collateralToken } = BORROW_MARKET_MAP[borrowName]

  const calculateMaxBorrowHelper = (
    collateralAmount: string,
    totalBorrowed = Zero,
    totalCollateralDeposited = Zero,
  ): BigNumber => {
    const totalCollateral = totalCollateralDeposited.add(
      parseStringToBigNumber(collateralAmount, 18, Zero).value,
    )
    const totalCollateralUSD = totalCollateral
      .mul(borrowData.priceOfCollateral)
      .div(BigNumber.from(10).pow(18))
    if (totalCollateral.isZero()) return Zero
    const maxBorrow = borrowData.mcr
      .sub(
        totalBorrowed
          .mul(BigNumber.from(10).pow(18))
          .div(totalCollateralUSD.isZero() ? One : totalCollateralUSD),
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

    return maxBorrowAdj
  }

  const calculateMaxBorrow = (collateralAmount: string): BigNumber => {
    return calculateMaxBorrowHelper(
      collateralAmount,
      borrowData.borrowed,
      borrowData.collateralDeposited,
    )
  }

  const calculateMaxWithdraw = (repayAmount: string): BigNumber => {
    const totalBorrowed = borrowData.borrowed.sub(
      parseUnits(repayAmount || "0"),
    )
    if (totalBorrowed.isZero()) return borrowData.collateralDeposited
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
    if (validateBorrow || validateCollateral) return 0

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
      ? BigNumber.from(0)
      : borrowAmountBn
          .add(borrowData.borrowed)
          .mul(BigNumber.from(10).pow(18))
          .div(
            currentCollateralUSD.isZero()
              ? parseUnits("1", 18)
              : currentCollateralUSD,
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

  const HowToBorrowText = (): ReactElement => {
    return (
      <>
        {`To borrow RUSD, you must deposit collateral first. This market accepts ${
          collateralToken.name
        } as collateral. You can have a total debt in RUSD up to ${formatBNToPercentString(
          borrowData.mcr,
          18,
          0,
        )} of the dollar value of collateral deposited.`}
        <br />
        <br />
        {`For example, if you deposit 1 ${
          collateralToken.name
        }, (≈ $${+formatBNToString(
          borrowData.priceOfCollateral,
          18,
        )}) you are allowed to borrow ${formatBNToString(
          calculateMaxBorrowHelper("1"),
          18,
          5,
        )}* RUSD.`}
        <br />
        <br />
        {
          "*Note: The amount of RUSD you will actually receive is less than what you borrow because the borrow fee is charged in RUSD and added to your total debt."
        }
      </>
    )
  }

  const GlossaryItem = ({ title, text }: { title: string; text: string }) => {
    return (
      <>
        <b>{title}</b>: {text}
      </>
    )
  }

  const mcrFormatted = formatBNToPercentString(borrowData.mcr, 18, 0)

  return (
    <PageWrapper activeTab="borrow">
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        finalFocusRef={btnRef}
        size="sm"
      >
        <DrawerOverlay />
        <DrawerContent bg={drawerBg} p="50px 10px">
          <DrawerCloseButton />
          <DrawerBody p="5px">
            <OverviewInfo
              infoType="Borrow"
              sections={[
                {
                  title: "How to borrow RUSD",
                  items: [
                    {
                      icon: FaHandHoldingUsd,
                      text: <HowToBorrowText />,
                    },
                  ],
                },
                {
                  title: "Balances",
                  items: [
                    {
                      icon: BsCurrencyDollar,
                      text: (
                        <GlossaryItem
                          title={`${collateralToken.symbol} Balance`}
                          text={`The token amount of ${collateralToken.symbol} you have in your wallet.`}
                        />
                      ),
                    },
                    {
                      icon: BsCurrencyDollar,
                      text: (
                        <GlossaryItem
                          title="RUSD Balance"
                          text="The token amount of RUSD you have in your wallet."
                        />
                      ),
                    },
                  ],
                },
                {
                  title: "My Open Position",
                  items: [
                    {
                      icon: BsCurrencyDollar,
                      text: (
                        <GlossaryItem
                          title={`${collateralToken.symbol} Collateral Deposited`}
                          text={`The token amount/dollar value of ${collateralToken.symbol} you have deposited into this market.`}
                        />
                      ),
                    },
                    {
                      icon: FaHandHoldingUsd,
                      text: (
                        <GlossaryItem
                          title="Total RUSD Debt"
                          text="The token amount of RUSD you currently owe in this market. Includes fees. The breakdown shows you exactly how much in fees you owe and what amount you are actually borrowing. Note that this will most likely not equal the total RUSD token amount you have in your wallet."
                        />
                      ),
                    },
                  ],
                },
                {
                  title: "Glossary",
                  items: [
                    {
                      icon: FaHandHoldingMedical,
                      text: (
                        <GlossaryItem
                          title="Your Position Health"
                          text={`Your position health is represented as a percentage proportional to the maximum debt ratio. ${mcrFormatted} and higher is at risk for liquidation and 0% is the healthiest your position can be. When you enter values in the input fields, the impact on position health will show as a result and is labeled by 'Updated Position Health'. It will also indicate your action as being 'Safe', 'Moderate', or 'High' in terms of risk.`}
                        />
                      ),
                    },
                    {
                      icon: BsExclamationTriangle,
                      text: (
                        <GlossaryItem
                          title="Liquidation Price"
                          text="Estimate of the price at which your position will be flagged for liquidation. Repay RUSD and/or deposit collateral to lower this price."
                        />
                      ),
                    },
                    {
                      icon: FaGlassWhiskey,
                      text: (
                        <GlossaryItem
                          title="RUSD Left to Borrow"
                          text="The amount of RUSD left for you to borrow. Increase this amount by repaying RUSD or by depositing more collateral."
                        />
                      ),
                    },
                    {
                      icon: FaDivide,
                      text: (
                        <GlossaryItem
                          title="Maximum Debt Ratio"
                          text="Ratio representing the maximum debt you are allowed to carry in this market over the dollar value of collateral deposited."
                        />
                      ),
                    },
                    {
                      icon: BsCurrencyDollar,
                      text: (
                        <GlossaryItem
                          title="Liquidation Fee"
                          text="This is the discount a liquidator gets when buying collateral flagged for liquidation."
                        />
                      ),
                    },
                    {
                      icon: BsCurrencyDollar,
                      text: (
                        <GlossaryItem
                          title="Borrow Fee"
                          text="This is the fee applied to your RUSD Borrowed every time you borrow RUSD."
                        />
                      ),
                    },
                    {
                      icon: BsCurrencyDollar,
                      text: (
                        <GlossaryItem
                          title="Interest"
                          text="interest rate per year (APR)."
                        />
                      ),
                    },
                  ],
                },
              ]}
            />
          </DrawerBody>
          <DrawerFooter>
            <Link
              href="https://medium.com/@RoseOnAurora/rose-borrow-testnet-launch-a66f3f1de949"
              target="_blank"
              rel="noreferrer"
            >
              Go to Full How-to Guide<sup>↗</sup>
            </Link>
          </DrawerFooter>
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
                  isStable={isStable}
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
                  borrowToken={borrowToken}
                  collateralToken={collateralToken}
                  isStable={isStable}
                  max={formatBNToString(
                    borrowData.borrowed.gt(borrowData.rusdUserBalance)
                      ? borrowData.rusdUserBalance
                      : borrowData.borrowed,
                    18,
                  )}
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
                    colorScheme={calculatePositionHealthColor(
                      positionHealth(),
                      isStable,
                    )}
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
                {
                  tokenName: borrowToken.symbol,
                  icon: borrowToken.icon,
                  amount: commify(
                    formatBNToString(borrowData.rusdUserBalance, 18, 5),
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
                  amount: `${commify(
                    formatBNToString(borrowData.collateralDeposited, 18, 5),
                  )} ($${commify(
                    formatBNToString(
                      borrowData.collateralDepositedUSDPrice,
                      18,
                      2,
                    ),
                  )})`,
                },
                {
                  tokenName: `Total ${borrowToken.symbol} Debt`,
                  icon: borrowToken.icon,
                  amount: commify(formatBNToString(borrowData.borrowed, 18, 5)),
                  // collapseContent: (
                  //   <Box my="5px" color={borrowCollapseTextColor}>
                  //     <Flex justifyContent="space-between" alignItems="center">
                  //       <Text fontSize="13px">Borrowed:</Text>
                  //       <Box>
                  //         {commify(
                  //           formatBNToString(
                  //             borrowData.borrowed
                  //               .sub(borrowData.feesOwed)
                  //               .abs(),
                  //             18,
                  //             5,
                  //           ),
                  //         )}
                  //       </Box>
                  //     </Flex>
                  //     <Flex justifyContent="space-between" alignItems="center">
                  //       <Text fontSize="13px">Unpaid Fees in RUSD:</Text>
                  //       <Box>
                  //         {commify(
                  //           formatBNToString(borrowData.feesOwed, 18, 5),
                  //         )}
                  //       </Box>
                  //     </Flex>
                  //   </Box>
                  // ),
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
                statValue: mcrFormatted,
              },
              {
                statLabel: "Liquidation Fee",
                statValue: formatBNToPercentString(
                  borrowData.liquidationFee,
                  18,
                  2,
                ),
              },
              {
                statLabel: "Borrow Fee",
                statValue: formatBNToPercentString(borrowData.borrowFee, 18, 1),
              },
              {
                statLabel: "Interest",
                statValue: formatBNToPercentString(borrowData.interest, 18, 2),
              },
            ]}
          />
        }
      />
    </PageWrapper>
  )
}
export default Borrow
