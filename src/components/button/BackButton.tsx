import { IconButton, IconButtonProps } from "@chakra-ui/react"
import React, { ReactElement } from "react"
import { BsArrowLeftShort } from "react-icons/bs"
import { Link } from "react-router-dom"

interface BackButtonProps
  extends Omit<IconButtonProps, "as" | "to" | "icon" | "variant"> {
  route: string
}

export default function BackButton({
  route,
  ...rest
}: BackButtonProps): ReactElement {
  return (
    <IconButton
      as={Link}
      to={route}
      icon={<BsArrowLeftShort />}
      variant="solid"
      {...rest}
    />
  )
}
