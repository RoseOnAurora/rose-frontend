import React, { ReactElement, ReactNode } from "react"
import { Box } from "@chakra-ui/react"

interface Props {
  formTitle: ReactNode
  formDescription: ReactNode
}

const FormWrapper = ({
  formTitle,
  formDescription,
  children,
}: React.PropsWithChildren<unknown> & Props): ReactElement => {
  return (
    <>
      <Box
        bg="var(--secondary-background)"
        border="1px solid var(--outline)"
        borderRadius="10px"
        p="15px"
      >
        {formTitle}
      </Box>
      <Box pt="15px">
        {formDescription && (
          <Box
            mb="15px"
            bg="var(--secondary-background)"
            color="var(--text-lighter)"
            border="1px solid var(--outline)"
            borderRadius="10px"
            p="24px"
            width="100%"
          >
            {formDescription}
          </Box>
        )}
        {children}
      </Box>
    </>
  )
}

export default FormWrapper
