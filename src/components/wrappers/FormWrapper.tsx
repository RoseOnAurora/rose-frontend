import { Box, BoxProps } from "@chakra-ui/react"
import React, { ReactElement, ReactNode } from "react"

interface Props extends BoxProps {
  formTitle: ReactNode
  formDescription: ReactNode
}

const FormWrapper = ({
  formTitle,
  formDescription,
  children,
  ...rest
}: React.PropsWithChildren<unknown> & Props): ReactElement => {
  return (
    <Box {...rest}>
      {formTitle && <Box p="10px">{formTitle}</Box>}
      <Box pt="5px">
        {formDescription && (
          <Box color="gray.200" width="100%" textAlign="center">
            {formDescription}
          </Box>
        )}
        {children}
      </Box>
    </Box>
  )
}

export default FormWrapper
