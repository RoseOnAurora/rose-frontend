import "../styles/global.scss"
import "./NotifyStyle.scss"

import { AppDispatch, AppState } from "../state"
import { BLOCK_TIME, POOLS_MAP } from "../constants"
import React, { ReactElement, Suspense, useCallback, useEffect } from "react"
import { Redirect, Route, Switch } from "react-router-dom"
import { isChainSupportedByNotify, notify } from "../utils/notifyHandler"
import { useDispatch, useSelector } from "react-redux"

import Banner from "../components/Banner"
import BottomMenu from "../components/BottomMenu"
import Deposit from "./Deposit"
import Farm from "./Farm"
import PendingSwapsProvider from "../providers/PendingSwapsProvider"
import Pools from "./Pools"
import Stake from "./Stake"
import Swap from "./Swap"
import Web3ReactManager from "../components/Web3ReactManager"
import Withdraw from "./Withdraw"
import fetchSwapStats from "../utils/getSwapStats"
import fetchTokenPricesUSD from "../utils/updateTokenPrices"
import { useActiveWeb3React } from "../hooks"
import usePoller from "../hooks/usePoller"

export default function App(): ReactElement {
  const { chainId } = useActiveWeb3React()
  const { userDarkMode } = useSelector((state: AppState) => state.user)
  const bannerBg = userDarkMode ? "#d2f1e4" : "#a2d2ff"

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
            <Banner
              variant="solid"
              color="black"
              bg={bannerBg}
              bannerTitle="IDO on NearPad’s launchpad soon!"
              bannerMessage="ROSE/stROSE tokens are launching soon to provide rewards to liquidity providers and distribute protocol fees."
              status="info"
              position="sticky"
              top="0"
              zIndex="3"
              border="none"
              boxShadow="2px 2px 12px rgba(68, 64, 64, 0.14)"
            />
            <Switch>
              <Route exact path="/" component={Swap} />
              <Route exact path="/pools" component={Pools} />
              <Route exact path="/stake" component={Stake} />
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
              {Object.values(POOLS_MAP).map(({ name, route }) => (
                <Route
                  exact
                  path={`/pools/${route}/farm`}
                  render={(props) => <Farm {...props} poolName={name} />}
                  key={`${name}-farm`}
                >
                  {/* redirect to main page for now if user lands on page somehow */}
                  <Redirect to="/" />
                </Route>
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

  // const fetchAndUpdateGasPrice = useCallback(() => {
  //   void fetchGasPrices(dispatch)
  // }, [dispatch])
  const fetchAndUpdateTokensPrice = useCallback(() => {
    fetchTokenPricesUSD(dispatch, chainId, library)
  }, [dispatch, chainId, library])
  const fetchAndUpdateSwapStats = useCallback(() => {
    void fetchSwapStats(dispatch)
  }, [dispatch])
  // usePoller(fetchAndUpdateGasPrice, 5 * 1000)
  usePoller(fetchAndUpdateTokensPrice, BLOCK_TIME * 3)
  usePoller(fetchAndUpdateSwapStats, BLOCK_TIME * 280) // ~ 1hr
  return <>{children}</>
}
