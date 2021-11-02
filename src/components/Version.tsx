import { FaMedium, FaTelegram, FaTwitter } from "react-icons/fa"
import React, { ReactElement } from "react"
import styles from "./Version.module.scss"

function Version(): ReactElement | null {
  return (
    <div className={styles.version}>
      VERSION {process.env.REACT_APP_GIT_SHA}&nbsp;-
      <a href="https://twitter.com/roseonaurora">
        <FaTwitter />
      </a>
      <a href="https://medium.com/@roseonaurora">
        <FaMedium />
      </a>
      <a href="https://t.me/RoseOnAurora">
        <FaTelegram />
      </a>
    </div>
  )
}

export default Version
