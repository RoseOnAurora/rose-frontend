import "../styles/global.scss"
import "./NotifyStyle.scss"

import { AppDispatch, AppState } from "../state"
import {
  BLOCK_TIME,
  BORROW_MARKET_MAP,
  BorrowMarketName,
  FARMS_MAP,
  POOLS_MAP,
} from "../constants"
import React, { ReactElement, Suspense, useCallback, useEffect } from "react"
import { Route, Switch } from "react-router-dom"
import { isChainSupportedByNotify, notify } from "../utils/notifyHandler"
import { useDispatch, useSelector } from "react-redux"

// import Banner from "../components/Banner"
import Borrow from "./Borrow"
import BorrowMarkets from "./BorrowMarkets"
import BottomMenu from "../components/BottomMenu"
import Deposit from "./Deposit"
import Farm from "./Farm"
import Farms from "./Farms"
import PendingSwapsProvider from "../providers/PendingSwapsProvider"
import Pools from "./Pools"
import Stake from "./Stake"
import Swap from "./Swap"
import Web3ReactManager from "../components/Web3ReactManager"
import Withdraw from "./Withdraw"
import fetchFarmStats from "../utils/fetchFarmStats"
import fetchGasPrices from "../utils/updateGasPrices"
import fetchRosePriceHistory from "../utils/fetchRosePriceHistory"
import fetchStakeStats from "../utils/fetchStakeStats"
import fetchSwapStats from "../utils/getSwapStats"
import fetchTokenPricesUSD from "../utils/updateTokenPrices"
import { useActiveWeb3React } from "../hooks"
import usePoller from "../hooks/usePoller"

export default function App(): ReactElement {
  const { chainId } = useActiveWeb3React()
  const { userDarkMode } = useSelector((state: AppState) => state.user)
  // const bannerBg = userDarkMode ? "#d2f1e4" : "#a2d2ff"

  useEffect(() => {
    notify?.config({
      networkId: isChainSupportedByNotify(chainId) ? chainId : undefined,
      darkMode: userDarkMode,
    })
  }, [chainId, userDarkMode])
  return (
    <Suspense fallback={null}>
      <Web3ReactManager>
        <GasAndTokenPrices>
          <PendingSwapsProvider>
            {/* <Banner
              variant="solid"
              color="black"
              bg={bannerBg}
              bannerTitle=""
              bannerMessage=""
              status="info"
              position="sticky"
              top="0"
              zIndex="3"
              border="none"
              boxShadow="2px 2px 12px rgba(68, 64, 64, 0.14)"
            /> */}
            <Switch>
              <Route exact path="/" component={Swap} />
              <Route exact path="/pools" component={Pools} />
              <Route exact path="/farms" component={Farms} />
              <Route exact path="/stake" component={Stake} />
              <Route exact path="/borrow" component={BorrowMarkets} />
              {Object.values(POOLS_MAP).map(({ name, route }) => (
                <Route
                  exact
                  path={`/pools/${route}/deposit`}
                  render={(props) => <Deposit {...props} poolName={name} />}
                  key={`${name}-deposit`}
                />
              ))}
              {Object.values(POOLS_MAP).map(({ name, route }) => (
                <Route
                  exact
                  path={`/pools/${route}/withdraw`}
                  render={(props) => <Withdraw {...props} poolName={name} />}
                  key={`${name}-withdraw`}
                />
              ))}
              {Object.values(FARMS_MAP).map(({ name, route }) => (
                <Route
                  exact
                  path={`/farms/${route}`}
                  render={(props) => <Farm {...props} farmName={name} />}
                  key={`${name}-farm`}
                ></Route>
              ))}
              {Object.entries(BORROW_MARKET_MAP).map(([key, { route }]) => (
                <Route
                  exact
                  path={`/borrow/${route}`}
                  render={(props) => (
                    <Borrow {...props} borrowName={key as BorrowMarketName} />
                  )}
                  key={`${key}-borrow`}
                ></Route>
              ))}
            </Switch>
            <BottomMenu />
          </PendingSwapsProvider>
        </GasAndTokenPrices>
      </Web3ReactManager>
    </Suspense>
  )
}

function GasAndTokenPrices({
  children,
}: React.PropsWithChildren<unknown>): ReactElement {
  const dispatch = useDispatch<AppDispatch>()
  const { chainId, library } = useActiveWeb3React()

  const fetchAndUpdateGasPrice = useCallback(() => {
    void fetchGasPrices(dispatch)
  }, [dispatch])
  const fetchAndUpdateTokensPrice = useCallback(() => {
    fetchTokenPricesUSD(dispatch, chainId, library)
  }, [dispatch, chainId, library])
  const fetchAndUpdateSwapStats = useCallback(() => {
    void fetchSwapStats(dispatch)
  }, [dispatch])
  const fetchAndUpdateFarmStats = useCallback(() => {
    void fetchFarmStats(dispatch)
  }, [dispatch])
  const fetchAndUpdateStakeStats = useCallback(() => {
    void fetchStakeStats(dispatch)
  }, [dispatch])
  const fetchAndUpdateRosePriceHistory = useCallback(() => {
    void fetchRosePriceHistory(dispatch)
  }, [dispatch])
  usePoller(fetchAndUpdateGasPrice, BLOCK_TIME * 280)
  usePoller(fetchAndUpdateTokensPrice, BLOCK_TIME * 3)
  usePoller(fetchAndUpdateSwapStats, BLOCK_TIME * 280) // ~ 1hr
  usePoller(fetchAndUpdateFarmStats, BLOCK_TIME * 70) // ~ 15min
  usePoller(fetchAndUpdateStakeStats, BLOCK_TIME * 70)
  usePoller(fetchAndUpdateRosePriceHistory, BLOCK_TIME * 70)
  return <>{children}</>
}
