import React, { ReactElement } from "react"
import BackButton from "./BackButton"
import styles from "./FarmFooter.module.scss"

const FarmFooter = (): ReactElement => {
  return (
    <div className={styles.farmFooter}>
      <BackButton
        route="/farms"
        wrapperClass={styles.goBack}
        buttonText="Go back to farms"
      />
    </div>
  )
}

export default FarmFooter
