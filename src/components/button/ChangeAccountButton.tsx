import { Button, ButtonProps } from "@chakra-ui/react"
import React, { ReactElement } from "react"
import { ChangeAccountIcon } from "../../constants/icons"
import { useTranslation } from "react-i18next"

const ChangeAccountButton = (
  props: Omit<ButtonProps, "display" | "alignItems" | "variant" | "leftIcon">,
): ReactElement => {
  const { t } = useTranslation()
  return (
    <Button
      {...props}
      variant="unstyled"
      display="flex"
      alignItems="center"
      leftIcon={<ChangeAccountIcon w="4" h="4" fill={props.color} />}
    >
      {t("changeAccount")}
    </Button>
  )
}

export default ChangeAccountButton
