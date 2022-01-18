import React, { ReactElement } from "react"
import BorrowPage from "../components/BorrowPage"
import TopMenu from "../components/TopMenu"
import styles from "./Borrow.module.scss"

const Borrow = (): ReactElement => {
  return (
    <div className={styles.borrow}>
      <TopMenu activeTab="borrow" />
      <div className={styles.container}>
        <BorrowPage />
      </div>
    </div>
  )
}
export default Borrow
