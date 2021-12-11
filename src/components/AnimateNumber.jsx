/* eslint-disable */
import { motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import useWindowSize from "../hooks/useWindowSize"
import "./AnimatingNumber.scss"

function usePrevious(value) {
  const ref = useRef()

  useEffect(() => {
    ref.current = value
  })

  return ref.current
}

function formatForDisplay(number = 0, precision = 2) {
  return parseFloat(Math.max(number, 0)).toFixed(precision).split("").reverse()
}

function DecimalColumn() {
  return (
    <div>
      <div>.</div>
    </div>
  )
}

function NumberColumn({ digit, delta }) {
  const [position, setPosition] = useState(0)
  const [animationClass, setAnimationClass] = useState(null)
  const previousDigit = usePrevious(digit)
  const columnContainer = useRef()
  const [width, height] = useWindowSize()

  const setColumnToNumber = (number) => {
    setPosition(columnContainer.current.clientHeight * parseInt(number, 10))
  }

  useEffect(() => setAnimationClass(previousDigit !== digit ? delta : ""), [
    digit,
    delta,
  ])
  useEffect(() => setColumnToNumber(digit), [digit, width, height])

  return (
    <div className="ticker-column-container" ref={columnContainer}>
      <motion.div
        animate={{ y: position }}
        className={`ticker-column ${animationClass}`}
        onAnimationComplete={() => setAnimationClass("")}
      >
        {[9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map((num) => (
          <div key={num} className="ticker-digit">
            {num}
          </div>
        ))}
      </motion.div>
      <span className="number-placeholder">0</span>
    </div>
  )
}

export default function AnimatingNumber({ value, precision = 2 }) {
  const numArray = formatForDisplay(value, precision)
  const previousNumber = usePrevious(value)

  let delta = null
  if (value > previousNumber) delta = "increase"
  if (value < previousNumber) delta = "decrease"

  return (
    <motion.div layout className="ticker-view">
      {numArray.map((number, index) =>
        number === "." ? (
          <DecimalColumn key={index} />
        ) : (
          <NumberColumn key={index} digit={number} delta={delta} />
        ),
      )}
    </motion.div>
  )
}
