import {
  Box,
  Flex,
  Image,
  Menu,
  MenuButton,
  MenuGroup,
  MenuItem,
  MenuList,
  Text,
  useColorModeValue,
} from "@chakra-ui/react"
import React, { ReactElement } from "react"
import { BsRainbow } from "react-icons/bs"
import { FaRegCircle } from "react-icons/fa"
import arrowUpRight from "../../assets/arrow-up-right.svg"

const BridgeMenu = (): ReactElement => {
  const menuBg = useColorModeValue("#fff", "rgb(28, 29, 33)")

  return (
    <Menu>
      {({ isOpen }) => (
        <>
          <MenuButton
            _hover={{ color: "gray.200" }}
            color={isOpen ? "gray.100" : "gray.300"}
            fontWeight={700}
            fontSize={{ base: "14px", xl: "20px" }}
            lineHeight="18px"
            textAlign="center"
          >
            <Flex alignItems="center" gap="5px">
              <Text>Bridge</Text>
              <Box w="12px">
                <Image src={arrowUpRight} w="full" objectFit="cover" />
              </Box>
            </Flex>
          </MenuButton>
          <MenuList bg={menuBg}>
            <MenuGroup>
              <MenuItem
                icon={<BsRainbow />}
                href="https://rainbowbridge.app/transfer"
                as="a"
                target="_blank"
                rel="noreferrer"
              >
                <Flex alignItems="center" gap="5px">
                  <Text>Rainbow Bridge</Text>
                  <Box>
                    <Image src={arrowUpRight} w="full" objectFit="cover" />
                  </Box>
                </Flex>
              </MenuItem>
              <MenuItem
                icon={<FaRegCircle />}
                href="https://app.allbridge.io/bridge"
                as="a"
                target="_blank"
                rel="noreferrer"
              >
                <Flex alignItems="center" gap="5px">
                  <Text>Allbridge</Text>
                  <Box>
                    <Image src={arrowUpRight} w="full" objectFit="cover" />
                  </Box>
                </Flex>
              </MenuItem>
            </MenuGroup>
          </MenuList>
        </>
      )}
    </Menu>
  )
}

export default BridgeMenu
