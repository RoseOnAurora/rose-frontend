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
  APR = "apr",
  NAME = "name",
  TVL = "tvl",
  DUAL = "dual",
  DEPOSIT = "deposit",
  BALANCE = "balance",
}

export enum FarmFilterFields {
  DEPOSIT = "deposit",
  BALANCE = "balance",
  DUAL = "dual",
  NO_FILTER = "noFilter",
}

interface FarmPreferences {
  showRewards: number
  farmFilterField: FarmFilterFields
  farmSortField: FarmSortFields
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
    showRewards: 1,
    farmFilterField: FarmFilterFields.NO_FILTER,
    farmSortField: FarmSortFields.APR,
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
        farmFilterField: action.payload,
      }
    },
    updateFarmSortPreferences(
      state: UserState,
      action: PayloadAction<FarmSortFields>,
    ): void {
      state.farmPreferences = {
        ...state.farmPreferences,
        farmSortField: action.payload,
      }
    },
    updateFarmRewardsPreferences(
      state: UserState,
      action: PayloadAction<number>,
    ): void {
      state.farmPreferences = {
        ...state.farmPreferences,
        showRewards: action.payload,
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
  updateFarmRewardsPreferences,
} = userSlice.actions

export default userSlice.reducer
