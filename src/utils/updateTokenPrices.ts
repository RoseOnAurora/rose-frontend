import { AppDispatch } from "../state"
import { TOKENS_MAP } from "../constants"
import retry from "async-retry"
import { updateTokensPricesUSD } from "../state/application"

const coinGeckoAPI = "https://api.coingecko.com/api/v3/simple/price"
const rosePriceApi =
  "https://raw.githubusercontent.com/RoseOnAurora/apr/master/rose.json"

interface CoinGeckoReponse {
  [tokenSymbol: string]: {
    usd: number
  }
}

interface RosePriceResponse {
  [tokenSymbol: string]: string
}
const otherTokens = {
  ETH: "ethereum",
  WETH: "ethereum",
  BTC: "bitcoin",
  ROSE: "rose",
}

export default function fetchTokenPricesUSD(dispatch: AppDispatch): void {
  const tokens = Object.values(TOKENS_MAP)
  const tokenIds = Array.from(
    new Set(
      tokens.map(({ geckoId }) => geckoId).concat(Object.values(otherTokens)),
    ),
  )
  void retry(
    () =>
      fetch(`${coinGeckoAPI}?ids=${encodeURIComponent(
        tokenIds.join(","),
      )}&vs_currencies=usd
    `)
        .then((res) => res.json())
        .then((body: CoinGeckoReponse) => {
          const otherTokensResult = Object.keys(otherTokens).reduce(
            (acc, key) => {
              return {
                ...acc,
                [key]: body?.[otherTokens[key as keyof typeof otherTokens]].usd,
              }
            },
            {} as { [symbol: string]: number },
          )
          let result = tokens.reduce((acc, token) => {
            return { ...acc, [token.symbol]: body?.[token.geckoId]?.usd }
          }, otherTokensResult)

          void fetch(rosePriceApi)
            .then((res) => res.json())
            .then((body: RosePriceResponse[]) => {
              result = {
                ...result,
                stROSE: +body[0].price_of_strose || 0,
              }
              dispatch(updateTokensPricesUSD(result))
            })
        }),
    { retries: 3 },
  )
}
