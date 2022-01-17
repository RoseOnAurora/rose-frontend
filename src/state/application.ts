import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { FarmStats } from "../utils/fetchFarmStats"
import { StakeStats } from "../utils/fetchStakeStats"
import { SwapStatsReponse } from "../utils/getSwapStats"
import { TRANSACTION_TYPES } from "../constants"

interface GasPrices {
  gasStandard?: number
  gasFast?: number
  gasInstant?: number
}
interface SwapStats {
  [swapAddress: string]: {
    oneDayVolume: string
    apy: string
    tvl: string
    utilization: string
  }
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

type ApplicationState = GasPrices & { tokenPricesUSD?: TokenPricesUSD } & {
  lastTransactionTimes: LastTransactionTimes
} & { swapStats?: SwapStats } & { farmStats?: UpdatedFarmStats } & {
  stakeStats?: StakeStats
}

const initialState: ApplicationState = {
  lastTransactionTimes: {
    [TRANSACTION_TYPES.STAKE]: 0,
    [TRANSACTION_TYPES.DEPOSIT]: 0,
    [TRANSACTION_TYPES.WITHDRAW]: 0,
    [TRANSACTION_TYPES.SWAP]: 0,
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
    updateSwapStats(state, action: PayloadAction<SwapStatsReponse>): void {
      const formattedPayload = Object.keys(action.payload).reduce(
        (acc, key) => {
          const { APY, TVL, oneDayVolume: ODV } = action.payload[key]
          if (isNaN(APY) || isNaN(TVL) || isNaN(ODV)) {
            return acc
          }
          const apy = APY.toFixed(18)
          const tvl = TVL.toFixed(18)
          const oneDayVolume = ODV.toFixed(18)
          const utilization = (TVL > 0 ? ODV / TVL : 0).toFixed(18)
          return {
            ...acc,
            [key]: {
              apy,
              tvl,
              oneDayVolume,
              utilization,
            },
          }
        },
        {},
      )
      state.swapStats = formattedPayload
    },
  },
})

export const {
  updateGasPrices,
  updateTokensPricesUSD,
  updateLastTransactionTimes,
  updateSwapStats,
  updateFarmStats,
  updateStakeStats,
} = applicationSlice.actions

export default applicationSlice.reducer
