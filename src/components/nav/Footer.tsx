import { BsMedium, BsThreeDotsVertical } from "react-icons/bs"
import { Center, Link } from "@chakra-ui/react"
import {
  FaBook,
  FaDiscord,
  FaGithub,
  FaTelegram,
  FaTwitter,
} from "react-icons/fa"
import React, { ReactElement } from "react"

function Footer(): ReactElement | null {
  return (
    <Center
      gap={5}
      pos="absolute"
      bottom="24px"
      p="0 20px"
      color="white"
      w="100%"
      display={{ base: "none", lg: "flex" }}
      alignItems="center"
    >
      <Link href="https://twitter.com/roseonaurora" isExternal>
        <FaTwitter title="Twitter" fontSize="25px" />
      </Link>
      <Link href="https://medium.com/@roseonaurora" isExternal>
        <BsMedium title="Medium" fontSize="25px" />
      </Link>
      <Link href="https://t.me/RoseOnAurora" isExternal>
        <FaTelegram title="Telegram" fontSize="25px" />
      </Link>
      <Link href="https://discord.gg/dG6mWH4rHj" isExternal>
        <FaDiscord title="Discord" fontSize="25px" />
      </Link>
      <BsThreeDotsVertical />
      <Link href="https://github.com/RoseOnAurora" isExternal>
        <FaGithub title="Github" fontSize="25px" />
      </Link>
      <Link href="https://docs.rose.fi" isExternal>
        <FaBook title="Docs" fontSize="22px" />
      </Link>
    </Center>
  )
}

export default Footer
