/* eslint @typescript-eslint/no-unsafe-assignment: 0 */
/* eslint @typescript-eslint/no-unsafe-call: 0 */
import { Box, Flex, Heading, Stack, useDisclosure } from "@chakra-ui/react"
import React, { ReactElement, useCallback, useState } from "react"
import AdvancedOptions from "../components/AdvancedOptions"
// import { AppState } from "../state/index"
// import { BigNumber } from "@ethersproject/bignumber"
import { ContractReceipt } from "@ethersproject/contracts"
import { IconButtonPopover } from "../components/Popover"
import PageWrapper from "../components/wrappers/PageWrapper"
import { SlidersIcon } from "../constants/icons"
import SwapForm from "../components/swap/SwapForm"
import SwapTokenSelectModal from "../components/swap/SwapTokenSelectModal"
import { TransactionType } from "../hooks/useChakraToast"
// import { Zero } from "@ethersproject/constants"
// import { calculateGasEstimate } from "../utils/gasEstimate"
// import { parseUnits } from "@ethersproject/units"
import useCalculateSwapState from "../hooks/useCalculateSwapState"
// import { useSelector } from "react-redux"
import useHandlePostSubmit from "../hooks/useHandlePostSubmit"
import useHandlePreSubmit from "../hooks/useHandlePreSubmit"
import useSwapTokenOptions from "../hooks/useSwapTokenOptions"
import { useTranslation } from "react-i18next"

function Swap(): ReactElement {
  // hooks
  // const { tokenPricesUSD } = useSelector((state: AppState) => state.application)
  const [
    swapState,
    calculateSwapAmount,
    handleSwitchDirection,
    handleUpdateFrom,
    handleUpdateTo,
    handleInputChange,
    handleSubmit,
  ] = useCalculateSwapState()
  const tokenOptions = useSwapTokenOptions(swapState.currentSwapPairs)
  const { t } = useTranslation()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const handlePostSubmit = useHandlePostSubmit()
  const handlePreSubmit = useHandlePreSubmit()

  // state
  const [modalTokenOptions, setModalTokenOptions] = useState(tokenOptions.from)
  const [inputField, setInputField] = useState<"from" | "to">("from")

  // const gasPrice = Zero
  // const gasAmount = calculateGasEstimate(swapState.swapType).mul(gasPrice) // units of gas * GWEI/Unit of gas

  // const txnGasCost = {
  //   amount: gasAmount,
  //   valueUSD: tokenPricesUSD?.ETH
  //     ? parseUnits(tokenPricesUSD.ETH.toFixed(2), 18) // USD / ETH  * 10^18
  //         .mul(gasAmount) // GWEI
  //         .div(BigNumber.from(10).pow(25)) // USD / ETH * GWEI * ETH / GWEI = USD
  //     : null,
  // }

  // handlers
  const onModalOpen = useCallback(
    (option: "from" | "to") => {
      setInputField(option)
      setModalTokenOptions(tokenOptions[option])
      onOpen()
    },
    [tokenOptions],
  )

  const submitFlow = async (): Promise<void> => {
    handlePreSubmit(TransactionType.SWAP)
    let receipt: ContractReceipt | null = null
    try {
      receipt = await handleSubmit()
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
        maxW="550px"
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
            onSwitchDirection={handleSwitchDirection}
            onChooseToken={onModalOpen}
            onInputChange={handleInputChange}
            onCalculateSwapAmount={(amount: string) =>
              calculateSwapAmount(amount)
            }
            onSubmit={submitFlow}
          />
        </Stack>
      </Box>
      <SwapTokenSelectModal
        tokens={modalTokenOptions}
        isOpen={isOpen}
        onClose={onClose}
        onSelectToken={(symbol) => {
          if (inputField === "from") handleUpdateFrom(symbol)
          else handleUpdateTo(symbol)
        }}
      />
    </PageWrapper>
  )
}

export default Swap
