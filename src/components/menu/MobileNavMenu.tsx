import {
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList,
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
  FaDollarSign,
  FaGithub,
  FaHandHoldingUsd,
  FaRegCircle,
  FaTelegram,
  FaTwitter,
} from "react-icons/fa"
import React, { Fragment, ReactElement } from "react"
import { ChainId } from "../../constants"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useWeb3React } from "@web3-react/core"

const MobileNavMenu = (): ReactElement => {
  // hooks
  const { t } = useTranslation()

  const { chainId, account } = useWeb3React()

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
            borderRadius="15px"
            lineHeight="unset"
          >
            {isOpen ? <CloseIcon /> : <HamburgerIcon />}
          </MenuButton>
          <MenuList zIndex={10} boxShadow="md" bg="gray.900">
            <MenuGroup title="Pages">
              {chainId !== ChainId.MAINNET && (
                <Fragment>
                  <MenuItem icon={<BsArrowLeftRight />} as={Link} to="/swap">
                    {t("swap")}
                  </MenuItem>
                  <MenuItem icon={<FaChartPie />} as={Link} to="/pools">
                    {t("pools")}
                  </MenuItem>
                  <MenuItem icon={<BsReceipt />} as={Link} to="/stake">
                    {t("stake")}
                  </MenuItem>
                  <MenuItem icon={<FaHandHoldingUsd />} as={Link} to="/borrow">
                    {t("borrow")}
                  </MenuItem>
                </Fragment>
              )}
              {(chainId === ChainId.MAINNET || !account) && (
                <MenuItem icon={<FaDollarSign />} as={Link} to="/earn">
                  {t("Earn")}
                  <Badge ml={3} colorScheme="green">
                    new
                  </Badge>
                </MenuItem>
              )}
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
                Rainbow Bridge
                <sup style={{ fontSize: "8px", fontWeight: "bold" }}>↗</sup>
              </MenuItem>
              <MenuItem
                icon={<FaRegCircle />}
                href="https://app.allbridge.io/bridge"
                as="a"
                target="_blank"
                rel="noreferrer"
              >
                Allbridge
                <sup style={{ fontSize: "8px", fontWeight: "bold" }}>↗</sup>
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
                Twitter
                <sup style={{ fontSize: "9px", fontWeight: "bold" }}>↗</sup>
              </MenuItem>
              <MenuItem
                icon={<BsMedium />}
                href="https://medium.com/@roseonaurora"
                as="a"
                target="_blank"
                rel="noreferrer"
              >
                Medium
                <sup style={{ fontSize: "8px", fontWeight: "bold" }}>↗</sup>
              </MenuItem>
              <MenuItem
                icon={<FaTelegram />}
                href="https://t.me/RoseOnAurora"
                as="a"
                target="_blank"
                rel="noreferrer"
              >
                Telegram
                <sup style={{ fontSize: "8px", fontWeight: "bold" }}>↗</sup>
              </MenuItem>
              <MenuItem
                icon={<FaDiscord />}
                href="https://discord.gg/dG6mWH4rHj"
                as="a"
                target="_blank"
                rel="noreferrer"
              >
                Discord
                <sup style={{ fontSize: "8px", fontWeight: "bold" }}>↗</sup>
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
                Github
                <sup style={{ fontSize: "8px", fontWeight: "bold" }}>↗</sup>
              </MenuItem>
              <MenuItem
                icon={<FaBook />}
                href="https://docs.rose.fi"
                as="a"
                target="_blank"
                rel="noreferrer"
              >
                Gitbook Docs
                <sup style={{ fontSize: "8px", fontWeight: "bold" }}>↗</sup>
              </MenuItem>
            </MenuGroup>
          </MenuList>
        </>
      )}
    </Menu>
  )
}

export default MobileNavMenu
