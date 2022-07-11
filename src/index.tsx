/* eslint @typescript-eslint/no-unsafe-assignment: 0 */
/* eslint @typescript-eslint/no-unsafe-member-access: 0 */
import "./index.css"
import "@fontsource/dm-sans/700.css"
import "@fontsource/dm-sans/400.css"
import "@fontsource/dm-sans/500.css"
import "./i18n"

import { ChakraProvider, ColorModeScript } from "@chakra-ui/react"
import { Chart, registerables } from "chart.js"
import React, { Suspense } from "react"
import { Web3ReactProvider, createWeb3ReactRoot } from "@web3-react/core"

import AppRoutes from "./routes"
import GasAndTokenPrices from "./components/GasAndTokenPrices"
import { NetworkContextName } from "./constants"
import { Provider } from "react-redux"
import ReactDOM from "react-dom/client"
import Web3ReactManager from "./components/Web3ReactManager"
import chakraTheme from "./theme/"
import getLibrary from "./utils/getLibrary"
import { getNetworkLibrary } from "./connectors"
import store from "./state"

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName)

if (window && window.ethereum) {
  window.ethereum.autoRefreshOnNetworkChange = false
}

Chart.register(...registerables)

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement)

root.render(
  <>
    <ColorModeScript initialColorMode={chakraTheme.config.initialColorMode} />
    <React.StrictMode>
      <ChakraProvider theme={chakraTheme}>
        <Web3ReactProvider getLibrary={getLibrary}>
          <Web3ProviderNetwork getLibrary={getNetworkLibrary}>
            <Provider store={store}>
              <Suspense fallback={null}>
                <Web3ReactManager>
                  <GasAndTokenPrices>
                    <AppRoutes />
                  </GasAndTokenPrices>
                </Web3ReactManager>
              </Suspense>
            </Provider>
          </Web3ProviderNetwork>
        </Web3ReactProvider>
      </ChakraProvider>
    </React.StrictMode>
  </>,
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals(sendWebVitalsToGA)
