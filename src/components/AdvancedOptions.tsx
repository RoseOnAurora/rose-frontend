import {
  Box,
  Button,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Switch,
  Text,
  Tooltip,
} from "@chakra-ui/react"
import React, { ReactElement } from "react"
import {
  updateInfiniteApproval,
  updateSlippageCustom,
  updateSlippageSelected,
} from "../state/user"
import { useDispatch, useSelector } from "react-redux"

import { AppDispatch } from "../state"
import { AppState } from "../state/index"
import { PayloadAction } from "@reduxjs/toolkit"
import { Slippages } from "../state/user"
import { useTranslation } from "react-i18next"

export default function AdvancedOptions(): ReactElement {
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const { infiniteApproval, slippageCustom, slippageSelected } = useSelector(
    (state: AppState) => state.user,
  )

  return (
    <Box p="15px">
      <Stack spacing="20px">
        <Flex justifyContent="self-start" alignItems="center" gap="15px">
          <Switch
            colorScheme="gray"
            size="lg"
            isChecked={infiniteApproval}
            onChange={(): PayloadAction<boolean> =>
              dispatch(updateInfiniteApproval(!infiniteApproval))
            }
          />
          <Tooltip closeOnClick={false} label={t("infiniteApprovalTooltip")}>
            <Text
              fontSize="16px"
              lineHeight="21px"
              fontWeight={700}
              color="gray.200"
              borderBottom="1px dotted"
              cursor="help"
            >
              {t("infiniteApproval")}
            </Text>
          </Tooltip>
        </Flex>
        <Flex alignItems="center" justifyContent="space-between" gap="12px">
          <Flex alignItems="center" gap="12px">
            <Text
              color="gray.400"
              fontSize="14px"
              fontWeight={400}
              whiteSpace="nowrap"
            >
              {t("maxSlippage")}:
            </Text>
            <Button
              variant="solid"
              size="md"
              minW="60px"
              transition="ease-out 0.3s"
              borderColor={
                slippageSelected === Slippages.OneTenth ? "red.500" : "initial"
              }
              border={
                slippageSelected === Slippages.OneTenth ? "2px" : "initial"
              }
              color={
                slippageSelected === Slippages.OneTenth ? "red.500" : "initial"
              }
              onClick={(): PayloadAction<Slippages> =>
                dispatch(updateSlippageSelected(Slippages.OneTenth))
              }
            >
              0.1%
            </Button>
            <Button
              variant="solid"
              borderColor={
                slippageSelected === Slippages.One ? "red.500" : "initial"
              }
              border={slippageSelected === Slippages.One ? "2px" : "initial"}
              color={slippageSelected === Slippages.One ? "red.500" : "initial"}
              transition="ease-out 0.3s"
              minW="60px"
              size="md"
              onClick={(): PayloadAction<Slippages> =>
                dispatch(updateSlippageSelected(Slippages.One))
              }
            >
              1%
            </Button>
          </Flex>
          <InputGroup>
            <Input
              value={slippageCustom?.valueRaw}
              w="100px"
              type="text"
              variant="simple"
              placeholder="0.0"
              pr="30px"
              size="md"
              onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                const value = e.target.value
                if (value && !isNaN(+value)) {
                  dispatch(updateSlippageCustom(value))
                  if (slippageSelected !== Slippages.Custom) {
                    dispatch(updateSlippageSelected(Slippages.Custom))
                  }
                } else {
                  dispatch(updateSlippageSelected(Slippages.OneTenth))
                }
              }}
            />
            <InputRightElement pl="25px">%</InputRightElement>
          </InputGroup>
        </Flex>
      </Stack>
    </Box>
  )
}
