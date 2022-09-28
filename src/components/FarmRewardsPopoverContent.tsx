import { Box, Button, ButtonGroup, Flex, Text } from "@chakra-ui/react"
import React, { ReactElement } from "react"
import useChakraToast, { TransactionType } from "../hooks/useChakraToast"
import { ContractReceipt } from "ethers"
import { ErrorObj } from "../constants"
import roseIcon from "../assets/icons/rose.svg"
import terraLunaIcon from "../assets/icons/terra-luna-logo.svg"
import useHandlePostSubmit from "../hooks/useHandlePostSubmit"
import { useTranslation } from "react-i18next"

interface Props {
  totalRewardsAmount: string
  roseRewardsAmount: string
  dualRewards?: {
    tokenName: string
    amount: string
  }
  withdrawAndClaim: () => Promise<void | ContractReceipt>
  claim: () => Promise<void | ContractReceipt>
}

const FarmRewardsPopoverContent = (props: Props): ReactElement => {
  const {
    totalRewardsAmount,
    roseRewardsAmount,
    dualRewards,
    withdrawAndClaim,
    claim,
  } = props

  const { t } = useTranslation()
  const toast = useChakraToast()
  const handlePostSubmit = useHandlePostSubmit()

  return (
    <Box p="15px">
      <Flex justifyContent="center">
        <Text as="p" color="gray.200">
          Current Rewards
        </Text>
      </Flex>
      <Flex justifyContent="center">
        <Box bg="red.500" borderRadius="5px" p="20px" mt="5px">
          <Text as="h3" color="#FCFCFD">
            {+totalRewardsAmount > 0 ? (+totalRewardsAmount).toFixed(8) : "0.0"}
          </Text>
        </Box>
      </Flex>
      <Box mt="20px">
        <Flex
          justifyContent="space-between"
          mb="10px"
          alignItems="center"
          flexWrap="wrap"
        >
          <Flex alignItems="center">
            <Box width="40px">
              <img alt="icon" src={roseIcon} width="100%" />
            </Box>
            <Text as="p">ROSE:</Text>
          </Flex>
          <Text as="b">
            {+roseRewardsAmount > 0 ? (+roseRewardsAmount).toFixed(8) : "0.0"}
          </Text>
        </Flex>
        {dualRewards ? (
          <Flex
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
          >
            <Flex alignItems="center">
              <Box width="40px" mr="3px">
                <img alt="icon" src={terraLunaIcon} width="100%" />
              </Box>
              <Text as="p">{dualRewards.tokenName}:</Text>
            </Flex>
            <Text as="b">
              {+dualRewards.amount > 0
                ? (+dualRewards.amount).toFixed(8)
                : "0.0"}
            </Text>
          </Flex>
        ) : null}
      </Box>
      <Flex maxW="300px" justifyContent="center" mt="10px">
        <ButtonGroup size="md" isAttached>
          <Button
            onClick={async () => {
              toast.transactionPending({ txnType: TransactionType.REWARDS })
              let receipt: ContractReceipt | null = null
              try {
                receipt = (await claim()) as ContractReceipt
                handlePostSubmit(receipt, TransactionType.REWARDS)
              } catch (e) {
                const error = e as ErrorObj
                handlePostSubmit?.(receipt, TransactionType.REWARDS, {
                  code: error.code,
                  message: error.message,
                })
              }
            }}
          >
            {t("harvestRewards")}
          </Button>
          <Button
            variant="outline"
            borderRadius="12px"
            onClick={async () => {
              toast.transactionPending({ txnType: TransactionType.EXIT })
              let receipt: ContractReceipt | null = null
              try {
                receipt = (await withdrawAndClaim()) as ContractReceipt
                handlePostSubmit(receipt, TransactionType.EXIT)
              } catch (e) {
                const error = e as ErrorObj
                handlePostSubmit?.(receipt, TransactionType.EXIT, {
                  code: error.code,
                  message: error.message,
                })
              }
            }}
          >
            {t("withdrawAndHarvest")}
          </Button>
        </ButtonGroup>
      </Flex>
    </Box>
  )
}

export default FarmRewardsPopoverContent
