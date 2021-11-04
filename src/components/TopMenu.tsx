import "./TopMenu.scss"

import React, { ReactElement } from "react"

import { Link } from "react-router-dom"
import ThemeChanger from "./ThemeChanger"
import ToolTip from "./ToolTip"
import Web3Status from "./Web3Status"
import classNames from "classnames"
import { useTranslation } from "react-i18next"

interface Props {
  activeTab: string
}

function TopMenu({ activeTab }: Props): ReactElement {
  const { t } = useTranslation()

  return (
    <header className="top">
      <h1>
        <Link to="/">Rose</Link>
      </h1>

      <ul className="nav">
        <li>
          <Link to="/" className={classNames({ active: activeTab === "swap" })}>
            {t("swap")}
          </Link>
        </li>
        <li>
          <Link
            to="/pools"
            className={classNames({
              active:
                activeTab === "pools" ||
                activeTab === "deposit" ||
                activeTab === "withdraw" ||
                activeTab === "farm",
            })}
          >
            {t("pools")}
          </Link>
        </li>
        <li>
          <Link
            to="/stake"
            className={classNames({
              active: activeTab === "stake",
              // add additional checks here in case stake will require subpages
            })}
          >
            {t("stake")}
          </Link>
        </li>
        <li>
          <ToolTip content={t("underconstruction")}>
            <Link
              to="#"
              className={classNames({
                active: activeTab === "borrow",
              })}
            >
              <span className="disabled">{t("borrow")}</span>
            </Link>
          </ToolTip>
        </li>
      </ul>
      <Web3Status />
      <ThemeChanger />
    </header>
  )
}

export default TopMenu
