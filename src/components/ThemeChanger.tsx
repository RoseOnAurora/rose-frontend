import { AppDispatch, AppState } from "../state"
import { BsMoon, BsSun } from "react-icons/bs"
import { IconButton, useColorMode } from "@chakra-ui/react"
import React, { ReactElement, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"

import { updateDarkMode } from "../state/user"

const ThemeChanger = (): ReactElement => {
  const dispatch = useDispatch<AppDispatch>()
  const { colorMode, toggleColorMode } = useColorMode()
  const { userDarkMode } = useSelector((state: AppState) => state.user)

  useEffect(() => {
    if (userDarkMode) {
      document.body.classList.add("dark")
    } else {
      document.body.classList.remove("dark")
    }
  }, [userDarkMode])

  return (
    <IconButton
      aria-label="Change Theme"
      variant="outline"
      size="md"
      icon={userDarkMode ? <BsSun /> : <BsMoon />}
      title="Connected Network"
      marginLeft="10px"
      onClick={(): void => {
        dispatch(updateDarkMode(!userDarkMode))
        if (
          (userDarkMode && colorMode === "dark") ||
          (!userDarkMode && colorMode === "light")
        ) {
          toggleColorMode()
        }
      }}
    />
  )
}

export default ThemeChanger
