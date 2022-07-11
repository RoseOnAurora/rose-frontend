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
import {
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList,
  useColorModeValue,
} from "@chakra-ui/react"
import React, { ReactElement } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

const MobileNavMenu = (): ReactElement => {
  // hooks
  const { t } = useTranslation()
  const menuColor = useColorModeValue("#fff", "rgb(28, 29, 33)")

  return (
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
              <MenuItem icon={<BsArrowLeftRight />} as={Link} to="/">
                {t("swap")}
              </MenuItem>
              <MenuItem icon={<FaChartPie />} as={Link} to="/pools">
                {t("pools")}
              </MenuItem>
              <MenuItem icon={<FaGift />} as={Link} to="/farms">
                {t("farms")}
              </MenuItem>
              <MenuItem icon={<BsReceipt />} as={Link} to="/stake">
                {t("stake")}
              </MenuItem>
              <MenuItem icon={<FaHandHoldingUsd />} as={Link} to="/borrow">
                {t("borrow")}
              </MenuItem>
            </MenuGroup>
            <MenuDivider />
            <MenuGroup title="Bridges">
              <MenuItem
                icon={<BsRainbow />}
                href="https://rainbowbridge.app/transfer"
                as="a"
                target="_blank"
                rel="noreferrer"
              >
                Rainbow Bridge↗
              </MenuItem>
              <MenuItem
                icon={<FaRegCircle />}
                href="https://app.allbridge.io/bridge"
                as="a"
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
                target="_blank"
                rel="noreferrer"
              >
                Twitter↗
              </MenuItem>
              <MenuItem
                icon={<BsMedium />}
                href="https://medium.com/@roseonaurora"
                as="a"
                target="_blank"
                rel="noreferrer"
              >
                Medium↗
              </MenuItem>
              <MenuItem
                icon={<FaTelegram />}
                href="https://t.me/RoseOnAurora"
                as="a"
                target="_blank"
                rel="noreferrer"
              >
                Telegram↗
              </MenuItem>
              <MenuItem
                icon={<FaDiscord />}
                href="https://discord.gg/dG6mWH4rHj"
                as="a"
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
                target="_blank"
                rel="noreferrer"
              >
                Github↗
              </MenuItem>
              <MenuItem
                icon={<FaBook />}
                href="https://docs.rose.fi"
                as="a"
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
  )
}

export default MobileNavMenu
