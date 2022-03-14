import { Input, InputGroup, InputRightElement, Tooltip } from "@chakra-ui/react"
import React, { ReactElement } from "react"
import {
  updateInfiniteApproval,
  updateSlippageCustom,
  updateSlippageSelected,
} from "../state/user"
import { useDispatch, useSelector } from "react-redux"

import { AppDispatch } from "../state"
import { AppState } from "../state/index"
import CheckboxInput from "./CheckboxInput"
import { PayloadAction } from "@reduxjs/toolkit"
import { Slippages } from "../state/user"
import classNames from "classnames"
import styles from "./AdvancedOptions.module.scss"
import { useTranslation } from "react-i18next"

export default function AdvancedOptions(): ReactElement {
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const { infiniteApproval, slippageCustom, slippageSelected } = useSelector(
    (state: AppState) => state.user,
  )

  return (
    <div className={styles.advancedOptions}>
      <div className={styles.parameter}>
        <div className={styles.infiniteApproval} style={{ zIndex: 3 }}>
          <CheckboxInput
            checked={infiniteApproval}
            onChange={(): PayloadAction<boolean> =>
              dispatch(updateInfiniteApproval(!infiniteApproval))
            }
          />
          <Tooltip
            bgColor="#cc3a59"
            closeOnClick={false}
            label={t("infiniteApprovalTooltip")}
          >
            <span className={styles.label}>{t("infiniteApproval")}</span>
          </Tooltip>
        </div>
      </div>
      <div className={styles.parameter}>
        <div className={styles.inputGroup}>
          <div className={styles.options}>
            <div className={styles.label}>{t("maxSlippage")}: </div>
            <button
              className={classNames({
                [styles.selected]: slippageSelected === Slippages.OneTenth,
              })}
              onClick={(): PayloadAction<Slippages> =>
                dispatch(updateSlippageSelected(Slippages.OneTenth))
              }
            >
              <span>0.1%</span>
            </button>
            <button
              className={classNames({
                [styles.selected]: slippageSelected === Slippages.One,
              })}
              onClick={(): PayloadAction<Slippages> =>
                dispatch(updateSlippageSelected(Slippages.One))
              }
            >
              <span>1%</span>
            </button>
            <div style={{ display: "flex", alignItems: "center" }}>
              <InputGroup marginLeft="5px" width="90px">
                <Input
                  value={slippageCustom?.valueRaw}
                  type="text"
                  variant="outline"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                    const value = e.target.value
                    if (value && !isNaN(+value)) {
                      dispatch(updateSlippageCustom(value))
                      if (slippageSelected !== Slippages.Custom) {
                        dispatch(updateSlippageSelected(Slippages.Custom))
                      }
                    } else {
                      dispatch(updateSlippageSelected(Slippages.OneTenth))
                    }
                  }}
                />
                <InputRightElement width="2rem">%</InputRightElement>
              </InputGroup>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
