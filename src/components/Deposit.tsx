/* eslint @typescript-eslint/no-unsafe-assignment: 0 */
/* eslint @typescript-eslint/no-unsafe-call: 0 */
/* eslint @typescript-eslint/no-unsafe-member-access: 0 */
/* eslint @typescript-eslint/no-unsafe-return: 0 */
/* eslint @typescript-eslint/no-explicit-any: 0 */
/* eslint @typescript-eslint/no-unused-vars: 0 */
import "./DepositPage.scss"
import { Box, Button, Center } from "@chakra-ui/react"
import { Contract, ContractReceipt } from "@ethersproject/contracts"
import { DepositTransaction, TransactionItem } from "../types/transactions"
import {
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
  formatBNToPercentString,
  formatBNToString,
  getContract,
  shiftBNDecimals,
} from "../utils"
import usePoolData, { PoolDataType } from "../hooks/usePoolData"
import AdvancedOptions from "./AdvancedOptions"
import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import { BsSliders } from "react-icons/bs"
import { IconButtonPopover } from "./Popover"
import { Link } from "react-router-dom"
import Modal from "./Modal"
import ROSE_META_POOL_DEPOSIT from "../constants/abis/RoseMetaPoolDeposit.json"
import ReviewDeposit from "./ReviewDeposit"
import TokenInput from "./TokenInput"
import { TokenPricesUSD } from "../state/application"
import { TransactionType } from "../hooks/useChakraToast"
import { Zero } from "@ethersproject/constants"
import { calculatePriceImpact } from "../utils/priceImpact"
import { ethers } from "ethers"
import { formatGasToString } from "../utils/gas"
import { logEvent } from "../utils/googleAnalytics"
import { parseUnits } from "@ethersproject/units"
import { useActiveWeb3React } from "../hooks"
import { useApproveAndDeposit } from "../hooks/useApproveAndDeposit"
import { usePoolContract } from "../hooks/useContract"
import { usePoolTokenBalances } from "../state/wallet/hooks"
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
  }, [POOL.poolTokens, POOL.underlyingPoolTokens])
  const [tokenFormState, updateTokenFormState] = useTokenFormState(allTokens)
  const [shouldDepositWrapped, setShouldDepositWrapped] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // empty out previous token state when switchng between wrapped and unwrapped
    if (shouldDepositWrapped) {
      updateTokenFormState(
        POOL.poolTokens.reduce(
          (acc, { symbol }) => ({
            ...acc,
            [symbol]: "",
          }),
          {},
        ),
      )
    } else {
      updateTokenFormState(
        (POOL.underlyingPoolTokens || []).reduce(
          (acc, { symbol }) => ({
            ...acc,
            [symbol]: "",
          }),
          {},
        ),
      )
    }
  }, [
    shouldDepositWrapped,
    updateTokenFormState,
    POOL.poolTokens,
    POOL.underlyingPoolTokens,
  ])
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

  const exceedsWallet = allTokens.some(({ symbol }) => {
    const exceedsBoolean = (tokenBalances?.[symbol] || Zero).lt(
      BigNumber.from(tokenFormState[symbol].valueSafe),
    )
    return exceedsBoolean
  })

  useEffect(() => {
    // evaluate if a new deposit will exceed the pool's per-user limit
    async function calculateMaxDeposits(): Promise<void> {
      if (
        poolContract == null ||
        userShareData == null ||
        poolData == null ||
        account == null ||
        exceedsWallet
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
        if (shouldDepositWrapped) {
          depositLPTokenAmount = metaSwapContract
            ? await metaSwapContract.calc_token_amount(
                (POOL.underlyingPoolTokens || []).map(({ symbol }) =>
                  BigNumber.from(tokenFormState[symbol].valueSafe),
                ),
                true, // deposit boolean
              )
            : Zero
        } else {
          const txnAmounts: BigNumber[] = POOL.poolTokens.map((poolToken) => {
            return BigNumber.from(tokenFormState[poolToken.symbol].valueSafe)
          })
          depositLPTokenAmount = await poolContract.calc_token_amount(
            txnAmounts,
            true, // deposit boolean
          )
        }
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
    shouldDepositWrapped,
    allTokens,
    exceedsWallet,
  ])

  // A represention of tokens used for UI
  const tokens = (
    shouldDepositWrapped ? POOL.underlyingPoolTokens || [] : POOL.poolTokens
  ).map(({ symbol, name, icon, decimals }) => ({
    symbol,
    name,
    icon,
    max: formatBNToString(tokenBalances?.[symbol] || Zero, decimals),
    inputValue: tokenFormState[symbol].valueRaw,
  }))

  async function onConfirmTransaction(): Promise<ContractReceipt | void> {
    const receipt = await approveAndDeposit(
      tokenFormState,
      shouldDepositWrapped,
    )
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
    shouldDepositWrapped ? POOL.underlyingPoolTokens || [] : POOL.poolTokens,
    POOL.lpToken,
    priceImpact,
    estDepositLPTokenAmount,
    gasPrice,
    newTokenPricesUSD,
  )

  const validDepositAmount =
    depositTransaction.to.totalAmount.gt(0) && !exceedsWallet
  const shouldDisplayWrappedOption = isMetaPool(poolData?.name)

  return (
    <Box>
      <Modal isOpen={isOpen} onClose={(): void => setIsOpen(false)}>
        <ReviewDeposit
          transactionData={depositTransaction}
          onClose={(): void => setIsOpen(false)}
          onConfirm={async () => {
            setIsOpen(false)
            logEvent("deposit", (poolData && { pool: poolData?.name }) || {})
            handlePreSubmit?.(TransactionType.DEPOSIT)
            try {
              const receipt =
                (await onConfirmTransaction?.()) as ContractReceipt
              handlePostSubmit?.(receipt, TransactionType.DEPOSIT)
            } catch (e) {
              const error = e as { code: number; message: string }
              handlePostSubmit?.(null, TransactionType.DEPOSIT, {
                code: error.code,
                message: error.message,
              })
            }
          }}
        />
      </Modal>
      <div className="form">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <h3>{t("addLiquidity")}</h3>
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
        </div>
        {exceedsWallet ? (
          <div className="error">{t("depositBalanceExceeded")}</div>
        ) : null}
        {/* disable deposit wrapped button until gas limit is raised on aurora */}
        {/* {shouldDisplayWrappedOption && (
          <div className="wrappedDeposit">
            <Switch
              colorScheme="red"
              onChange={() =>
                setShouldDepositWrapped((prevState) => !prevState)
              }
              isChecked={shouldDepositWrapped}
            />
            <span>
              <small>{t("depositWrapped")}</small>
            </span>
          </div>
        )} */}
        {tokens.map((token, index) => (
          <div key={index}>
            <TokenInput
              {...token}
              disabled={poolData?.isPaused}
              onChange={(value): void =>
                updateTokenFormValue(token.symbol, value)
              }
            />
            {index === tokens.length - 1 ? (
              ""
            ) : (
              <div className="formSpace"></div>
            )}
          </div>
        ))}
        <div className="transactionInfo">
          <div className="transactionInfoItem">
            {depositTransaction.priceImpact.gte(0) ? (
              <span className="bonus">{`${t("bonus")}: `}</span>
            ) : (
              <span className="slippage">{t("priceImpact")}</span>
            )}
            <span
              className={
                "value " +
                (depositTransaction.priceImpact.gte(0) ? "bonus" : "slippage")
              }
            >
              {" "}
              {formatBNToPercentString(depositTransaction.priceImpact, 18, 4)}
            </span>
          </div>
        </div>
      </div>
      {shouldDisplayWrappedOption && (
        <div className="options">
          <p className="wrappedInfo">
            Deposit to the <a href="/#/pools/stables">Stables Pool</a> to get
            RoseStablesLP.{" "}
            {poolData?.name === UST_METAPOOL_NAME && (
              <>
                Get atUST by bridging UST from Terra on{" "}
                <a
                  href="https://app.allbridge.io/bridge?from=TRA&to=AURO&asset=UST"
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: "underline", margin: 0 }}
                >
                  Allbridge.
                </a>
              </>
            )}
          </p>
        </div>
      )}
      {poolData?.name === FRAX_STABLES_LP_POOL_NAME && (
        <div className="options">
          <p className="wrappedInfo">
            This pool is outdated. Please{" "}
            <a href="/#/pools/frax-stableslp">
              go here to withdraw any liquidity
            </a>{" "}
            from this pool and{" "}
            <a href="/#/pools/frax">use the new Frax pool instead.</a>
          </p>
        </div>
      )}
      <div className="options" style={{ height: "100%" }}>
        <Center width="100%">
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
        </Center>
        <div className="approvalMessage">
          Note: The &quot;Approve&quot; transaction is only needed the first
          time; subsequent actions will not require approval.
        </div>
      </div>
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
