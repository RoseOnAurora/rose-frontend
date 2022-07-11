import { Flex, Text, chakra } from "@chakra-ui/react"
import React, { ReactElement, useMemo } from "react"
import { isValidMotionProp, motion } from "framer-motion"
import BridgeMenu from "../menu/BridgeMenu"
import { Link } from "react-router-dom"
import { NAV_ITEMS } from "../../constants"
import { useTranslation } from "react-i18next"

interface NavBarProps {
  activeNavItem: string
}

const NavBar = ({ activeNavItem }: NavBarProps): ReactElement => {
  // state
  const MotionDiv = useMemo(() => {
    return chakra(motion.div, {
      shouldForwardProp: (prop) =>
        isValidMotionProp(prop) || prop === "children",
    })
  }, [])

  // hooks
  const { t } = useTranslation()

  return (
    <Flex alignItems="center" gridGap={{ base: "5px", xl: "25px" }}>
      {NAV_ITEMS.map(({ route, name, isActive }) => {
        const active = isActive(activeNavItem)
        return (
          <Link to={route} key={name}>
            <Flex
              p="8px"
              alignItems="center"
              justifyContent="center"
              h="50px"
              pos="relative"
            >
              <Text
                color={active ? "gray.100" : "gray.300"}
                fontWeight={700}
                fontSize={{ base: "14px", xl: "20px" }}
                lineHeight="18px"
                textAlign="center"
                _hover={{ color: "gray.200" }}
              >
                {t(name)}
              </Text>
              {active && (
                <MotionDiv
                  pos="absolute"
                  height="2px"
                  bgColor="red.500"
                  bottom={-1}
                  left={0}
                  right={0}
                  layoutId="nav-underline"
                />
              )}
            </Flex>
          </Link>
        )
      })}
      <BridgeMenu />
    </Flex>
  )
}

export default NavBar
