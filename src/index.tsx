/* eslint @typescript-eslint/no-unsafe-assignment: 0 */
/* eslint @typescript-eslint/no-unsafe-member-access: 0 */
import "@fontsource/dm-sans/700.css"
import "@fontsource/dm-sans/400.css"
import "@fontsource/dm-sans/500.css"
import "./i18n"

import { ChakraProvider, ColorModeScript } from "@chakra-ui/react"
import { Chart, registerables } from "chart.js"

import App from "./App"
import GasAndTokenPrices from "./components/GasAndTokenPrices"
import { Global } from "@emotion/react"
import { GlobalStyles } from "./theme/global"
import { HashRouter } from "react-router-dom"
import { Provider } from "react-redux"
import React from "react"
import ReactDOM from "react-dom/client"
import Web3ReactManager from "./components/Web3ReactManager"
import chakraTheme from "./theme/"
import store from "./state"

if (window && window.ethereum) {
  window.ethereum.autoRefreshOnNetworkChange = false // don't refresh on network changes
}

Chart.register(...registerables)

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement)

root.render(
  <React.StrictMode>
    <ColorModeScript initialColorMode={chakraTheme.config.initialColorMode} />
    <ChakraProvider theme={chakraTheme}>
      <Global styles={GlobalStyles} />
      <Provider store={store}>
        <Web3ReactManager>
          <GasAndTokenPrices>
            <HashRouter>
              <App />
            </HashRouter>
          </GasAndTokenPrices>
        </Web3ReactManager>
      </Provider>
    </ChakraProvider>
  </React.StrictMode>,
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals(sendWebVitalsToGA)
