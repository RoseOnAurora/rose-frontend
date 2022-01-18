// TODO: create types
/* eslint @typescript-eslint/no-unsafe-member-access: 0 */
/* eslint @typescript-eslint/no-unsafe-call: 0 */
/* eslint @typescript-eslint/no-unsafe-assignment: 0 */
/* eslint @typescript-eslint/no-explicit-any: 0 */

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Tag,
  Text,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react"
import { Field, FieldAttributes, Form, Formik } from "formik"
import React, { ReactElement, ReactNode, useState } from "react"
import { ContractReceipt } from "@ethersproject/contracts"
import { FaHandHoldingUsd } from "react-icons/fa"
import parseStringToBigNumber from "../utils/parseStringToBigNumber"
import useStakeStats from "../hooks/useStakeStats"
import { useTranslation } from "react-i18next"

interface Token {
  token: string
  tokenIcon: string
}

interface Props {
  borrowToken: Token
  collateralToken: Token
  max: string
  submitButtonLabel: string
  formDescription?: ReactNode
  handleSubmit: (
    collateralAmount: string,
    borrowAmount: string,
  ) => Promise<ContractReceipt | void>
  handlePreSubmit?: () => void
  handlePostSubmit?: (receipt: ContractReceipt | null) => void
}

const BorrowForm = (props: Props): ReactElement => {
  const {
    borrowToken,
    collateralToken,
    max,
    submitButtonLabel,
    formDescription,
    handleSubmit,
    handlePreSubmit,
    handlePostSubmit,
  } = props
  const { t } = useTranslation()
  const [sliderValue, setSliderValue] = useState(25)
  const [showTooltip, setShowTooltip] = useState(false)
  const { priceOfRose } = useStakeStats()
  const collateralFieldBgColor = useColorModeValue(
    "rgba(245, 239, 239, 0.6)",
    "rgba(28, 29, 33, 0.4)",
  )
  const borrowFieldBgColor = useColorModeValue(
    "rgba(245, 239, 239, 0.6)",
    "rgba(28, 29, 33, 0.4)",
  )
  return (
    <Box pt="15px">
      <Formik
        initialValues={{ collateral: "", borrow: "" }}
        onSubmit={async (values, actions) => {
          handlePreSubmit?.()
          const collateralValueSafe = parseStringToBigNumber(
            values?.collateral,
            18,
          )
          const borrowValueSafe = parseStringToBigNumber(values?.borrow, 18)
          actions.resetForm({ values: { collateral: "", borrow: "" } })
          const receipt = (await handleSubmit(
            collateralValueSafe.value.toString(),
            borrowValueSafe.value.toString(),
          )) as ContractReceipt
          handlePostSubmit?.(receipt)
        }}
      >
        {(props) => (
          <Form>
            <Field name="collateral">
              {({ field, form }: FieldAttributes<any>) => (
                <FormControl
                  padding="10px"
                  bgColor={collateralFieldBgColor}
                  borderRadius="10px"
                  isInvalid={
                    form.errors?.collateral && form.touched?.collateral
                  }
                >
                  <FormLabel htmlFor="amount">Deposit Collateral</FormLabel>
                  <InputGroup>
                    <InputLeftElement
                      pointerEvents="none"
                      color="gray.300"
                      fontSize="2em"
                      marginLeft="5px"
                    >
                      <img src={collateralToken.tokenIcon} alt="tokenIcon" />
                    </InputLeftElement>
                    <Input
                      {...field}
                      autoComplete="off"
                      autoCorrect="off"
                      type="text"
                      isInvalid={form.errors?.collateral}
                      placeholder="0.0"
                      variant="primary"
                    />
                    <InputRightElement width="6rem" padding="10px">
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() => {
                          props.setFieldTouched("collateral", true)
                          props.setFieldValue("collateral", max)
                          props.setFieldValue("borrow", "0.0")
                        }}
                      >
                        {t("max")}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                  {form.errors?.collateral && form.touched?.collateral ? (
                    <FormErrorMessage color="#cc3a59">
                      {form.errors?.collateral}
                    </FormErrorMessage>
                  ) : (
                    <FormHelperText mt="15px" fontSize="sm" as="p">
                      You are about to deposit ~
                      {` $${(+priceOfRose * +props.values?.collateral).toFixed(
                        2,
                      )} `}
                      {collateralToken.token} as collateral.
                    </FormHelperText>
                  )}
                </FormControl>
              )}
            </Field>
            <Field name="borrow">
              {({ field, form }: FieldAttributes<any>) => (
                <FormControl
                  padding="10px"
                  mt="15px"
                  bgColor={borrowFieldBgColor}
                  borderRadius="10px"
                  isInvalid={form.errors?.borrow && form.touched?.borrow}
                >
                  <Flex justifyContent="space-between" alignItems="baseline">
                    <FormLabel
                      fontSize={{ base: "12px", lg: "16px" }}
                      htmlFor="amount"
                    >
                      Borrow RUSD
                    </FormLabel>
                    <HStack spacing="20px">
                      <Text fontSize={{ base: "11px", md: "14px", lg: "16px" }}>
                        Liquidation Price: $0.00
                      </Text>
                      <Tag
                        size="md"
                        borderRadius="full"
                        variant="solid"
                        colorScheme="green"
                        fontSize={{ base: "11px", md: "14px" }}
                      >
                        Safe
                      </Tag>
                    </HStack>
                  </Flex>
                  <Slider
                    id="slider"
                    defaultValue={25}
                    min={0}
                    max={100}
                    mb="40px"
                    mt="20px"
                    onChange={(v) => {
                      setSliderValue(v)
                      props.setFieldValue(
                        "borrow",
                        (v * (+priceOfRose * +props.values?.collateral)) / 100,
                      )
                    }}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    <SliderMark value={25} mt="1" ml="-2.5" fontSize="sm">
                      25%
                    </SliderMark>
                    <SliderMark value={50} mt="1" ml="-2.5" fontSize="sm">
                      50%
                    </SliderMark>
                    <SliderMark value={75} mt="1" ml="-2.5" fontSize="sm">
                      75%
                    </SliderMark>
                    <SliderTrack>
                      <SliderFilledTrack bg="#cc3a59" />
                    </SliderTrack>
                    <Tooltip
                      hasArrow
                      bg="#cc3a59"
                      color="white"
                      placement="top"
                      isOpen={showTooltip}
                      label={`${sliderValue}%`}
                    >
                      <SliderThumb boxSize={6}>
                        <Box color="#cc3a59" as={FaHandHoldingUsd} />
                      </SliderThumb>
                    </Tooltip>
                  </Slider>
                  <InputGroup>
                    <InputLeftElement
                      pointerEvents="none"
                      color="gray.300"
                      fontSize="2em"
                      marginLeft="5px"
                    >
                      <img src={borrowToken.tokenIcon} alt="tokenIcon" />
                    </InputLeftElement>
                    <Input
                      {...field}
                      autoComplete="off"
                      autoCorrect="off"
                      type="text"
                      isInvalid={form.errors?.borrow}
                      placeholder="0.0"
                      variant="primary"
                    />
                  </InputGroup>
                  {form.errors?.borrow && form.touched?.borrow ? (
                    <FormErrorMessage color="#cc3a59">
                      {form.errors?.borrow}
                    </FormErrorMessage>
                  ) : (
                    <FormHelperText mt="15px" fontSize="sm" as="p">
                      You are about to borrow ~{" "}
                      {(+props.values?.borrow).toFixed(2)} {borrowToken.token}.
                    </FormHelperText>
                  )}
                </FormControl>
              )}
            </Field>
            {formDescription && (
              <Box
                mt="20px"
                bg="var(--secondary-background)"
                border="1px solid var(--outline)"
                borderRadius="10px"
                p="24px"
                width="100%"
              >
                <Box textAlign="justify" color="var(--text-lighter)">
                  <Text as="span">{formDescription}</Text>
                </Box>
              </Box>
            )}
            <Flex
              mt="20px"
              alignItems="center"
              justifyContent="center"
              flexDirection="column"
              bg="var(--secondary-background)"
              border="1px solid var(--outline)"
              borderRadius="10px"
              padding="10px"
            >
              <Button
                variant="primary"
                size="lg"
                width="100%"
                type="submit"
                disabled={!props.isValid || !props.dirty}
              >
                {props.isValid
                  ? submitButtonLabel
                  : props.errors?.borrow ?? props.errors?.collateral}
              </Button>
              <Text
                as="p"
                p="20px 0 10px"
                textAlign="center"
                color="var(--text-lighter)"
                fontSize="14px"
              >
                Note: The &quot;Approve&quot; transaction is only needed the
                first time; subsequent actions will not require approval.
              </Text>
            </Flex>
          </Form>
        )}
      </Formik>
    </Box>
  )
}

export default BorrowForm
