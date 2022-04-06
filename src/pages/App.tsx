import "../styles/global.scss"
import "./NotifyStyle.scss"

import { AppDispatch, AppState } from "../state"
import {
  BLOCK_TIME,
  BORROW_MARKET_MAP,
  FARMS_MAP,
  POOLS_MAP,
} from "../constants"
import React, { ReactElement, Suspense, useCallback, useEffect } from "react"
import { Route, Switch } from "react-router-dom"
import { isChainSupportedByNotify, notify } from "../utils/notifyHandler"
import { useDispatch, useSelector } from "react-redux"
import Borrow from "./Borrow"
import BorrowCountdownLanding from "../components/BorrowCountdownLanding"
import BorrowMarkets from "./BorrowMarkets"
import Farm from "./Farm"
import Farms from "./Farms"
import Pool from "./Pool"
import Pools from "./Pools"
import Stake from "./Stake"
import Swap from "./Swap"
import Web3ReactManager from "../components/Web3ReactManager"
import fetchFarmStats from "../utils/fetchFarmStats"
import fetchGasPrices from "../utils/updateGasPrices"
import fetchRosePriceHistory from "../utils/fetchRosePriceHistory"
import fetchStakeStats from "../utils/fetchStakeStats"
import fetchSwapStats from "../utils/getSwapStats"
import fetchTokenPricesUSD from "../utils/updateTokenPrices"
import { useActiveWeb3React } from "../hooks"
import useCountDown from "react-countdown-hook"
import usePoller from "../hooks/usePoller"

export default function App(): ReactElement {
  const { chainId } = useActiveWeb3React()
  const { userDarkMode } = useSelector((state: AppState) => state.user)
  const [timeLeft, actions] = useCountDown(Date.now() + 1000 - Date.now(), 1000)
  // new Date(1649136437000).getTime() - Date.now()
  useEffect(() => {
    actions.start()
  }, [actions])

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
          <Switch>
            <Route exact path="/" component={Swap} />
            <Route exact path="/pools" component={Pools} />
            <Route exact path="/farms" component={Farms} />
            <Route exact path="/stake" component={Stake} />
            <Route
              exact
              path="/borrow"
              render={() =>
                timeLeft ? (
                  <BorrowCountdownLanding timeLeft={timeLeft} />
                ) : (
                  <BorrowMarkets />
                )
              }
            />
            {Object.values(POOLS_MAP).map(({ name, route }) => (
              <Route
                exact
                path={`/pools/${route}`}
                render={(props) => <Pool {...props} poolName={name} />}
                key={`${name}-pool`}
              />
            ))}
            {Object.values(FARMS_MAP).map(({ name, route }) => (
              <Route
                exact
                path={`/farms/${route}`}
                render={(props) => <Farm {...props} farmName={name} />}
                key={`${name}-farm`}
              />
            ))}
            {Object.values(BORROW_MARKET_MAP).map(
              ({ name, route, isStable }) => (
                <Route
                  exact
                  path={`/borrow/${route}`}
                  render={(props) =>
                    timeLeft ? (
                      <BorrowCountdownLanding timeLeft={timeLeft} />
                    ) : (
                      <Borrow
                        {...props}
                        borrowName={name}
                        isStable={isStable}
                      />
                    )
                  }
                  key={`${name}-borrow`}
                />
              ),
            )}
          </Switch>
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
