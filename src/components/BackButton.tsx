import React, { ReactElement } from "react"
import { Link } from "react-router-dom"
import styles from "./BackButton.module.scss"

interface Props {
  wrapperClass?: string
  route: string
  buttonText: string
}

export default function BackButton(props: Props): ReactElement {
  const { wrapperClass, route, buttonText } = props
  return (
    <div className={wrapperClass}>
      <Link to={route} className={styles.arrowLeft}>
        <i>{buttonText}</i>
      </Link>
    </div>
  )
}
