import { BsMedium, BsThreeDotsVertical } from "react-icons/bs"
import {
  FaBook,
  FaDiscord,
  FaGithub,
  FaTelegram,
  FaTwitter,
} from "react-icons/fa"
import React, { ReactElement } from "react"
import styles from "./BottomMenu.module.scss"

function Footer(): ReactElement | null {
  return (
    <div className={styles.bottommenu}>
      <div className={styles.socials}>
        <a
          href="https://twitter.com/roseonaurora"
          target="_blank"
          rel="noreferrer"
        >
          <FaTwitter title="Twitter" fontSize="25px" />
        </a>
        <a
          href="https://medium.com/@roseonaurora"
          target="_blank"
          rel="noreferrer"
        >
          <BsMedium title="Medium" fontSize="25px" />
        </a>
        <a href="https://t.me/RoseOnAurora" target="_blank" rel="noreferrer">
          <FaTelegram title="Telegram" fontSize="25px" />
        </a>
        <a
          href="https://discord.gg/dG6mWH4rHj"
          target="_blank"
          rel="noreferrer"
        >
          <FaDiscord title="Discord" fontSize="25px" />
        </a>
        <BsThreeDotsVertical style={{ marginLeft: "10px" }} />
        <a
          href="https://github.com/RoseOnAurora"
          target="_blank"
          rel="noreferrer"
          style={{ marginLeft: "10px" }}
        >
          <FaGithub title="Github" fontSize="25px" />
        </a>
        <a href="https://docs.rose.fi" target="_blank" rel="noreferrer">
          <FaBook title="Docs" fontSize="22px" />
        </a>
      </div>
    </div>
  )
}

export default Footer
