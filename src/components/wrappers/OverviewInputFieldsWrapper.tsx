import {
  Box,
  Flex,
  HStack,
  IconButton,
  Select,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react"
import {
  FaFilter,
  FaInfoCircle,
  FaLayerGroup,
  FaSortAmountDownAlt,
  FaSortAmountUp,
  FaUndo,
} from "react-icons/fa"
import React, { ReactElement, ReactNode } from "react"
import { BsSliders } from "react-icons/bs"
import { IconButtonPopover } from "../Popover"

interface Props {
  sortDirection: number
  sortByField: string
  sortFieldLabelMap: { [key: string]: string }
  filterByField: string
  filterFieldLabelMap: { [key: string]: string }
  popOverContent: ReactNode
  handleSortDirection: (direction: number) => void
  handleClearFilter: () => void
  handleUpdateSortField: (e: React.ChangeEvent<HTMLSelectElement>) => void
  handleUpdateFilterField: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onIconClick: (isInfo: boolean) => void
}

const OverviewInputFieldsWrapper = ({
  sortDirection,
  popOverContent,
  sortByField,
  sortFieldLabelMap,
  filterByField,
  filterFieldLabelMap,
  handleSortDirection,
  handleClearFilter,
  handleUpdateSortField,
  handleUpdateFilterField,
  onIconClick,
}: Props): ReactElement => {
  const defaultBoxProps = {
    bgColor: useColorModeValue("whiteAlpha.600", "blackAlpha.900"),
    borderRadius: "10px",
    p: "10px",
    boxShadow: "var(--shadow)",
  }
  const defaultSelectProps = {
    fontSize: { base: "12px", sm: "13px", md: "16px" },
    variant: "filled",
    focusBorderColor: useColorModeValue("blackAlpha.900", "rosybrown"),
  }

  return (
    <Flex
      gridGap="15px"
      justifyContent="space-between"
      alignItems={{ base: "baseline", xl: "center" }}
    >
      <Stack
        spacing={{ base: "10px", xl: "15px" }}
        direction={{ base: "column", xl: "row" }}
      >
        <HStack spacing="5px">
          <Box {...defaultBoxProps}>
            <IconButton
              _focus={{ boxShadow: "none" }}
              aria-label="sort"
              title={sortDirection > 0 ? "Sort Ascending" : "Sort Descending"}
              icon={
                sortDirection > 0 ? <FaSortAmountUp /> : <FaSortAmountDownAlt />
              }
              onClick={() => handleSortDirection(sortDirection * -1)}
            />
          </Box>
          <Box {...defaultBoxProps} maxW={{ base: "200px", md: "100%" }}>
            <Select
              {...defaultSelectProps}
              value={sortByField}
              onChange={(e) => handleUpdateSortField(e)}
            >
              {Object.entries(sortFieldLabelMap).map(
                ([value, label], index) => {
                  return (
                    <option key={index} value={value}>
                      Sort by {label}
                    </option>
                  )
                },
              )}
            </Select>
          </Box>
        </HStack>
        <HStack spacing="5px">
          <Box {...defaultBoxProps}>
            <IconButton
              _focus={{ boxShadow: "none" }}
              aria-label="sort"
              // TO-DO: union the enums and use this as general type
              disabled={filterByField === "noFilter"}
              title={filterByField === "noFilter" ? "Filter" : "Clear Filter"}
              icon={filterByField === "noFilter" ? <FaFilter /> : <FaUndo />}
              onClick={handleClearFilter}
            />
          </Box>
          <Box {...defaultBoxProps} maxW={{ base: "200px", md: "100%" }}>
            <Select
              {...defaultSelectProps}
              value={filterByField}
              onChange={(e) => handleUpdateFilterField(e)}
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
          </Box>
        </HStack>
      </Stack>
      <Stack
        spacing="5px"
        alignItems="center"
        direction={{ base: "column", xl: "row" }}
      >
        <Box {...defaultBoxProps}>
          <IconButtonPopover
            IconButtonProps={{
              "aria-label": "Configure Settings",
              size: "md",
              icon: <BsSliders />,
              title: "Configure Settings",
              _focus: { boxShadow: "none" },
            }}
            PopoverBodyContent={popOverContent}
          />
        </Box>
        <Box {...defaultBoxProps}>
          <IconButton
            aria-label="Help"
            size="md"
            title="Need Help?"
            _focus={{ boxShadow: "none" }}
            icon={<FaInfoCircle />}
            onClick={() => onIconClick(true)}
          />
        </Box>
        <Box {...defaultBoxProps} display={{ base: "flex", xl: "none" }}>
          <IconButton
            _focus={{ boxShadow: "none" }}
            aria-label="dashboard"
            title="Dashboard"
            icon={<FaLayerGroup color="#cc3a59" />}
            onClick={() => onIconClick(false)}
          />
        </Box>
      </Stack>
    </Flex>
  )
}

export default OverviewInputFieldsWrapper
