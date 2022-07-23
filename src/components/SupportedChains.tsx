import {
  Button,
  ButtonGroup,
  Flex,
  Grid,
  GridItem,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Stack,
  Text,
} from "@chakra-ui/react"
import React, { ReactElement } from "react"
import ChangeAccountButton from "./button/ChangeAccountButton"
import { FaWallet } from "react-icons/fa"
import { SUPPORTED_CHAINS } from "../constants"
import { map } from "lodash"
import useAddNetworkToMetamask from "../hooks/useAddNetworkToMetamask"
import { useTranslation } from "react-i18next"

interface Props {
  openOptions: () => void
}

export default function SupportedChains({ openOptions }: Props): ReactElement {
  const { t } = useTranslation()
  const addNetwork = useAddNetworkToMetamask()
  return (
    <Stack spacing="20px" alignItems="start">
      <Text textAlign="right" fontSize="16px" color="gray.300" fontWeight={400}>
        {t("supportedChainsDescription")}
      </Text>
      <Stack pt={1} spacing="10px" alignItems="center" w="full">
        {map(SUPPORTED_CHAINS, ({ name, rpc, Icon }, key) => (
          <ButtonGroup key={key} w="full" variant="solid" size="lg" isAttached>
            {Icon && (
              <Popover>
                <PopoverTrigger>
                  <Button w="full" leftIcon={<Icon />}>
                    {name}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  borderColor="gray.700"
                  border="1px"
                  borderRadius="12px"
                  minW="fit-content"
                  boxShadow="0px 20px 15px -12px rgba(0, 0, 0, 0.25)"
                  bg="gray.900"
                  _focus={{ borderColor: "gray.600" }}
                >
                  <PopoverArrow bgColor="gray.900" />
                  <PopoverCloseButton zIndex={4} />
                  <PopoverBody>
                    <Stack spacing="20px">
                      <Flex alignItems="center" gap="3px">
                        <Text
                          fontSize="16px"
                          lineHeight="21px"
                          fontWeight={700}
                          color="gray.200"
                        >
                          {name} {t("network")}
                        </Text>
                        {Icon && <Icon />}
                      </Flex>
                      <Grid
                        gridTemplateColumns="repeat(2, 1fr)"
                        columnGap={6}
                        rowGap={3}
                      >
                        <GridItem>
                          <Text
                            fontSize="14px"
                            fontWeight={400}
                            color="gray.300"
                          >
                            Chain ID
                          </Text>
                        </GridItem>
                        <GridItem>
                          <Text
                            fontSize="14px"
                            fontWeight={700}
                            color="gray.50"
                          >
                            {key}
                          </Text>
                        </GridItem>
                        <GridItem>
                          <Text
                            fontSize="14px"
                            fontWeight={400}
                            color="gray.300"
                          >
                            RPC URL
                          </Text>
                        </GridItem>
                        <GridItem>
                          <Text
                            fontSize="14px"
                            fontWeight={700}
                            color="gray.50"
                          >
                            {rpc}
                          </Text>
                        </GridItem>
                      </Grid>
                    </Stack>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            )}
            <Button
              textAlign="right"
              color="gray.50"
              borderLeftColor="#323748 !important"
              borderLeft="1px"
              w="full"
              pr="6px"
              rightIcon={<FaWallet size="20px" />}
              onClick={() => addNetwork(+key)}
            >
              {t("addToWallet")}
            </Button>
          </ButtonGroup>
        ))}
      </Stack>
      <ChangeAccountButton
        color="red.500"
        fontWeight={700}
        fontSize="15px"
        p="10px"
        transition="ease-in-out 0.1s"
        onClick={openOptions}
      />
    </Stack>
  )
}
