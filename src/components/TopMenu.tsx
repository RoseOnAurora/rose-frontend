import "./TopMenu.scss"

import {
  Menu,
  MenuButton,
  MenuGroup,
  MenuItem,
  MenuList,
} from "@chakra-ui/react"
import { ROSE, SROSE } from "../constants"
import React, { ReactElement } from "react"

import { FaCog } from "react-icons/fa"
import { Link } from "react-router-dom"
import ThemeChanger from "./ThemeChanger"
import ToolTip from "./ToolTip"
import Web3Status from "./Web3Status"
import classNames from "classnames"
import useAddTokenToMetamask from "../hooks/useAddTokenToMetamask"
import { useTranslation } from "react-i18next"

interface Props {
  activeTab: string
}

function TopMenu({ activeTab }: Props): ReactElement {
  const { t } = useTranslation()
  const addRoseToken = useAddTokenToMetamask(ROSE)
  const addStRoseToken = useAddTokenToMetamask(SROSE)

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
                activeTab === "withdraw",
            })}
          >
            {t("pools")}
          </Link>
        </li>
        <li>
          <Link
            to="/farms"
            className={classNames({
              active: activeTab === "farms" || activeTab === "farm",
            })}
          >
            {t("farms")}
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
        <li>
          <Menu>
            <MenuButton>
              <Link to="#">Bridge↗</Link>
            </MenuButton>
            <MenuList>
              <MenuGroup>
                <MenuItem>
                  <a
                    href="https://rainbowbridge.app/transfer"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Rainbow Bridge↗
                  </a>
                </MenuItem>
                <MenuItem>
                  <a
                    href="https://app.allbridge.io/bridge"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Allbridge↗
                  </a>
                </MenuItem>
              </MenuGroup>
            </MenuList>
          </Menu>
        </li>
      </ul>
      <Web3Status />
      <Menu>
        <MenuButton className="addToken">
          <FaCog />
        </MenuButton>
        <MenuList>
          <MenuGroup title="ADD TOKEN TO WALLET">
            <MenuItem
              onClick={async () => {
                await addRoseToken()
              }}
            >
              ROSE🌹
            </MenuItem>
            <MenuItem onClick={async () => await addStRoseToken()}>
              stROSE🌷
            </MenuItem>
          </MenuGroup>
        </MenuList>
      </Menu>
      <ThemeChanger />
    </header>
  )
}

export default TopMenu
