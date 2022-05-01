import { Box, Button, Flex, Text } from "@chakra-ui/react"
import React, { ReactElement } from "react"
import useChakraToast, { TransactionType } from "../hooks/useChakraToast"
import BlockExplorerLink from "./BlockExplorerLink"
import { ContractReceipt } from "ethers"
import roseIcon from "../assets/icons/rose.svg"
import terraLunaIcon from "../assets/icons/terra-luna-logo.svg"
import { useActiveWeb3React } from "../hooks"
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

const ToastDescription = ({
  txnType,
  status,
  txnHash,
}: {
  txnType: TransactionType
  status: number
  txnHash?: string
}): ReactElement | null => {
  const { chainId } = useActiveWeb3React()
  return txnHash ? (
    <BlockExplorerLink
      txnType={txnType}
      txnHash={txnHash}
      status={status ? "Succeeded" : "Failed"}
      chainId={chainId}
    />
  ) : null
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
  return (
    <Box p="15px">
      <Flex justifyContent="center">
        <Text as="p" color="var(--text-lighter)">
          Current Rewards
        </Text>
      </Flex>
      <Flex justifyContent="center">
        <Box bg="#cc3a59" borderRadius="5px" p="20px" mt="5px">
          <Text as="h3" color="white">
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
      <Flex
        justifyContent="space-around"
        alignItems="center"
        mt="30px"
        flexWrap="wrap"
        gridGap="10px"
      >
        <Button
          p="20px"
          variant="primary"
          onClick={async () => {
            toast.transactionPending({ txnType: TransactionType.REWARDS })
            let receipt: ContractReceipt | null = null
            try {
              receipt = (await claim()) as ContractReceipt
              if (receipt?.status) {
                toast.transactionSuccess({
                  txnType: TransactionType.REWARDS,
                  description: (
                    <ToastDescription
                      txnType={TransactionType.REWARDS}
                      status={1}
                      txnHash={receipt.transactionHash}
                    />
                  ),
                })
              } else {
                toast.transactionFailed({
                  txnType: TransactionType.REWARDS,
                  description: (
                    <ToastDescription
                      txnType={TransactionType.REWARDS}
                      status={0}
                      txnHash={receipt.transactionHash}
                    />
                  ),
                })
              }
            } catch (e) {
              const error = e as { code: number; message: string }
              toast.transactionFailed({
                txnType: TransactionType.REWARDS,
                description: (
                  <ToastDescription
                    txnType={TransactionType.REWARDS}
                    status={0}
                    txnHash={receipt?.transactionHash}
                  />
                ),
                error,
              })
            }
          }}
        >
          {t("harvestRewards")}
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            toast.transactionPending({ txnType: TransactionType.REWARDS })
            let receipt: ContractReceipt | null = null
            try {
              receipt = (await withdrawAndClaim()) as ContractReceipt
              if (receipt?.status) {
                toast.transactionSuccess({
                  txnType: TransactionType.EXIT,
                  description: (
                    <ToastDescription
                      txnType={TransactionType.EXIT}
                      status={1}
                      txnHash={receipt.transactionHash}
                    />
                  ),
                })
              } else {
                toast.transactionFailed({
                  txnType: TransactionType.EXIT,
                  description: (
                    <ToastDescription
                      txnType={TransactionType.EXIT}
                      status={0}
                      txnHash={receipt.transactionHash}
                    />
                  ),
                })
              }
            } catch (e) {
              const error = e as { code: number; message: string }
              toast.transactionFailed({
                txnType: TransactionType.EXIT,
                description: (
                  <ToastDescription
                    txnType={TransactionType.EXIT}
                    status={0}
                    txnHash={receipt?.transactionHash}
                  />
                ),
                error,
              })
            }
          }}
        >
          {t("withdrawAndHarvest")}
        </Button>
      </Flex>
    </Box>
  )
}

export default FarmRewardsPopoverContent
