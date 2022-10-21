import {
  NumberInputState,
  numberInputStateCreator,
} from "../utils/numberInputState"
import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { BigNumber } from "@ethersproject/bignumber"
import { ConnectionType } from "../types/web3"
import { Zero } from "@ethersproject/constants"

export enum GasPrices {
  Standard = "STANDARD",
  Fast = "FAST",
  Instant = "INSTANT",
  Custom = "CUSTOM",
}

export enum Slippages {
  One = "ONE",
  OneTenth = "ONE_TENTH",
  Custom = "CUSTOM",
}

export enum Deadlines {
  Ten = "TEN",
  Twenty = "TWENTY",
  Thirty = "THIRTY",
  Forty = "FORTY",
  Custom = "CUSTOM",
}

export enum PoolSortFields {
  NAME = "name",
  BALANCE = "balance",
  TVL = "tvl",
  VOLUME = "volume",
  FARM_DEPOSIT = "farmDeposit",
  FARM_TVL = "farmTvl",
  APR = "apr",
  REWARDS = "rewards",
}

export enum PoolFilterFields {
  NO_FILTER = "noFilter",
  FARM_DEPOSIT = "farmDeposit",
  BALANCE = "balance",
}

interface PoolPreferences {
  visibleFields: {
    [field in PoolSortFields]: number
  }
  filterField: PoolFilterFields
  sortField: PoolSortFields
}

export enum BorrowSortFields {
  NAME = "name",
  BORROW = "borrow",
  COLLATERAL = "collateral",
  TVL = "tvl",
  SUPPLY = "supply",
  INTEREST = "interest",
  LIQUIDATION_FEE = "liquidationFee",
}

export enum BorrowFilterFields {
  BORROW = "borrow",
  SUPPLY = "supply",
  COLLATERAL = "collateral",
  NO_FILTER = "noFilter",
}

interface BorrowPreferences {
  visibleFields: {
    [field in BorrowSortFields]: number
  }
  filterField: BorrowFilterFields
  sortField: BorrowSortFields
}

type Wallet = {
  connectionType: ConnectionType
  address?: string
}

interface UserState {
  userSwapAdvancedMode: boolean
  userPoolAdvancedMode: boolean
  userDarkMode: boolean
  gasCustom?: NumberInputState
  gasPriceSelected: GasPrices
  slippageCustom?: NumberInputState
  slippageSelected: Slippages
  infiniteApproval: boolean
  priceFromOracle: boolean
  transactionDeadlineSelected: Deadlines
  transactionDeadlineCustom?: string
  borrowPreferences: BorrowPreferences
  poolPreferences: PoolPreferences
  connectedWallets: { [key: string]: Wallet }
  selectedWallet?: Wallet
}

export const initialState: UserState = {
  userSwapAdvancedMode: false,
  userPoolAdvancedMode: false,
  userDarkMode: true,
  gasPriceSelected: GasPrices.Standard,
  slippageSelected: Slippages.OneTenth,
  infiniteApproval: false,
  priceFromOracle: false,
  transactionDeadlineSelected: Deadlines.Twenty,
  borrowPreferences: {
    visibleFields: {
      name: 1,
      borrow: 1,
      collateral: -1,
      tvl: 1,
      supply: 1,
      interest: 1,
      liquidationFee: 1,
    },
    filterField: BorrowFilterFields.NO_FILTER,
    sortField: BorrowSortFields.TVL,
  },
  poolPreferences: {
    visibleFields: {
      name: 1,
      balance: 1,
      volume: 1,
      tvl: 1,
      farmDeposit: 1,
      farmTvl: -1,
      apr: 1,
      rewards: 1,
    },
    filterField: PoolFilterFields.NO_FILTER,
    sortField: PoolSortFields.TVL,
  },
  connectedWallets: {},
}

const gasCustomStateCreator = numberInputStateCreator(
  0, // gas is in wei
  Zero,
)
const slippageCustomStateCreator = numberInputStateCreator(
  4,
  BigNumber.from(10).pow(4).mul(1),
)

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateSwapAdvancedMode(
      state: UserState,
      action: PayloadAction<boolean>,
    ): void {
      state.userSwapAdvancedMode = action.payload
    },
    updatePoolAdvancedMode(
      state: UserState,
      action: PayloadAction<boolean>,
    ): void {
      state.userPoolAdvancedMode = action.payload
    },
    updateDarkMode(state: UserState, action: PayloadAction<boolean>): void {
      // this will be phased out in favor of chakra's colorMode
      state.userDarkMode = action.payload
    },
    updateGasPriceCustom(
      state: UserState,
      action: PayloadAction<string>,
    ): void {
      state.gasCustom = gasCustomStateCreator(action.payload)
    },
    updateGasPriceSelected(
      state: UserState,
      action: PayloadAction<GasPrices>,
    ): void {
      state.gasPriceSelected = action.payload
      if (action.payload !== GasPrices.Custom) {
        // clear custom value when standard option selected
        state.gasCustom = gasCustomStateCreator("")
      }
    },
    updateSlippageSelected(
      state: UserState,
      action: PayloadAction<Slippages>,
    ): void {
      state.slippageSelected = action.payload
      if (action.payload !== Slippages.Custom) {
        // clear custom value when standard option selected
        state.slippageCustom = slippageCustomStateCreator("")
      }
    },
    updateSlippageCustom(
      state: UserState,
      action: PayloadAction<string>,
    ): void {
      state.slippageCustom = slippageCustomStateCreator(action.payload)
    },
    updateInfiniteApproval(
      state: UserState,
      action: PayloadAction<boolean>,
    ): void {
      state.infiniteApproval = action.payload
    },
    updateTransactionDeadlineSelected(
      state: UserState,
      action: PayloadAction<Deadlines>,
    ): void {
      state.transactionDeadlineSelected = action.payload
      // clear custom value when standard option selected
      if (action.payload !== Deadlines.Custom) {
        state.transactionDeadlineCustom = ""
      }
    },
    updateTransactionDeadlineCustom(
      state: UserState,
      action: PayloadAction<string>,
    ): void {
      state.transactionDeadlineCustom = action.payload
    },
    updateBorrowFilterPreferences(
      state: UserState,
      action: PayloadAction<BorrowFilterFields>,
    ): void {
      state.borrowPreferences = {
        ...state.borrowPreferences,
        filterField: action.payload,
      }
    },
    updateBorrowSortPreferences(
      state: UserState,
      action: PayloadAction<BorrowSortFields>,
    ): void {
      state.borrowPreferences = {
        ...state.borrowPreferences,
        sortField: action.payload,
      }
    },
    updateBorrowVisibleFieldPreferences(
      state: UserState,
      action: PayloadAction<{ field: BorrowSortFields; value: number }>,
    ): void {
      state.borrowPreferences = {
        ...state.borrowPreferences,
        visibleFields: {
          ...state.borrowPreferences.visibleFields,
          [action.payload.field]: action.payload.value,
        },
      }
    },
    updatePoolFilterPreferences(
      state: UserState,
      action: PayloadAction<PoolFilterFields>,
    ): void {
      state.poolPreferences = {
        ...state.poolPreferences,
        filterField: action.payload,
      }
    },
    updatePoolSortPreferences(
      state: UserState,
      action: PayloadAction<PoolSortFields>,
    ): void {
      state.poolPreferences = {
        ...state.poolPreferences,
        sortField: action.payload,
      }
    },
    updatePoolVisibleFieldPreferences(
      state: UserState,
      action: PayloadAction<{ field: PoolSortFields; value: number }>,
    ): void {
      state.poolPreferences = {
        ...state.poolPreferences,
        visibleFields: {
          ...state.poolPreferences.visibleFields,
          [action.payload.field]: action.payload.value,
        },
      }
    },
    updatePriceFromOracle(
      state: UserState,
      action: PayloadAction<boolean>,
    ): void {
      state.priceFromOracle = action.payload
    },
    addConnectedWallet(
      state: UserState,
      { payload }: PayloadAction<Required<Wallet>>,
    ) {
      state.connectedWallets[payload.address] = payload
    },
    removeConnectedWallet(
      state: UserState,
      { payload }: PayloadAction<Wallet>,
    ) {
      state.connectedWallets = Object.fromEntries(
        Object.entries(state.connectedWallets).filter(
          ([, { connectionType }]) => connectionType !== payload.connectionType,
        ),
      )
    },
    updateSelectedWallet(
      state: UserState,
      { payload }: PayloadAction<Wallet | undefined>,
    ) {
      if (payload?.address || !state.selectedWallet || !payload) {
        state.selectedWallet = payload
      } else {
        state.selectedWallet = { ...state.selectedWallet, ...payload }
      }
    },
  },
})

export const {
  updateSwapAdvancedMode,
  updatePoolAdvancedMode,
  updateDarkMode,
  updateGasPriceCustom,
  updateGasPriceSelected,
  updateSlippageCustom,
  updateSlippageSelected,
  updateInfiniteApproval,
  updateTransactionDeadlineSelected,
  updateTransactionDeadlineCustom,
  updateBorrowFilterPreferences,
  updateBorrowSortPreferences,
  updateBorrowVisibleFieldPreferences,
  updatePriceFromOracle,
  updatePoolSortPreferences,
  updatePoolFilterPreferences,
  updatePoolVisibleFieldPreferences,
  addConnectedWallet,
  removeConnectedWallet,
  updateSelectedWallet,
} = userSlice.actions

export default userSlice.reducer
