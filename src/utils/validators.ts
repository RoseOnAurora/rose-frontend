import { BigNumber } from "@ethersproject/bignumber"
import { Zero } from "@ethersproject/constants"
import i18next from "i18next"
import parseStringToBigNumber from "./parseStringToBigNumber"

export const basicTokenInputValidator = (
  amount: string,
  decimals: number | undefined,
  max: BigNumber,
): string | undefined => {
  const { value, isFallback } = parseStringToBigNumber(
    amount,
    decimals || 18,
    Zero,
  )

  if (!amount) return

  if (isFallback || value.lt(Zero)) {
    return i18next.t("Invalid number.")
  }

  if (value.lte(Zero)) return i18next.t("Must be greater than zero.")

  if (value.gt(max)) return i18next.t("insufficientBalance")
}
