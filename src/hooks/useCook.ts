import { AppDispatch, AppState } from "../state"
import { BigNumber, BigNumberish } from "@ethersproject/bignumber"
import {
  BorrowMarketName,
  ChainId,
  SignedSignatureRes,
  TRANSACTION_TYPES,
} from "../constants"
import { BytesLike, ethers } from "ethers"
import { ContractReceipt, PayableOverrides } from "@ethersproject/contracts"
import { getSigner, parseSignature } from "../utils"
import {
  useBorrowContract,
  useCollateralContract,
  useGardenContract,
  useVaseContract,
} from "./useContract"
import { useDispatch, useSelector } from "react-redux"
import { Erc20 } from "../../types/ethers-contracts/Erc20"
import { Garden } from "../../types/ethers-contracts/Garden"
import { Vase } from "../../types/ethers-contracts/Vase"
import { Zero } from "@ethersproject/constants"
import checkAndApproveTokenForTrade from "../utils/checkAndApproveTokenForTrade"
import { updateLastTransactionTimes } from "../state/application"
import { useActiveWeb3React } from "."

enum GardenActions {
  REPAY = 2,
  REMOVE_COLLATERAL = 4,
  BORROW = 5,
  REPAY_SHARE = 6,
  REPAY_PART = 7,
  ADD_COLLATERAL = 10,
  UPDATE_EXCHANGE_RATE = 11,
  VASE_DEPOSIT = 20,
  VASE_WITHDRAW = 21,
  VASE_SET_APPROVAL = 24,
}

export enum CookAction {
  BORROW = 0,
  REPAY = 1,
}

interface CookArgsProps {
  parsedSignature: SignedSignatureRes | null
  account: string
  borrowAmount: BigNumber
  collateralAmount: BigNumber
  borrowTokenAddress: string
  collateralTokenAddress: string
  masterContractAddress: string
  updateOraclePrice: boolean
  repayMax?: boolean
}

interface CookArgs {
  actions: BigNumberish[]
  values: BigNumberish[]
  datas: BytesLike[]
  overrides?: PayableOverrides & { from?: string | Promise<string> }
}

export function useCook(
  borrowMarket: BorrowMarketName,
): (
  collateral: string,
  borrow: string,
  cookAction: CookAction,
  onMessageSignatureTransactionStart?: () => void,
  onApprovalTransactionStart?: () => void,
  repayMax?: boolean,
) => Promise<ContractReceipt | void> {
  const gardenContract = useGardenContract(borrowMarket) as Garden
  const vaseContract = useVaseContract(borrowMarket) as Vase
  const collateralTokenContract = useCollateralContract(borrowMarket) as Erc20
  const borrowTokenContract = useBorrowContract(borrowMarket) as Erc20

  const { library, account, chainId } = useActiveWeb3React()
  const dispatch = useDispatch<AppDispatch>()

  const { infiniteApproval, priceFromOracle } = useSelector(
    (state: AppState) => state.user,
  )

  return async function cook(
    collateralAmount: string,
    borrowAmount: string,
    cookAction: CookAction,
    onMessageSignatureTransactionStart?: () => void,
    onApprovalTransactionStart?: () => void,
    repayMax?: boolean,
  ): Promise<ContractReceipt | void> {
    // validation checks
    if (
      !account ||
      !chainId ||
      !library ||
      !gardenContract ||
      !vaseContract ||
      !collateralTokenContract ||
      !borrowTokenContract
    ) {
      return
    }

    try {
      const masterContractAddress = await gardenContract.masterContract()
      const vaseAddress = await gardenContract.vase()

      const amountToDeposit = BigNumber.from(collateralAmount)
      const amountToBorrow = BigNumber.from(borrowAmount)

      const gasPrice = Zero // change this

      // approve
      await checkAndApproveTokenForTrade(
        cookAction === CookAction.BORROW
          ? collateralTokenContract
          : borrowTokenContract,
        vaseAddress,
        account,
        cookAction === CookAction.BORROW ? amountToDeposit : amountToBorrow,
        infiniteApproval,
        gasPrice,
        {
          onTransactionStart: () => {
            onApprovalTransactionStart?.()
            return undefined
          },
        },
      )

      const masterContractApproved = await vaseContract.masterContractApproved(
        masterContractAddress,
        account,
      )

      // signature request if not already approved
      if (!masterContractApproved) {
        onMessageSignatureTransactionStart?.()
      }

      const parsedSignature = masterContractApproved
        ? null
        : await requestSignature(
            chainId,
            vaseAddress,
            "Vase",
            "Give FULL access to funds in (and approved to) Vase?",
            masterContractAddress,
            vaseContract,
            account,
            library,
          )

      // cook
      const cookArgProps = {
        parsedSignature: parsedSignature,
        account: account,
        borrowAmount: amountToBorrow,
        collateralAmount: amountToDeposit,
        borrowTokenAddress: borrowTokenContract.address,
        collateralTokenAddress: collateralTokenContract.address,
        masterContractAddress: masterContractAddress,
        updateOraclePrice: priceFromOracle,
        repayMax: repayMax,
      }

      const cookArgs =
        cookAction === CookAction.BORROW
          ? getBorrowCookArgs({ ...cookArgProps })
          : repayCookArgs({ ...cookArgProps })

      const tx = await gardenContract.cook(
        cookArgs.actions,
        cookArgs.values,
        cookArgs.datas,
      )

      // complete
      const receipt = await tx.wait()
      dispatch(
        updateLastTransactionTimes({ [TRANSACTION_TYPES.BORROW]: Date.now() }),
      )
      dispatch(
        updateLastTransactionTimes({ [TRANSACTION_TYPES.BORROW]: Date.now() }),
      )

      return receipt
    } catch (e) {
      const error = e as { code: number; message: string }
      throw error
    }
  }
}

/**
 * Create a JsonRpcSigner signature request for BentoBox
 * @param chainId ChainId
 * @param verifyingContractAddress string
 * @param verifyingDomainName string
 * @param messageToSign string
 * @param masterContractAddress string
 * @param verifyingContract Contract
 * @param account string
 * @param library Web3Provider
 * @returns Promise<SignedSignatureRes>
 */
const requestSignature = async (
  chainId: ChainId,
  verifyingContractAddress: string,
  verifyingDomainName: string,
  messageToSign: string,
  masterContractAddress: string,
  verifyingContract: Vase,
  account: string,
  library: ethers.providers.Web3Provider,
): Promise<SignedSignatureRes> => {
  const domain = {
    name: verifyingDomainName,
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
    warning: messageToSign,
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

const getDefaultCookArgs = ({
  parsedSignature,
  account,
  masterContractAddress,
  updateOraclePrice,
}: CookArgsProps): CookArgs => {
  const actions: BigNumberish[] = []
  const values: BigNumberish[] = []
  const datas: BytesLike[] = []

  // APPROVALS
  if (parsedSignature) {
    actions.push(GardenActions.VASE_SET_APPROVAL)
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

  // UPDATE EXCHANGE RATE
  if (updateOraclePrice) {
    actions.push(GardenActions.UPDATE_EXCHANGE_RATE)
    values.push(0)
    datas.push(
      ethers.utils.defaultAbiCoder.encode(
        ["bool", "uint256", "uint256"],
        [true, "0x00", "0x00"],
      ),
    )
  }

  return {
    actions,
    values,
    datas,
  }
}

const getBorrowCookArgs = (props: CookArgsProps): CookArgs => {
  const { actions, values, datas } = getDefaultCookArgs(props)

  // BORROW
  if (!props.borrowAmount.isZero()) {
    actions.push(GardenActions.BORROW, GardenActions.VASE_WITHDRAW)
    values.push(0, 0)
    datas.push(
      ethers.utils.defaultAbiCoder.encode(
        ["int256", "address"],
        [props.borrowAmount, props.account],
      ),
      ethers.utils.defaultAbiCoder.encode(
        ["address", "address", "int256", "int256"],
        [props.borrowTokenAddress, props.account, props.borrowAmount, "0x0"],
      ),
    )
  }

  // DEPOSIT COLLATERAL
  if (!props.collateralAmount.isZero()) {
    actions.push(GardenActions.VASE_DEPOSIT, GardenActions.ADD_COLLATERAL)
    values.push(0, 0)
    datas.push(
      ethers.utils.defaultAbiCoder.encode(
        ["address", "address", "int256", "int256"],
        [
          props.collateralTokenAddress,
          props.account,
          props.collateralAmount,
          "0",
        ],
      ),
      ethers.utils.defaultAbiCoder.encode(
        ["int256", "address", "bool"],
        ["-2", props.account, false],
      ),
    )
  }

  return {
    actions,
    values,
    datas,
  }
}

const repayCookArgs = (props: CookArgsProps): CookArgs => {
  const { actions, values, datas } = getDefaultCookArgs(props)

  // REPAY
  if (props.repayMax) {
    console.log("REPAY MAX")
    actions.push(
      GardenActions.REPAY_SHARE,
      GardenActions.VASE_DEPOSIT,
      GardenActions.REPAY,
    )
    values.push(0, 0, 0)
    datas.push(
      ethers.utils.defaultAbiCoder.encode(["int256"], [props.collateralAmount]),
      ethers.utils.defaultAbiCoder.encode(
        ["address", "address", "int256", "int256"],
        [props.borrowTokenAddress, props.account, "0x00", "-0x01"],
      ),
      ethers.utils.defaultAbiCoder.encode(
        ["int256", "address", "bool"],
        [props.borrowAmount, props.account, false],
      ),
    )
  } else if (!props.borrowAmount.isZero()) {
    console.log("REPAY PART")
    actions.push(
      GardenActions.VASE_DEPOSIT,
      GardenActions.REPAY_PART,
      GardenActions.REPAY,
    )
    values.push(0, 0, 0)
    datas.push(
      ethers.utils.defaultAbiCoder.encode(
        ["address", "address", "int256", "int256"],
        [props.borrowTokenAddress, props.account, props.borrowAmount, "0x0"],
      ),
      ethers.utils.defaultAbiCoder.encode(["int256"], ["-0x01"]),
      ethers.utils.defaultAbiCoder.encode(
        ["int256", "address", "bool"],
        ["-0x01", props.account, false],
      ),
    )
  }

  // WITHDRAW COLLATERAL
  if (!props.collateralAmount.isZero()) {
    actions.push(GardenActions.REMOVE_COLLATERAL, GardenActions.VASE_WITHDRAW)
    values.push(0, 0)
    datas.push(
      ethers.utils.defaultAbiCoder.encode(
        ["int256", "address"],
        [props.collateralAmount, props.account],
      ),
      ethers.utils.defaultAbiCoder.encode(
        ["address", "address", "int256", "int256"],
        [
          props.collateralTokenAddress,
          props.account,
          "0x00",
          props.collateralAmount,
        ],
      ),
    )
  }

  return {
    actions,
    values,
    datas,
  }
}
