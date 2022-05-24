import "./TopMenu.scss"

import {
  Box,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList,
  useColorModeValue,
} from "@chakra-ui/react"
import {
  BsArrowLeftRight,
  BsMedium,
  BsRainbow,
  BsReceipt,
} from "react-icons/bs"
import { CloseIcon, HamburgerIcon } from "@chakra-ui/icons"
import {
  FaBook,
  FaChartPie,
  FaDiscord,
  FaGift,
  FaGithub,
  FaHandHoldingUsd,
  FaRegCircle,
  FaTelegram,
  FaTwitter,
} from "react-icons/fa"
import React, { ReactElement } from "react"
import { Link } from "react-router-dom"
import RosePriceButton from "./RosePriceButton"
import ThemeChanger from "./ThemeChanger"
import Web3Status from "./Web3Status"
import classNames from "classnames"
import { useTranslation } from "react-i18next"

interface Props {
  activeTab: string
}

function TopMenu({ activeTab }: Props): ReactElement {
  const { t } = useTranslation()
  const menuColor = useColorModeValue("#fff", "rgb(28, 29, 33)")

  return (
    <header className="top">
      <h1>
        <Link to="/">Rose</Link>
      </h1>
      <div style={{ zIndex: 3, display: "flex" }}>
        <Menu>
          {({ isOpen }) => (
            <>
              <MenuButton
                isActive={isOpen}
                as={IconButton}
                aria-label="Open Menu"
                display={{ lg: "none" }}
                variant="outline"
                lineHeight="unset"
              >
                {isOpen ? <CloseIcon /> : <HamburgerIcon />}
              </MenuButton>
              <MenuList bg={menuColor}>
                <MenuGroup title="Pages">
                  <MenuItem
                    icon={<BsArrowLeftRight />}
                    as={Link}
                    to="/"
                    margin="0"
                  >
                    {t("swap")}
                  </MenuItem>
                  <MenuItem
                    icon={<FaChartPie />}
                    as={Link}
                    to="/pools"
                    margin="0"
                  >
                    {t("pools")}
                  </MenuItem>
                  <MenuItem icon={<FaGift />} as={Link} to="/farms" margin="0">
                    {t("farms")}
                  </MenuItem>
                  <MenuItem
                    icon={<BsReceipt />}
                    as={Link}
                    to="/stake"
                    margin="0"
                  >
                    {t("stake")}
                  </MenuItem>
                  <MenuItem
                    icon={<FaHandHoldingUsd />}
                    as={Link}
                    to="/borrow"
                    margin="0"
                  >
                    {t("borrow")}
                  </MenuItem>
                </MenuGroup>
                <MenuDivider />
                <MenuGroup title="Bridges">
                  <MenuItem
                    icon={<BsRainbow />}
                    href="https://rainbowbridge.app/transfer"
                    as="a"
                    margin="0"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Rainbow Bridge↗
                  </MenuItem>
                  <MenuItem
                    icon={<FaRegCircle />}
                    href="https://app.allbridge.io/bridge"
                    as="a"
                    margin="0"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Allbridge↗
                  </MenuItem>
                </MenuGroup>
                <MenuDivider />
                <MenuGroup title="Socials">
                  <MenuItem
                    icon={<FaTwitter />}
                    href="https://twitter.com/roseonaurora"
                    as="a"
                    margin="0"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Twitter↗
                  </MenuItem>
                  <MenuItem
                    icon={<BsMedium />}
                    href="https://medium.com/@roseonaurora"
                    as="a"
                    margin="0"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Medium↗
                  </MenuItem>
                  <MenuItem
                    icon={<FaTelegram />}
                    href="https://t.me/RoseOnAurora"
                    as="a"
                    margin="0"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Telegram↗
                  </MenuItem>
                  <MenuItem
                    icon={<FaDiscord />}
                    href="https://discord.gg/dG6mWH4rHj"
                    as="a"
                    margin="0"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Discord↗
                  </MenuItem>
                </MenuGroup>
                <MenuDivider />
                <MenuGroup title="Documentation">
                  <MenuItem
                    icon={<FaGithub />}
                    href="https://github.com/RoseOnAurora"
                    as="a"
                    margin="0"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Github↗
                  </MenuItem>
                  <MenuItem
                    icon={<FaBook />}
                    href="https://docs.rose.fi"
                    as="a"
                    margin="0"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Gitbook Docs↗
                  </MenuItem>
                </MenuGroup>
              </MenuList>
            </>
          )}
        </Menu>
        <Box display={{ lg: "none" }}>
          <ThemeChanger />
        </Box>
      </div>
      <ul className="nav">
        <li>
          <Link to="/" className={classNames({ active: activeTab === "/" })}>
            {t("swap")}
          </Link>
        </li>
        <li>
          <Link
            to="/pools"
            className={classNames({
              active: /pools*/.test(activeTab),
            })}
          >
            {t("pools")}
          </Link>
        </li>
        <li>
          <Link
            to="/farms"
            className={classNames({
              active: /farms*/.test(activeTab),
            })}
          >
            {t("farms")}
          </Link>
        </li>
        <li>
          <Link
            to="/stake"
            className={classNames({
              active: activeTab === "/stake",
            })}
          >
            {t("stake")}
          </Link>
        </li>
        <li>
          <Link
            to="/borrow"
            className={classNames({
              active: /borrow*/.test(activeTab),
            })}
          >
            {t("borrow")}
          </Link>
        </li>
        <li>
          <Menu>
            <MenuButton>
              <Link to="#">Bridge↗</Link>
            </MenuButton>
            <MenuList bg={useColorModeValue("#fff", "rgb(28, 29, 33)")}>
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
      <div className="topMenuBar">
        <RosePriceButton />
        <Web3Status />
        <ThemeChanger />
      </div>
    </header>
  )
}

export default TopMenu
