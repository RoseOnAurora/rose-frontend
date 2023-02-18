import { BORROW_MARKET_MAP, POOLS_MAP } from "./constants"
import { HashRouter, Navigate, Outlet, Route, Routes } from "react-router-dom"
import React, { ReactElement } from "react"
import Borrow from "./pages/Borrow"
import BorrowMarkets from "./pages/BorrowMarkets"
import Layout from "./pages/Layout"
import Pool from "./pages/Pool"
import Pools from "./pages/Pools"
import Stake from "./pages/Stake"
import Swap from "./pages/Swap"

export default function App(): ReactElement {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Swap />} />
          <Route path="stake" element={<Stake />} />
          <Route
            path="pools"
            element={
              <>
                <Outlet />
              </>
            }
          >
            <Route index element={<Pools />} />
            {Object.values(POOLS_MAP).map(({ name, route }) => (
              <Route
                path={route}
                element={<Pool poolName={name} />}
                key={`${name}-pool`}
              />
            ))}
          </Route>
          <Route
            path="borrow"
            element={
              <>
                <Outlet />
              </>
            }
          >
            <Route index element={<BorrowMarkets />} />
            {Object.values(BORROW_MARKET_MAP).map(
              ({ name, route, isStable }) => (
                <Route
                  path={route}
                  element={<Borrow borrowName={name} isStable={isStable} />}
                  key={`${name}-borrow`}
                />
              ),
            )}
          </Route>
          <Route path="swap" element={<Navigate to="/" />} />
          {/* TO-DO: add error route handling */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
