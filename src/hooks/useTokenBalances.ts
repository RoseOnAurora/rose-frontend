import {
  BLOCK_TIME,
  ChainId,
  ROSE_TOKENS_MAP,
  TOKENS_MAP,
  TokensMap,
} from "../constants"
import { Contract, Provider } from "ethcall"
import { MulticallContract, MulticallProvider } from "../types/ethcall"

import { BigNumber } from "@ethersproject/bignumber"
import ERC20_ABI from "../constants/abis/erc20.json"
import { Erc20 } from "../../types/ethers-contracts/Erc20"
import usePoller from "./usePoller"
import { useState } from "react"
import { useWeb3React } from "@web3-react/core"

const useTokenBalancesHelper = (
  tokenMap: TokensMap,
): { [token: string]: BigNumber } | null => {
  const { account, chainId, provider } = useWeb3React()
  const [balances, setBalances] = useState<{ [token: string]: BigNumber }>({})

  const ethcallProvider = new Provider() as MulticallProvider

  usePoller((): void => {
    async function pollBalances(): Promise<void> {
      if (!provider || !chainId || !account) return

      await ethcallProvider.init(provider)
      switch (chainId) {
        case ChainId.AURORA_TESTNET:
          ethcallProvider.multicallAddress =
            "0x508B1508AAd923fB24F6d13cD74Ac640fD8B66E8"
          break
        case ChainId.AURORA_MAINNET:
          ethcallProvider.multicallAddress =
            "0x49eb1F160e167aa7bA96BdD88B6C1f2ffda5212A"
          break
        case ChainId.MUMBAI:
          ethcallProvider.multicallAddress =
            "0x08411ADd0b5AA8ee47563b146743C13b3556c9Cc"
      }

      const tokens = Object.values(tokenMap).filter(
        (t) => !!t.addresses[chainId as ChainId],
      )
      const balanceCalls = tokens
        .map((t) => {
          return new Contract(
            t.addresses[chainId as ChainId],
            ERC20_ABI,
          ) as MulticallContract<Erc20>
        })
        .map((c) => c.balanceOf(account))
      try {
        const balances = await ethcallProvider.all(balanceCalls, "latest")
        const ethBalance = await provider.getBalance(account)
        setBalances(
          tokens.reduce(
            (acc, t, i) => ({
              ...acc,
              [t.symbol]: balances[i],
            }),
            { ETH: ethBalance },
          ),
        )
      } catch (e) {
        console.error(e)
      }
    }
    if (account) {
      void pollBalances()
    }
  }, BLOCK_TIME)

  return balances
}

export function usePoolTokenBalances(): { [token: string]: BigNumber } | null {
  return useTokenBalancesHelper(TOKENS_MAP)
}

export function useRoseTokenBalances(): { [token: string]: BigNumber } | null {
  return useTokenBalancesHelper(ROSE_TOKENS_MAP)
}
