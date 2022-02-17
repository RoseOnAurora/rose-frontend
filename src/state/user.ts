import {
  NumberInputState,
  numberInputStateCreator,
} from "../utils/numberInputState"
import { PayloadAction, createSlice } from "@reduxjs/toolkit"

import { BigNumber } from "@ethersproject/bignumber"
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

export enum FarmSortFields {
  NAME = "name",
  BALANCE = "balance",
  DEPOSIT = "deposit",
  TVL = "tvl",
  APR = "apr",
  REWARD = "rewards",
}

export enum FarmFilterFields {
  DEPOSIT = "deposit",
  BALANCE = "balance",
  DUAL = "dual",
  NO_FILTER = "noFilter",
}

interface FarmPreferences {
  visibleFields: {
    [field in FarmSortFields]: number
  }
  filterField: FarmFilterFields
  sortField: FarmSortFields
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

interface UserState {
  userSwapAdvancedMode: boolean
  userPoolAdvancedMode: boolean
  userDarkMode: boolean
  gasCustom?: NumberInputState
  gasPriceSelected: GasPrices
  slippageCustom?: NumberInputState
  slippageSelected: Slippages
  infiniteApproval: boolean
  transactionDeadlineSelected: Deadlines
  transactionDeadlineCustom?: string
  farmPreferences: FarmPreferences
  borrowPreferences: BorrowPreferences
}

export const initialState: UserState = {
  userSwapAdvancedMode: false,
  userPoolAdvancedMode: false,
  userDarkMode: true,
  gasPriceSelected: GasPrices.Standard,
  slippageSelected: Slippages.OneTenth,
  infiniteApproval: false,
  transactionDeadlineSelected: Deadlines.Twenty,
  farmPreferences: {
    visibleFields: {
      name: 1,
      balance: 1,
      deposit: 1,
      tvl: 1,
      apr: 1,
      rewards: 1,
    },
    filterField: FarmFilterFields.NO_FILTER,
    sortField: FarmSortFields.APR,
  },
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
    updateFarmFilterPreferences(
      state: UserState,
      action: PayloadAction<FarmFilterFields>,
    ): void {
      state.farmPreferences = {
        ...state.farmPreferences,
        filterField: action.payload,
      }
    },
    updateFarmSortPreferences(
      state: UserState,
      action: PayloadAction<FarmSortFields>,
    ): void {
      state.farmPreferences = {
        ...state.farmPreferences,
        sortField: action.payload,
      }
    },
    updateFarmVisibleFieldPreferences(
      state: UserState,
      action: PayloadAction<{ field: FarmSortFields; value: number }>,
    ): void {
      state.farmPreferences = {
        ...state.farmPreferences,
        visibleFields: {
          ...state.farmPreferences.visibleFields,
          [action.payload.field]: action.payload.value,
        },
      }
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
  updateFarmFilterPreferences,
  updateFarmSortPreferences,
  updateFarmVisibleFieldPreferences,
  updateBorrowFilterPreferences,
  updateBorrowSortPreferences,
  updateBorrowVisibleFieldPreferences,
} = userSlice.actions

export default userSlice.reducer
