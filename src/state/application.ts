import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { FarmStats } from "../utils/fetchFarmStats"
import { StakeStats } from "../utils/fetchStakeStats"
import { TRANSACTION_TYPES } from "../constants"

interface GasPrices {
  gasStandard?: number
  gasFast?: number
  gasInstant?: number
}

export interface TokenPricesUSD {
  [tokenSymbol: string]: number
}
interface LastTransactionTimes {
  [transactionType: string]: number
}

interface UpdatedFarmStats {
  [farmName: string]: FarmStats
}

interface RosePriceHistory {
  time: number
  price: number
}

type ApplicationState = GasPrices & { tokenPricesUSD?: TokenPricesUSD } & {
  lastTransactionTimes: LastTransactionTimes
} & { farmStats?: UpdatedFarmStats } & {
  stakeStats?: StakeStats
} & { rosePriceHistory?: RosePriceHistory[] }

const initialState: ApplicationState = {
  lastTransactionTimes: {
    [TRANSACTION_TYPES.STAKE]: 0,
    [TRANSACTION_TYPES.DEPOSIT]: 0,
    [TRANSACTION_TYPES.WITHDRAW]: 0,
    [TRANSACTION_TYPES.SWAP]: 0,
    [TRANSACTION_TYPES.BORROW]: 0,
    [TRANSACTION_TYPES.ROSE_PRICE]: 0,
    [TRANSACTION_TYPES.MIGRATE]: 0,
  },
}

const applicationSlice = createSlice({
  name: "application",
  initialState,
  reducers: {
    updateGasPrices(state, action: PayloadAction<GasPrices>): void {
      const { gasStandard, gasFast, gasInstant } = action.payload
      state.gasStandard = gasStandard
      state.gasFast = gasFast
      state.gasInstant = gasInstant
    },
    updateFarmStats(state, action: PayloadAction<UpdatedFarmStats>): void {
      state.farmStats = {
        ...state.farmStats,
        ...action.payload,
      }
    },
    updateStakeStats(state, action: PayloadAction<StakeStats>): void {
      state.stakeStats = {
        ...state.stakeStats,
        ...action.payload,
      }
    },
    updateRosePriceHistory(
      state,
      action: PayloadAction<RosePriceHistory[]>,
    ): void {
      state.rosePriceHistory = action.payload
    },
    updateTokensPricesUSD(state, action: PayloadAction<TokenPricesUSD>): void {
      state.tokenPricesUSD = action.payload
    },
    updateLastTransactionTimes(
      state,
      action: PayloadAction<LastTransactionTimes>,
    ): void {
      state.lastTransactionTimes = {
        ...state.lastTransactionTimes,
        ...action.payload,
      }
    },
  },
})

export const {
  updateGasPrices,
  updateTokensPricesUSD,
  updateLastTransactionTimes,
  updateFarmStats,
  updateStakeStats,
  updateRosePriceHistory,
} = applicationSlice.actions

export default applicationSlice.reducer
