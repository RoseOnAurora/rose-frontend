/* eslint @typescript-eslint/no-unsafe-assignment: 0 */
/* eslint @typescript-eslint/no-unsafe-call: 0 */
/* eslint @typescript-eslint/no-unsafe-member-access: 0 */
/* eslint @typescript-eslint/no-unsafe-return: 0 */
/* eslint @typescript-eslint/no-explicit-any: 0 */
/* eslint @typescript-eslint/no-unused-vars: 0 */
import { Box, Button, Flex, Link, Stack, Text } from "@chakra-ui/react"
import { Contract, ContractReceipt } from "@ethersproject/contracts"
import { DepositTransaction, TransactionItem } from "../types/transactions"
import {
  ErrorObj,
  FRAX_STABLES_LP_POOL_NAME,
  POOLS_MAP,
  PoolName,
  Token,
  UST_METAPOOL_NAME,
  isMetaPool,
} from "../constants"
import React, { ReactElement, useEffect, useMemo, useState } from "react"
import { TokensStateType, useTokenFormState } from "../hooks/useTokenFormState"
import {
  calculatePrice,
  commify,
  formatBNToString,
  getContract,
  shiftBNDecimals,
} from "../utils"
import usePoolData, { PoolDataType } from "../hooks/usePoolData"
import AdvancedOptions from "./AdvancedOptions"
import { AppState } from "../state"
import ApprovalInfo from "./ApprovalInfo"
import { BigNumber } from "@ethersproject/bignumber"
import Bonus from "./pool/Bonus"
import FormTitle from "./FormTitleOptions"
import MaxFromBalance from "./input/MaxFromBalance"
import ModalWrapper from "./wrappers/ModalWrapper"
import OutdatedPoolInfo from "./OutdatedPoolInfo"
import ROSE_META_POOL_DEPOSIT from "../constants/abis/RoseMetaPoolDeposit.json"
import { Link as ReactLink } from "react-router-dom"
import ReviewDeposit from "./ReviewDeposit"
import SingleTokenInput from "./input/SingleTokenInput"
import { TokenPricesUSD } from "../state/application"
import { TransactionType } from "../hooks/useChakraToast"
import { Zero } from "@ethersproject/constants"
import { calculatePriceImpact } from "../utils/priceImpact"
import { ethers } from "ethers"
import { formatGasToString } from "../utils/gas"
import { parseUnits } from "@ethersproject/units"
import { useActiveWeb3React } from "../hooks"
import { useApproveAndDeposit } from "../hooks/useApproveAndDeposit"
import { usePoolContract } from "../hooks/useContract"
import { usePoolTokenBalances } from "../hooks/useTokenBalances"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

interface Props {
  poolName: PoolName
  handlePreSubmit?: (txnType: TransactionType) => void
  handlePostSubmit?: (
    receipt: ContractReceipt | null,
    transactionType: TransactionType,
    error?: { code: number; message: string },
  ) => void
}

function Deposit({
  poolName,
  handlePreSubmit,
  handlePostSubmit,
}: Props): ReactElement | null {
  const { account, library, chainId } = useActiveWeb3React()
  const approveAndDeposit = useApproveAndDeposit(poolName)
  const [poolData, userShareData] = usePoolData(poolName)
  const poolContract = usePoolContract(poolName) as Contract
  const { t } = useTranslation()

  const POOL = POOLS_MAP[poolName]

  const allTokens = useMemo(() => {
    return Array.from(
      new Set(POOL.poolTokens.concat(POOL.underlyingPoolTokens || [])),
    )
  }, [POOL.poolTokens, POOL.underlyingPoolTokens, poolName])
  const [tokenFormState, updateTokenFormState] = useTokenFormState(allTokens)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    updateTokenFormState(
      (POOL.underlyingPoolTokens || []).reduce(
        (acc, { symbol }) => ({
          ...acc,
          [symbol]: "",
        }),
        {},
      ),
    )
  }, [updateTokenFormState, POOL.poolTokens, POOL.underlyingPoolTokens])
  const tokenBalances = usePoolTokenBalances()
  const { tokenPricesUSD, gasStandard, gasFast, gasInstant } = useSelector(
    (state: AppState) => state.application,
  )

  // Merge underlying token usd prices and tokenPricesUSD array
  const [underlyingPoolData] = usePoolData(POOL.underlyingPool)
  let newTokenPricesUSD
  if (underlyingPoolData.lpTokenPriceUSD != Zero) {
    const underlyingTokenUSDValue = parseFloat(
      formatBNToString(poolData.lpTokenPriceUSD, 18, 2),
    )
    newTokenPricesUSD = {
      ...tokenPricesUSD,
      ...{
        [underlyingPoolData.lpToken]: underlyingTokenUSDValue,
      },
    }
  }

  const { gasPriceSelected, gasCustom } = useSelector(
    (state: AppState) => state.user,
  )
  const gasPrice = ethers.utils.parseUnits(
    formatGasToString(
      { gasStandard, gasFast, gasInstant },
      gasPriceSelected,
      gasCustom,
    ),
    "gwei",
  )
  const [estDepositLPTokenAmount, setEstDepositLPTokenAmount] = useState(Zero)
  const [priceImpact, setPriceImpact] = useState(Zero)
  const isMetaSwap = isMetaPool(POOL.name)
  const metaSwapContract = useMemo(() => {
    if (isMetaSwap && chainId && library) {
      return getContract(
        POOL.metaSwapAddresses?.[chainId] as string,
        JSON.stringify(ROSE_META_POOL_DEPOSIT),
        library,
        account ?? undefined,
      )
    }
    return null
  }, [isMetaSwap, chainId, library, POOL.metaSwapAddresses, account])

  useEffect(() => {
    // evaluate if a new deposit will exceed the pool's per-user limit
    async function calculateMaxDeposits(): Promise<void> {
      if (
        poolContract == null ||
        userShareData == null ||
        poolData == null ||
        account == null
      ) {
        setEstDepositLPTokenAmount(Zero)
        return
      }
      const tokenInputSum = parseUnits(
        allTokens
          .reduce(
            (sum, { symbol }) => sum + (+tokenFormState[symbol].valueRaw || 0),
            0,
          )
          .toFixed(18),
        18,
      )
      let depositLPTokenAmount
      if (poolData.totalLocked.gt(0) && tokenInputSum.gt(0)) {
        const txnAmounts: BigNumber[] = POOL.poolTokens.map((poolToken) => {
          return BigNumber.from(tokenFormState[poolToken.symbol].valueSafe)
        })
        depositLPTokenAmount = await poolContract.calc_token_amount(
          txnAmounts,
          true, // deposit boolean
        )
      } else {
        // when pool is empty, estimate the lptokens by just summing the input instead of calling contract
        depositLPTokenAmount = tokenInputSum
      }
      setEstDepositLPTokenAmount(depositLPTokenAmount)

      setPriceImpact(
        calculatePriceImpact(
          tokenInputSum,
          depositLPTokenAmount,
          poolData.virtualPrice,
        ),
      )
    }
    void calculateMaxDeposits()
  }, [
    poolData,
    tokenFormState,
    poolContract,
    userShareData,
    account,
    POOL.poolTokens,
    POOL.underlyingPoolTokens,
    metaSwapContract,
    allTokens,
  ])

  // A represention of tokens used for UI
  const tokens = POOL.poolTokens.map(({ symbol, name, icon, decimals }) => ({
    symbol,
    name,
    icon,
    max: tokenBalances?.[symbol] || Zero,
    decimals,
    inputValue: tokenFormState[symbol].valueRaw,
  }))

  async function onConfirmTransaction(): Promise<ContractReceipt | void> {
    const receipt = await approveAndDeposit(tokenFormState)
    // Clear input after deposit
    updateTokenFormState(
      allTokens.reduce(
        (acc, t) => ({
          ...acc,
          [t.symbol]: "",
        }),
        {},
      ),
    )

    return receipt
  }
  function updateTokenFormValue(symbol: string, value: string): void {
    updateTokenFormState({ [symbol]: value })
  }

  const depositTransaction = buildTransactionData(
    tokenFormState,
    poolData,
    POOL.poolTokens,
    POOL.lpToken,
    priceImpact,
    estDepositLPTokenAmount,
    gasPrice,
    newTokenPricesUSD,
  )

  const exceedsWallet = allTokens.some(({ symbol }) => {
    const exceedsBoolean = (tokenBalances?.[symbol] || Zero).lt(
      BigNumber.from(tokenFormState[symbol]?.valueSafe || 0),
    )
    return exceedsBoolean
  })

  const validDepositAmount =
    depositTransaction.to.totalAmount.gt(0) &&
    POOL.poolTokens.every(
      ({ symbol }) =>
        !tokenFormState[symbol].error || tokenFormState[symbol].isEmpty,
    ) &&
    !exceedsWallet
  const shouldDisplayWrappedOption = isMetaPool(poolData?.name)

  return (
    <Box>
      <ModalWrapper
        modalHeader={t("reviewDeposit")}
        isOpen={isOpen}
        onClose={(): void => setIsOpen(false)}
        maxW="550px"
        preserveScrollBarGap
        isCentered
      >
        <ReviewDeposit
          transactionData={depositTransaction}
          onClose={(): void => setIsOpen(false)}
          onConfirm={async () => {
            setIsOpen(false)
            handlePreSubmit?.(TransactionType.DEPOSIT)
            try {
              const receipt =
                (await onConfirmTransaction?.()) as ContractReceipt
              handlePostSubmit?.(receipt, TransactionType.DEPOSIT)
            } catch (e) {
              const error = e as ErrorObj
              handlePostSubmit?.(null, TransactionType.DEPOSIT, {
                code: error.code,
                message: error.message,
              })
            }
          }}
        />
      </ModalWrapper>
      <Stack spacing="20px">
        <FormTitle
          title={t("addLiquidity")}
          popoverOptions={<AdvancedOptions />}
        />
        {(shouldDisplayWrappedOption ||
          poolData?.name === FRAX_STABLES_LP_POOL_NAME) && (
          <Stack spacing="10px" pt="10px">
            {shouldDisplayWrappedOption && (
              <Text
                textAlign="center"
                fontSize="15px"
                fontWeight={400}
                color="gray.300"
              >
                Deposit to the{" "}
                <Link
                  textDecoration="underline"
                  as={ReactLink}
                  to="/pools/stables"
                  reloadDocument
                  fontWeight={700}
                  color="gray.100"
                  _hover={{ color: "gray.200" }}
                >
                  Stables Pool
                </Link>{" "}
                to get RoseStablesLP.{" "}
                {poolData?.name === UST_METAPOOL_NAME && (
                  <React.Fragment>
                    Get atUST by bridging UST from Terra on{" "}
                    <Link
                      href="https://app.allbridge.io/bridge?from=TRA&to=AURO&asset=UST"
                      isExternal
                      textDecoration="underline"
                      fontWeight={700}
                      color="gray.100"
                      _hover={{ color: "gray.200" }}
                    >
                      Allbridge.
                    </Link>
                  </React.Fragment>
                )}
              </Text>
            )}
            {poolData?.name === FRAX_STABLES_LP_POOL_NAME && (
              <OutdatedPoolInfo poolName="Frax" route="/pools/frax" />
            )}
          </Stack>
        )}
        <Stack spacing="15px">
          {tokens.map((token, index) => {
            let tokenUSDValue: number | BigNumber | undefined
            if (poolData.lpTokenPriceUSD != Zero) {
              tokenUSDValue = parseFloat(
                formatBNToString(poolData.lpTokenPriceUSD, 18, 2),
              )
            } else {
              tokenUSDValue = tokenPricesUSD?.[token.symbol]
            }
            return (
              <Stack key={index} alignItems="flex-end" spacing={0}>
                <MaxFromBalance
                  onClickMax={() => {
                    const balance = formatBNToString(
                      tokenBalances?.[token.symbol] || Zero,
                      token.decimals,
                    )
                    updateTokenFormValue(token.symbol, balance)
                  }}
                  max={formatBNToString(
                    tokenBalances?.[token.symbol] || Zero,
                    token.decimals,
                    6,
                  )}
                />
                <SingleTokenInput
                  token={token}
                  inputValue={token.inputValue}
                  isInvalid={false} // TODO: fix this
                  onChangeInput={(e): void => {
                    updateTokenFormValue(token.symbol, e.target.value)
                  }}
                />
                <Flex justifyContent="space-between" w="full">
                  {!!tokenFormState[token.symbol].error && !!token.inputValue && (
                    <Text color="red.600" whiteSpace="nowrap" fontSize="14px">
                      {tokenFormState[token.symbol].error}
                    </Text>
                  )}
                  {(tokenBalances?.[token.symbol] || Zero).lt(
                    BigNumber.from(tokenFormState[token.symbol].valueSafe),
                  ) && (
                    <Text color="red.600" whiteSpace="nowrap" fontSize="14px">
                      {t("insufficientBalance")}
                    </Text>
                  )}
                  <Flex justifyContent="flex-end" w="full" overflow="hidden">
                    <Text
                      textAlign="right"
                      fontSize="12px"
                      fontWeight={400}
                      color="gray.300"
                    >
                      ≈$
                      {commify(
                        formatBNToString(
                          calculatePrice(token.inputValue, tokenUSDValue),
                          18,
                          2,
                        ),
                      )}
                    </Text>
                  </Flex>
                </Flex>
              </Stack>
            )
          })}
        </Stack>
        <Bonus amount={depositTransaction.priceImpact} />
        <Button
          variant="primary"
          size="lg"
          width="100%"
          onClick={(): void => {
            setIsOpen(true)
          }}
          disabled={!validDepositAmount || poolData?.isPaused}
        >
          {t("deposit")}
        </Button>
        <ApprovalInfo />
      </Stack>
    </Box>
  )
}

function buildTransactionData(
  tokenFormState: TokensStateType,
  poolData: PoolDataType | null,
  poolTokens: Token[],
  poolLpToken: Token,
  priceImpact: BigNumber,
  estDepositLPTokenAmount: BigNumber,
  gasPrice: BigNumber,
  tokenPricesUSD?: TokenPricesUSD,
): DepositTransaction {
  const from = {
    items: [] as TransactionItem[],
    totalAmount: Zero,
    totalValueUSD: Zero,
  }
  const TOTAL_AMOUNT_DECIMALS = 18
  poolTokens.forEach((token) => {
    const { symbol, decimals } = token
    const amount = BigNumber.from(tokenFormState[symbol].valueSafe)
    const usdPriceBN = parseUnits(
      (tokenPricesUSD?.[symbol] || 0).toFixed(2),
      18,
    )
    if (amount.lte("0")) return
    const item = {
      token,
      amount,
      singleTokenPriceUSD: usdPriceBN,
      valueUSD: amount.mul(usdPriceBN).div(BigNumber.from(10).pow(decimals)),
    }
    from.items.push(item)
    from.totalAmount = from.totalAmount.add(
      shiftBNDecimals(amount, TOTAL_AMOUNT_DECIMALS - decimals),
    )
    from.totalValueUSD = from.totalValueUSD.add(usdPriceBN)
  })

  const lpTokenPriceUSD = poolData?.lpTokenPriceUSD || Zero
  const toTotalValueUSD = estDepositLPTokenAmount
    .mul(lpTokenPriceUSD)
    ?.div(BigNumber.from(10).pow(poolLpToken.decimals))
  const to = {
    item: {
      token: poolLpToken,
      amount: estDepositLPTokenAmount,
      singleTokenPriceUSD: lpTokenPriceUSD,
      valueUSD: toTotalValueUSD,
    },
    totalAmount: estDepositLPTokenAmount,
    totalValueUSD: toTotalValueUSD,
  }
  const shareOfPool = poolData?.totalLocked.gt(0)
    ? estDepositLPTokenAmount
        .mul(BigNumber.from(10).pow(18))
        .div(estDepositLPTokenAmount.add(poolData?.totalLocked))
    : BigNumber.from(10).pow(18)
  // TO-DO: fix gas price calculation
  // const gasAmount = calculateGasEstimate("addLiquidity").mul(gasPrice) // units of gas * GWEI/Unit of gas
  const gasAmount = BigNumber.from(0)

  const txnGasCost = {
    amount: gasAmount,
    valueUSD: tokenPricesUSD?.ETH
      ? parseUnits(tokenPricesUSD.ETH.toFixed(2), 18) // USD / ETH  * 10^18
          .mul(gasAmount) // GWEI
          .div(BigNumber.from(10).pow(25)) // USD / ETH * GWEI * ETH / GWEI = USD
      : null,
  }

  return {
    from,
    to,
    priceImpact,
    shareOfPool,
    txnGasCost,
  }
}

export default Deposit
