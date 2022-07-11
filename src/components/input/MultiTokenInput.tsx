import { Input, InputGroup, InputLeftElement } from "@chakra-ui/react"
import React, { ReactElement } from "react"
import { FieldInputProps } from "formik"
import MultiTokenInputLeftElement from "./MultiTokenInputLeftElement"
import { Token } from "../../constants"
import { commify } from "../../utils"

interface MultiTokenInputProps {
  selectedToken: Token
  inputValue: string
  fieldProps: FieldInputProps<string>
  isInvalid: boolean
  readOnly?: boolean
  onToggleTokenSelect: () => void
  onChangeInput: (e: React.ChangeEvent<HTMLInputElement>) => void
}
const MultiTokenInput = ({
  selectedToken,
  inputValue,
  fieldProps,
  isInvalid,
  readOnly,
  onToggleTokenSelect,
}: // onChangeInput,
MultiTokenInputProps): ReactElement => {
  return (
    <InputGroup py="5px">
      <InputLeftElement>
        <MultiTokenInputLeftElement
          selectedToken={selectedToken}
          onToggleTokenSelect={onToggleTokenSelect}
        />
      </InputLeftElement>
      <Input
        {...fieldProps}
        type="text"
        autoComplete="off"
        autoCorrect="off"
        placeholder="0.0"
        spellCheck="false"
        isInvalid={isInvalid}
        value={readOnly ? commify(inputValue) : inputValue}
        // onChange={onChangeInput}
        onFocus={(e: React.ChangeEvent<HTMLInputElement>): void => {
          if (!readOnly) {
            e.target.select()
          }
        }}
        readOnly={readOnly}
        tabIndex={readOnly ? -1 : 0}
      />
    </InputGroup>
  )
}

export default MultiTokenInput
