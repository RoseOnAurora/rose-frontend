import { FaGithub, FaTelegram, FaTwitter } from "react-icons/fa"
import React, { ReactElement } from "react"
import { BsMedium } from "react-icons/bs"
import styles from "./BottomMenu.module.scss"

function BottomMenu(): ReactElement | null {
  return (
    <div className={styles.bottommenu}>
      <div className={styles.socials}>
        <a href="https://twitter.com/roseonaurora">
          <FaTwitter />
        </a>
        <a href="https://medium.com/@roseonaurora">
          <BsMedium />
        </a>
        <a href="https://t.me/RoseOnAurora">
          <FaTelegram />
        </a>
        <a href="https://github.com/RoseOnAurora">
          <FaGithub />
        </a>
      </div>
    </div>
  )
}

export default BottomMenu
