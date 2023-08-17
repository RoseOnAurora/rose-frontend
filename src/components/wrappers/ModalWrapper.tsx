import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalProps,
} from "@chakra-ui/react"
import React, { ReactElement, ReactNode, useRef } from "react"

interface ModalWraperProps extends ModalProps {
  modalHeader: ReactNode
  maxW?: string
  blur?: boolean
}

const ModalWrapper = ({
  children,
  modalHeader,
  blur,
  maxW,
  ...rest
}: React.PropsWithChildren<ModalWraperProps>): ReactElement => {
  const ref = useRef(null)

  return (
    <Modal {...rest} initialFocusRef={ref}>
      <ModalOverlay
        bg="blackAlpha.900"
        backdropFilter={blur ? "blur(5px)" : ""}
      />
      <ModalContent bg="gray.900" borderRadius="20px" p="25px" maxW={maxW}>
        <ModalHeader fontWeight={700} fontSize="30px" lineHeight="39px" p="0">
          {modalHeader}
        </ModalHeader>
        <ModalCloseButton ref={ref} top={7} />
        <ModalBody p="0" mt="30px">
          {children}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default ModalWrapper
