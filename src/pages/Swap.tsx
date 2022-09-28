import { Box, Flex, Heading, Stack } from "@chakra-ui/react"
import React, { ReactElement } from "react"
import AdvancedOptions from "../components/AdvancedOptions"
import { AppState } from "../state/index"
import { BigNumber } from "@ethersproject/bignumber"
import { ContractReceipt } from "@ethersproject/contracts"
import { IconButtonPopover } from "../components/Popover"
import PageWrapper from "../components/wrappers/PageWrapper"
import { SlidersIcon } from "../constants/icons"
import SwapForm from "../components/swap/SwapForm"
import { TransactionType } from "../hooks/useChakraToast"
import { Zero } from "@ethersproject/constants"
import { calculateGasEstimate } from "../utils/gasEstimate"
import { parseUnits } from "@ethersproject/units"
import useCalculateSwapState from "../hooks/useCalculateSwapState"
import useHandlePostSubmit from "../hooks/useHandlePostSubmit"
import useHandlePreSubmit from "../hooks/useHandlePreSubmit"
import { useSelector } from "react-redux"
import useSwapTokenOptions from "../hooks/useSwapTokenOptions"
import { useTranslation } from "react-i18next"

function Swap(): ReactElement {
  // hooks
  const { tokenPricesUSD } = useSelector((state: AppState) => state.application)
  const [
    swapState,
    calculateSwapAmount,
    handleSwitchDirection,
    handleUpdateFrom,
    handleUpdateTo,
    handleSubmit,
  ] = useCalculateSwapState()
  const tokenOptions = useSwapTokenOptions(swapState.currentSwapPairs)
  const { t } = useTranslation()
  const handlePostSubmit = useHandlePostSubmit()
  const handlePreSubmit = useHandlePreSubmit()

  // state
  const gasPrice = Zero
  const gasAmount = calculateGasEstimate(swapState.swapType).mul(gasPrice) // units of gas * GWEI/Unit of gas

  const txnGasCost = {
    amount: gasAmount,
    valueUSD: tokenPricesUSD?.ETH
      ? parseUnits(tokenPricesUSD.ETH.toFixed(2), 18) // USD / ETH  * 10^18
          .mul(gasAmount) // GWEI
          .div(BigNumber.from(10).pow(25)) // USD / ETH * GWEI * ETH / GWEI = USD
      : null,
  }

  console.debug(txnGasCost)

  const submitFlow = async (fromAmount: string): Promise<void> => {
    handlePreSubmit(TransactionType.SWAP)
    let receipt: ContractReceipt | null = null
    try {
      receipt = await handleSubmit(fromAmount)
      handlePostSubmit(receipt, TransactionType.SWAP)
    } catch (e) {
      const error = e as { code: number; message: string }
      handlePostSubmit(receipt, TransactionType.SWAP, {
        code: error.code,
        message: error.message,
      })
    }
  }

  return (
    <PageWrapper>
      <Box
        maxW="525px"
        w="full"
        p="30px"
        bg="gray.900"
        borderRadius="20px"
        isolation="isolate"
        mx="auto"
      >
        <Stack alignItems="center" justifyContent="center" spacing="30px">
          <Flex w="full" justifyContent="space-between" alignItems="center">
            <Heading fontWeight={700} fontSize="30px" lineHeight="35px">
              {t("swap")}
            </Heading>
            <IconButtonPopover
              IconButtonProps={{
                "aria-label": "Configure Settings",
                variant: "solid",
                borderRadius: "12px",
                icon: <SlidersIcon />,
                title: "Configure Settings",
              }}
              PopoverBodyContent={<AdvancedOptions />}
            />
          </Flex>
          <SwapForm
            tokenOptions={tokenOptions}
            swapData={swapState}
            onUpdateFrom={handleUpdateFrom}
            onUpdateTo={handleUpdateTo}
            onSwitchDirection={handleSwitchDirection}
            onCalculateSwapAmount={(amount: string) =>
              calculateSwapAmount(amount)
            }
            onSubmit={submitFlow}
          />
        </Stack>
      </Box>
    </PageWrapper>
  )
}

export default Swap
