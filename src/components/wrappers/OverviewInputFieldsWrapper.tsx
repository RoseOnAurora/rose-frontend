import {
  Box,
  Flex,
  HStack,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  SelectProps,
  Stack,
} from "@chakra-ui/react"
import { FaFilter, FaInfoCircle, FaLayerGroup, FaUndo } from "react-icons/fa"
import React, { ReactElement, ReactNode } from "react"
import { IconButtonPopover } from "../Popover"
import { SearchIcon } from "@chakra-ui/icons"
import { SlidersIcon } from "../../constants/icons"

interface Props {
  title: string
  sortDirection: number
  sortByField: string
  sortFieldLabelMap: { [key: string]: string }
  filterByField: string
  filterFieldLabelMap: { [key: string]: string }
  searchText: string
  popOverContent: ReactNode
  handleSortDirection: (direction: number) => void
  onUpdateFilterText: (text: string) => void
  handleClearFilter: () => void
  handleUpdateSortField: (e: React.ChangeEvent<HTMLSelectElement>) => void
  handleUpdateFilterField: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onIconClick: (isInfo: boolean) => void
}

const OverviewInputFieldsWrapper = ({
  title,
  popOverContent,
  filterByField,
  filterFieldLabelMap,
  searchText,
  onUpdateFilterText,
  handleClearFilter,
  handleUpdateFilterField,
  onIconClick,
}: Props): ReactElement => {
  const defaultSelectProps: SelectProps = {
    fontSize: { base: "12px", sm: "13px", md: "16px" },
    variant: "filled",
    focusBorderColor: "red.500",
    _hover: {
      bg: "gray.700",
    },
    borderRadius: "12px",
  }

  return (
    <Stack spacing="30px">
      <Flex justifyContent="space-between" alignItems="center" gap="15px">
        <Heading>{title}</Heading>
        <HStack spacing="10px">
          <HStack spacing="10px" display={{ base: "none", lg: "flex" }}>
            <Box w="350px">
              <InputGroup size="md">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.500" />
                </InputLeftElement>
                <Input
                  value={searchText}
                  variant="simple"
                  placeholder="Search name or paste address"
                  type="text"
                  onChange={(e) => onUpdateFilterText(e.target.value)}
                />
              </InputGroup>
            </Box>
            <Select
              {...defaultSelectProps}
              value={filterByField}
              onChange={(e) => handleUpdateFilterField(e)}
              h="47px"
              maxW="180px"
              bg="gray.800"
              color="gray.200"
            >
              {Object.entries(filterFieldLabelMap).map(
                ([value, label], index) => {
                  return (
                    <option
                      disabled={value === "noFilter"}
                      key={index}
                      value={value}
                    >
                      {value === "noFilter"
                        ? "Select a Filter"
                        : `Filter by ${label}`}
                    </option>
                  )
                },
              )}
            </Select>
            <IconButton
              aria-label="sort"
              variant="solid"
              borderRadius="12px"
              // TO-DO: union the enums and use this as general type
              isDisabled={filterByField === "noFilter" && !searchText}
              title={
                filterByField === "noFilter" && !searchText
                  ? "Filter"
                  : "Clear Filter"
              }
              icon={
                filterByField === "noFilter" && !searchText ? (
                  <FaFilter />
                ) : (
                  <FaUndo />
                )
              }
              onClick={handleClearFilter}
            />
          </HStack>
          <IconButtonPopover
            IconButtonProps={{
              "aria-label": "Configure Settings",
              icon: <SlidersIcon />,
              title: "Configure Settings",
              _focus: { boxShadow: "none" },
              variant: "solid",
              borderRadius: "12px",
            }}
            PopoverBodyContent={popOverContent}
          />
          <IconButton
            aria-label="Help"
            variant="solid"
            borderRadius="12px"
            title="Need Help?"
            _focus={{ boxShadow: "none" }}
            icon={<FaInfoCircle />}
            onClick={() => onIconClick(true)}
          />
          <Box display={{ base: "flex", xl: "none" }}>
            <IconButton
              _focus={{ boxShadow: "none" }}
              aria-label="dashboard"
              title="Dashboard"
              variant="solid"
              borderRadius="12px"
              icon={<FaLayerGroup />}
              onClick={() => onIconClick(false)}
            />
          </Box>
        </HStack>
      </Flex>
      <Stack spacing="10px" display={{ base: "initial", lg: "none" }}>
        <Box w={{ base: "full", lg: "350px" }}>
          <InputGroup size="md">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.500" />
            </InputLeftElement>
            <Input
              value={searchText}
              variant="simple"
              placeholder="Search name or paste address"
              type="text"
              onChange={(e) => onUpdateFilterText(e.target.value)}
            />
          </InputGroup>
        </Box>
        <HStack spacing="10px" w="full">
          <Select
            {...defaultSelectProps}
            value={filterByField}
            onChange={(e) => handleUpdateFilterField(e)}
            h="47px"
            maxW={{ base: "full", lg: "180px" }}
            bg="gray.800"
            color="gray.200"
          >
            {Object.entries(filterFieldLabelMap).map(
              ([value, label], index) => {
                return (
                  <option
                    disabled={value === "noFilter"}
                    key={index}
                    value={value}
                  >
                    {value === "noFilter"
                      ? "Select a Filter"
                      : `Filter by ${label}`}
                  </option>
                )
              },
            )}
          </Select>
          <IconButton
            aria-label="sort"
            variant="solid"
            borderRadius="12px"
            // TO-DO: union the enums and use this as general type
            isDisabled={filterByField === "noFilter" && !searchText}
            title={
              filterByField === "noFilter" && !searchText
                ? "Filter"
                : "Clear Filter"
            }
            icon={
              filterByField === "noFilter" && !searchText ? (
                <FaFilter />
              ) : (
                <FaUndo />
              )
            }
            onClick={handleClearFilter}
          />
        </HStack>
      </Stack>
    </Stack>
  )
}

export default OverviewInputFieldsWrapper
