import {
  Input,
  InputGroup,
  InputGroupProps,
  InputLeftElement,
} from "@chakra-ui/react"
import React, { ReactElement } from "react"
import { FieldInputProps } from "formik"
import SingleTokenLeftElement from "./SingleTokenLeftElement"
import { TokenProps } from "../../types/token"

interface SingleTokenInputProps extends InputGroupProps {
  token: TokenProps
  inputValue: string
  isInvalid: boolean
  readOnly?: boolean
  fieldProps?: FieldInputProps<string>
  onChangeInput?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const SingleTokenInput = ({
  token,
  fieldProps,
  inputValue,
  isInvalid,
  readOnly,
  onChangeInput,
  ...rest
}: SingleTokenInputProps): ReactElement => {
  return (
    <InputGroup {...rest}>
      <InputLeftElement zIndex={2}>
        <SingleTokenLeftElement token={token} />
      </InputLeftElement>
      <Input
        {...fieldProps}
        textAlign="right"
        type="text"
        pl="150px"
        variant="simple"
        autoComplete="off"
        autoCorrect="off"
        placeholder="0.0"
        spellCheck="false"
        readOnly={readOnly}
        isInvalid={isInvalid}
        value={inputValue}
        onChange={onChangeInput}
      />
    </InputGroup>
  )
}

export default SingleTokenInput
