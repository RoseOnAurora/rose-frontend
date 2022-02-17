import BorrowForm, { BorrowFormTokenDetails } from "./BorrowForm"
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
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react"
import { FaHandHoldingMedical, FaInfoCircle } from "react-icons/fa"
import React, { ReactElement, useRef } from "react"
import { formatBNToPercentString, formatBNToString } from "../utils"
import AdvancedOptions from "./AdvancedOptions"
import { BigNumber } from "@ethersproject/bignumber"
import { BorrowMarketName } from "../constants"
import { BsSliders } from "react-icons/bs"
import { IconButtonPopover } from "./Popover"
import RepayForm from "./RepayForm"
import StakeDetails from "./StakeDetails"
import { Zero } from "@ethersproject/constants"
import { commify } from "@ethersproject/units"
import { parseUnits } from "@ethersproject/units"
import styles from "./BorrowPage.module.scss"
import useBorrowData from "../hooks/useBorrowData"
import { useCook } from "../hooks/useCook"
import { useTranslation } from "react-i18next"

interface Props {
  borrowName: BorrowMarketName
  borrowToken: BorrowFormTokenDetails
  collateralToken: BorrowFormTokenDetails
}

const BorrowPage = (props: Props): ReactElement => {
  const { borrowName, borrowToken, collateralToken } = props

  const { t } = useTranslation()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [borrowData, loading] = useBorrowData(borrowName)
  const btnRef = useRef<HTMLButtonElement>(null)

  const cook = useCook(borrowName)

  const calculateMaxBorrow = (collateralAmount: string): BigNumber => {
    const totalCollateral = borrowData.collateralDeposited.add(
      parseUnits(collateralAmount || "0", 18),
    )
    if (totalCollateral.isZero()) return Zero
    return borrowData.mcr
      .sub(
        borrowData.borrowed
          .mul(BigNumber.from(10).pow(18))
          .div(
            totalCollateral
              .mul(parseUnits(String(borrowData.priceOfCollateral), 18))
              .div(BigNumber.from(10).pow(18)),
          ),
      )
      .mul(totalCollateral)
      .div(BigNumber.from(10).pow(18))
  }

  const calculateMaxWithdraw = (repayAmount: string): BigNumber => {
    const totalBorrowed = borrowData.borrowed.sub(
      parseUnits(repayAmount || "0"),
    )
    return borrowData.collateralDepositedUSDPrice
      .sub(totalBorrowed.mul(BigNumber.from(10).pow(18)).div(borrowData.mcr))
      .div(parseUnits(String(borrowData.priceOfCollateral), 18))
      .mul(BigNumber.from(10).pow(18))
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

  const liquidationPriceHelper = (
    borrow: BigNumber,
    collateral: BigNumber,
  ): BigNumber => {
    if (collateral.add(borrowData.collateralDeposited).isZero()) return Zero
    return borrowData.borrowedUSDPrice
      .add(
        borrow
          .mul(parseUnits(String(borrowData.priceOfCollateral), 18))
          .div(BigNumber.from(10).pow(18)),
      )
      .mul(BigNumber.from(10).pow(18))
      .div(collateral.add(borrowData.collateralDeposited))
      .mul(BigNumber.from(10).pow(18))
      .div(parseUnits(String(borrowData.priceOfCollateral), 18))
      .mul(borrowData.liquidationMultiplier)
      .div(BigNumber.from(10).pow(18))
  }

  const liquidationPriceFormatted = (
    borrow = Zero,
    collateral = Zero,
  ): { valueRaw: BigNumber; formatted: string } => {
    const price = liquidationPriceHelper(borrow, collateral)
    const formatted = price.lte(Zero)
      ? "$0.00"
      : `$${commify(formatBNToString(price, 18, 3))}`
    return { valueRaw: price, formatted }
  }

  const updateCurrLiquidationPrice = (
    borrowAmount: string,
    collateralAmount: string,
    negate = false,
  ): { valueRaw: BigNumber; formatted: string } => {
    const decimalRegex = /^[0-9]\d*(\.\d{1,18})?$/
    if (
      (borrowAmount && !decimalRegex.exec(borrowAmount)) ||
      (collateralAmount && !decimalRegex.exec(collateralAmount))
    )
      return { valueRaw: Zero, formatted: "$xx.xxx" }
    const formattedBorrowAmount =
      borrowAmount && negate ? `-${borrowAmount}` : borrowAmount
    const formattedcollateralAmount =
      collateralAmount && negate ? `-${collateralAmount}` : collateralAmount
    const borrowAmountBn = parseUnits(formattedBorrowAmount || "0", 18)
    const collateralAmountBn = parseUnits(formattedcollateralAmount || "0", 18)
    return liquidationPriceFormatted(borrowAmountBn, collateralAmountBn)
  }

  const validateAmount = (amount: string): string | null => {
    const decimalRegex = /^[0-9]\d*(\.\d{1,18})?$/
    if (amount && !decimalRegex.exec(amount)) {
      return t("Invalid number.")
    }
    return null
  }

  const positionHealth = (): number => {
    return (
      (1 -
        +formatBNToString(
          liquidationPriceHelper(
            borrowData.borrowed,
            borrowData.collateralDeposited,
          ),
          18,
        ) /
          borrowData.priceOfCollateral) *
      125 // scaling factor; TO-DO: determine appropriate amount for diff markets
    )
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
          1 {collateralToken.symbol} = {borrowData.priceOfCollateral} RUSD
        </Box>
      </Flex>
    )
  }

  return (
    <div className={styles.borrowPage}>
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
      <div className={styles.borrowTabs}>
        <Tabs
          isFitted
          variant="primary"
          bgColor={useColorModeValue(
            "rgba(242, 236, 236, 0.8)",
            "rgba(28, 29, 33, 0.3)",
          )}
          borderRadius="10px"
          height="100%"
        >
          <TabList mb="1em">
            <Tab>{t("borrow")}</Tab>
            <Tab>{t("Repay")}</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Box
                bg="var(--secondary-background)"
                border="1px solid var(--outline)"
                borderRadius="10px"
                p="15px"
              >
                <Flex justifyContent="space-between" alignItems="center">
                  <Text
                    as="h3"
                    fontWeight="700"
                    fontSize="30px"
                    lineHeight="30px"
                  >
                    Borrow {borrowToken.symbol}
                  </Text>
                  <IconButtonPopover
                    IconButtonProps={{
                      "aria-label": "Configure Settings",
                      variant: "outline",
                      size: "lg",
                      icon: <BsSliders size="25px" />,
                      title: "Configure Settings",
                    }}
                    PopoverBodyContent={<AdvancedOptions />}
                  />
                </Flex>
              </Box>
              <BorrowForm
                borrowToken={borrowToken}
                collateralToken={collateralToken}
                collateralUSDPrice={borrowData.priceOfCollateral}
                borrowValidator={validateBorrow}
                collateralValidator={validateDepositCollateral}
                max={formatBNToString(borrowData.collateralTokenBalance, 18)}
                getMaxBorrow={calculateMaxBorrow}
                updateLiquidationPrice={updateCurrLiquidationPrice}
                submitButtonLabel="Add Collateral & Borrow"
                formDescription={<FormDescription />}
                handleSubmit={cook}
              />
            </TabPanel>
            <TabPanel>
              <Box
                bg="var(--secondary-background)"
                border="1px solid var(--outline)"
                borderRadius="10px"
                p="15px"
              >
                <Flex justifyContent="space-between" alignItems="center">
                  <Text
                    as="h3"
                    fontWeight="700"
                    fontSize="30px"
                    lineHeight="30px"
                  >
                    Repay {borrowToken.symbol}
                  </Text>
                  <IconButtonPopover
                    IconButtonProps={{
                      "aria-label": "Configure Settings",
                      variant: "outline",
                      size: "lg",
                      icon: <BsSliders size="25px" />,
                      title: "Configure Settings",
                    }}
                    PopoverBodyContent={<AdvancedOptions />}
                  />
                </Flex>
              </Box>
              <RepayForm
                borrowTokenSymbol={borrowToken.symbol}
                borrowTokenIcon={borrowToken.icon}
                collateralTokenSymbol={collateralToken.symbol}
                collateralTokenIcon={collateralToken.icon}
                collateralUSDPrice={borrowData.priceOfCollateral}
                repayValidator={validateRepay}
                collateralValidator={validateWithdrawCollateral}
                max={formatBNToString(borrowData.borrowed, 18)}
                getMaxWithdraw={calculateMaxWithdraw}
                updateLiquidationPrice={updateCurrLiquidationPrice}
                submitButtonLabel="Repay & Withdraw Collateral"
                formDescription={<FormDescription />}
                handleSubmit={cook}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
      <div className={styles.borrowDetailsContainer}>
        <StakeDetails
          loading={loading}
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
                    positionHealth() <= 10
                      ? "red"
                      : positionHealth() > 25
                      ? "green"
                      : "orange"
                  }
                  height="30px"
                  value={positionHealth()}
                  isAnimated
                  hasStripe
                />
              </Box>
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
              statValue: liquidationPriceFormatted().formatted,
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
            {
              statLabel: (
                <IconButton
                  ref={btnRef}
                  onClick={onOpen}
                  aria-label="Get Help"
                  variant="outline"
                  size="md"
                  icon={<FaInfoCircle />}
                  title="Get Help"
                />
              ),
              statValue: "Need Help?",
            },
          ]}
        />
      </div>
    </div>
  )
}

export default BorrowPage
