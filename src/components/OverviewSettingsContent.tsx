import {
  Box,
  Divider,
  Grid,
  GridItem,
  Radio,
  RadioGroup,
  Switch,
  Text,
} from "@chakra-ui/react"
import React, { ReactElement } from "react"

type Preferences = {
  visibleFields: {
    [key: string]: number
  }
  filterField: string
  sortField: string
}

type Props = {
  sortFieldLabelMap: { [key: string]: string }
  filterFieldLabelMap: { [key: string]: string }
  preferences: Preferences
  updateVisibleFields: (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string,
  ) => void
  updateSortPreferences: (e: React.ChangeEvent<HTMLInputElement>) => void
  updateFilterPreferences: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const OverviewSettingsContent = ({
  sortFieldLabelMap,
  filterFieldLabelMap,
  preferences,
  updateVisibleFields,
  updateSortPreferences,
  updateFilterPreferences,
}: Props): ReactElement => {
  const defaultGridProps = {
    gridTemplateRows: "auto",
    gridTemplateColumns: "repeat(2, 1fr)",
    rowGap: "5px",
  }
  return (
    <Box p="15px">
      <Grid gridTemplateRows="auto" rowGap="15px">
        <GridItem>
          <Text fontSize="23px" fontWeight="700">
            Your Preferences
          </Text>
        </GridItem>
        <Divider />
        <GridItem>
          <Text mb="10px" fontWeight="600">
            Visible Fields
          </Text>
          <Grid {...defaultGridProps}>
            {Object.entries(sortFieldLabelMap).map(([value, label], index) => (
              <GridItem rowSpan={1} colSpan={1} key={index}>
                <Grid templateColumns="repeat(2, 1fr)">
                  <GridItem>
                    <Text fontSize="14px">{label}</Text>
                  </GridItem>
                  <GridItem justifySelf="flex-end" mr="15px">
                    <Switch
                      onChange={(e) => updateVisibleFields(e, value)}
                      value={preferences.visibleFields[value]}
                      isChecked={
                        preferences.visibleFields[value] > 0 ? true : false
                      }
                      size="sm"
                      colorScheme="green"
                    />
                  </GridItem>
                </Grid>
              </GridItem>
            ))}
          </Grid>
        </GridItem>
        <Divider />
        <GridItem>
          <Text mb="10px" fontWeight="600">
            Default Sorting Field
          </Text>
          <RadioGroup value={preferences.sortField} size="sm">
            <Grid {...defaultGridProps}>
              {Object.entries(sortFieldLabelMap).map(
                ([value, label], index) => (
                  <GridItem rowSpan={1} colSpan={1} key={index} fontSize="12px">
                    <Radio
                      onChange={(e) => updateSortPreferences(e)}
                      value={value}
                      colorScheme="green"
                    >
                      {label}
                    </Radio>
                  </GridItem>
                ),
              )}
            </Grid>
          </RadioGroup>
        </GridItem>
        <Divider />
        <GridItem>
          <Text mb="10px" fontWeight="600">
            Default Filter Field
          </Text>
          <RadioGroup size="sm" value={preferences.filterField}>
            <Grid {...defaultGridProps}>
              {Object.entries(filterFieldLabelMap).map(
                ([value, label], index) => (
                  <GridItem rowSpan={1} colSpan={1} key={index}>
                    <Radio
                      onChange={(e) => updateFilterPreferences(e)}
                      value={value}
                      colorScheme="green"
                    >
                      {label}
                    </Radio>
                  </GridItem>
                ),
              )}
            </Grid>
          </RadioGroup>
        </GridItem>
      </Grid>
    </Box>
  )
}

export default OverviewSettingsContent
