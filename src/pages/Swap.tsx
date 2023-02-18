import { Box, Flex, Heading, Stack } from "@chakra-ui/react"
import React, { ReactElement } from "react"
import AdvancedOptions from "../components/AdvancedOptions"
import { ContractReceipt } from "@ethersproject/contracts"
import { IconButtonPopover } from "../components/Popover"
import PageWrapper from "../components/wrappers/PageWrapper"
import { SlidersIcon } from "../constants/icons"
import SwapForm from "../components/swap/SwapForm"
import { TransactionType } from "../hooks/useChakraToast"
import useCalculateSwapState from "../hooks/useCalculateSwapState"
import useHandlePostSubmit from "../hooks/useHandlePostSubmit"
import useHandlePreSubmit from "../hooks/useHandlePreSubmit"
import useSwapTokenOptions from "../hooks/useSwapTokenOptions"
import { useTranslation } from "react-i18next"

function Swap(): ReactElement {
  // hooks
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
