import {
  BORROW_MARKET_MAP,
  BorrowMarketName,
  ChainId,
  TRANSACTION_TYPES,
} from "../constants"
import { BigNumber, BigNumberish } from "@ethersproject/bignumber"
import { BytesLike, ethers } from "ethers"
import { ContractReceipt, PayableOverrides } from "@ethersproject/contracts"
import {
  useBentoBoxContract,
  useBorrowContract,
  useCauldronContract,
  useCollateralContract,
} from "./useContract"
import { AppDispatch } from "../state"
import { BentoBox } from "../../types/ethers-contracts/BentoBox"
import { Cauldron } from "../../types/ethers-contracts/Cauldron"
import { Erc20 } from "../../types/ethers-contracts/Erc20"
import { Zero } from "@ethersproject/constants"
import checkAndApproveTokenForTrade from "../utils/checkAndApproveTokenForTrade"
import { getSigner } from "../utils"
import { updateLastTransactionTimes } from "../state/application"
import { useActiveWeb3React } from "."
import { useDispatch } from "react-redux"

enum CauldronActions {
  REPAY = 2,
  REMOVE_COLLATERAL = 4,
  BORROW = 5,
  REPAY_PART = 7,
  ADD_COLLATERAL = 10,
  UPDATE_EXCHANGE_RATE = 11,
  BENTO_DEPOSIT = 20,
  BENTO_WITHDRAW = 21,
  BENTO_SET_APPROVAL = 24,
}

export enum CookAction {
  BORROW = 0,
  REPAY = 1,
}

type SignedSignatureRes = {
  r: string
  s: string
  v: number
}

interface CookArgs {
  actions: BigNumberish[]
  values: BigNumberish[]
  datas: BytesLike[]
  overrides?: PayableOverrides & { from?: string | Promise<string> }
}

const parseSignature = (signature: string): SignedSignatureRes => {
  const parsedSignature = signature.substring(2)
  const r = parsedSignature.substring(0, 64)
  const s = parsedSignature.substring(64, 128)
  const v = parsedSignature.substring(128, 130)
  return {
    r: "0x" + r,
    s: "0x" + s,
    v: parseInt(v, 16),
  }
}

const requestSignature = async (
  chainId: ChainId,
  verifyingContractAddress: string,
  masterContractAddress: string,
  verifyingContract: BentoBox,
  account: string,
  library: ethers.providers.Web3Provider,
): Promise<SignedSignatureRes> => {
  const domain = {
    name: "BentoBox V1",
    chainId,
    verifyingContract: verifyingContractAddress,
  }

  // The named list of all type definitions
  const types = {
    SetMasterContractApproval: [
      { name: "warning", type: "string" },
      { name: "user", type: "address" },
      { name: "masterContract", type: "address" },
      { name: "approved", type: "bool" },
      { name: "nonce", type: "uint256" },
    ],
  }
  // The data to sign
  const value = {
    warning: "Give FULL access to funds in (and approved to) BentoBox?",
    user: account,
    masterContract: masterContractAddress,
    approved: true,
    nonce: await verifyingContract.nonces(account),
  }

  const signature = await getSigner(library, account)._signTypedData(
    domain,
    types,
    value,
  )

  return parseSignature(signature)
}

const getBorrowCookArgs = (
  parsedSignature: SignedSignatureRes | null,
  account: string,
  borrowAmount: BigNumber,
  collateralAmount: BigNumber,
  borrowTokenAddress: string,
  collateralTokenAddress: string,
  masterContractAddress: string,
): CookArgs => {
  const actions: BigNumberish[] = []
  const values: BigNumberish[] = []
  const datas: BytesLike[] = []

  // APPROVALS
  if (parsedSignature) {
    actions.push(CauldronActions.BENTO_SET_APPROVAL)
    values.push(0)
    datas.push(
      ethers.utils.defaultAbiCoder.encode(
        ["address", "address", "bool", "uint8", "bytes32", "bytes32"],
        [
          account,
          masterContractAddress,
          true,
          parsedSignature.v,
          parsedSignature.r,
          parsedSignature.s,
        ],
      ),
    )
  }

  // TO-DO: condition for adding this?
  // UPDATE EXCHANGE RATE
  actions.push(CauldronActions.UPDATE_EXCHANGE_RATE)
  values.push(0)
  datas.push(
    ethers.utils.defaultAbiCoder.encode(
      ["bool", "uint256", "uint256"],
      [true, "0x00", "0x00"],
    ),
  )

  // BORROW
  if (!borrowAmount.isZero()) {
    actions.push(CauldronActions.BORROW, CauldronActions.BENTO_WITHDRAW)
    values.push(0, 0)
    datas.push(
      ethers.utils.defaultAbiCoder.encode(
        ["int256", "address"],
        [borrowAmount, account],
      ),
      ethers.utils.defaultAbiCoder.encode(
        ["address", "address", "int256", "int256"],
        [borrowTokenAddress, account, borrowAmount, 0],
      ),
    )
  }

  // DEPOSIT COLLATERAL
  if (!collateralAmount.isZero()) {
    actions.push(CauldronActions.BENTO_DEPOSIT, CauldronActions.ADD_COLLATERAL)
    values.push(0, 0)
    datas.push(
      ethers.utils.defaultAbiCoder.encode(
        ["address", "address", "int256", "int256"],
        [collateralTokenAddress, account, collateralAmount, 0],
      ),
      ethers.utils.defaultAbiCoder.encode(
        ["int256", "address", "bool"],
        [collateralAmount, account, false],
      ),
    )
  }

  return {
    actions,
    values,
    datas,
  }
}

const repayCookArgs = (
  parsedSignature: SignedSignatureRes | null,
  account: string,
  borrowAmount: BigNumber,
  collateralAmount: BigNumber,
  borrowTokenAddress: string,
  collateralTokenAddress: string,
  masterContractAddress: string,
): CookArgs => {
  const actions: BigNumberish[] = []
  const values: BigNumberish[] = []
  const datas: BytesLike[] = []

  // APPROVALS
  if (parsedSignature) {
    actions.push(CauldronActions.BENTO_SET_APPROVAL)
    values.push(0)
    datas.push(
      ethers.utils.defaultAbiCoder.encode(
        ["address", "address", "bool", "uint8", "bytes32", "bytes32"],
        [
          account,
          masterContractAddress,
          true,
          parsedSignature.v,
          parsedSignature.r,
          parsedSignature.s,
        ],
      ),
    )
  }

  // TO-DO: condition for adding this?
  // UPDATE EXCHANGE RATE
  actions.push(CauldronActions.UPDATE_EXCHANGE_RATE)
  values.push(0)
  datas.push(
    ethers.utils.defaultAbiCoder.encode(
      ["bool", "uint256", "uint256"],
      [true, "0x00", "0x00"],
    ),
  )

  // REPAY
  if (!borrowAmount.isZero()) {
    actions.push(
      CauldronActions.BENTO_DEPOSIT,
      CauldronActions.REPAY_PART,
      CauldronActions.REPAY,
    )
    values.push(0, 0, 0)
    datas.push(
      ethers.utils.defaultAbiCoder.encode(
        ["address", "address", "int256", "int256"],
        [borrowTokenAddress, account, borrowAmount, 0],
      ),
      ethers.utils.defaultAbiCoder.encode(["int256"], ["-0x01"]),
      ethers.utils.defaultAbiCoder.encode(
        ["int256", "address", "bool"],
        ["-0x01", account, false],
      ),
    )
  }

  // WITHDRAW COLLATERAL
  if (!collateralAmount.isZero()) {
    actions.push(
      CauldronActions.REMOVE_COLLATERAL,
      CauldronActions.BENTO_WITHDRAW,
    )
    values.push(0, 0)
    datas.push(
      ethers.utils.defaultAbiCoder.encode(
        ["int256", "address"],
        [collateralAmount, account],
      ),
      ethers.utils.defaultAbiCoder.encode(
        ["address", "address", "int256", "int256"],
        [collateralTokenAddress, account, 0, collateralAmount],
      ),
    )
  }

  return {
    actions,
    values,
    datas,
  }
}

export function useCook(
  borrowMarket: BorrowMarketName,
): (
  collateral: string,
  borrow: string,
  cookAction: CookAction,
) => Promise<ContractReceipt | void> {
  const cauldronContract = useCauldronContract(borrowMarket) as Cauldron
  const bentoBoxContract = useBentoBoxContract(borrowMarket) as BentoBox
  const collateralTokenContract = useCollateralContract(borrowMarket) as Erc20
  const borrowTokenContract = useBorrowContract(borrowMarket) as Erc20
  const { library, account, chainId } = useActiveWeb3React()
  const dispatch = useDispatch<AppDispatch>()

  return async function cook(
    collateralAmount: string,
    borrowAmount: string,
    cookAction: CookAction,
  ): Promise<ContractReceipt | void> {
    try {
      if (!account || !chainId || !library)
        throw new Error("Wallet must be connected")
      if (!cauldronContract || !bentoBoxContract || !collateralTokenContract)
        throw new Error("Contracts are not loaded.")

      const BORROW_MARKET = BORROW_MARKET_MAP[borrowMarket]

      const masterContractAddress = await cauldronContract.masterContract()
      const bentoBoxAddress = await cauldronContract.bentoBox()

      const amountToDeposit = BigNumber.from(collateralAmount)
      const amountToBorrow = BigNumber.from(borrowAmount)

      const gasPrice = Zero // change this

      // approve collateral
      const alreadyApproved = await checkAndApproveTokenForTrade(
        cookAction === CookAction.BORROW
          ? collateralTokenContract
          : borrowTokenContract,
        bentoBoxAddress,
        account,
        cookAction === CookAction.BORROW ? amountToDeposit : amountToBorrow,
        false,
        gasPrice,
        {
          onTransactionError: (error) => {
            console.error(error)
            throw new Error("Your transaction could not be completed")
          },
        },
      )

      const parsedSignature = alreadyApproved
        ? null
        : await requestSignature(
            chainId,
            bentoBoxAddress,
            masterContractAddress,
            bentoBoxContract,
            account,
            library,
          )

      const cookArgs =
        cookAction === CookAction.BORROW
          ? getBorrowCookArgs(
              parsedSignature,
              account,
              amountToBorrow,
              amountToDeposit,
              BORROW_MARKET.borrowToken.addresses[chainId],
              BORROW_MARKET.collateralToken.addresses[chainId],
              masterContractAddress,
            )
          : repayCookArgs(
              parsedSignature,
              account,
              amountToBorrow,
              amountToDeposit,
              BORROW_MARKET.borrowToken.addresses[chainId],
              BORROW_MARKET.collateralToken.addresses[chainId],
              masterContractAddress,
            )

      const tx = await cauldronContract.cook(
        cookArgs.actions,
        cookArgs.values,
        cookArgs.datas,
      )

      const receipt = await tx.wait()
      dispatch(
        updateLastTransactionTimes({ [TRANSACTION_TYPES.BORROW]: Date.now() }),
      )
      return receipt
    } catch (e) {
      console.error(e)
    }
  }
}
