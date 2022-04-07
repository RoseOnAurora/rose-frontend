import React, { ReactElement, ReactNode } from "react"
import {
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  TabsProps,
  useColorModeValue,
} from "@chakra-ui/react"

interface TabProps {
  name: string
  content: ReactNode
}

interface Props {
  tabsProps: Pick<TabsProps, "variant">
  tab1: TabProps
  tab2: TabProps
}

const TabsWrapper = ({ tabsProps, tab1, tab2 }: Props): ReactElement => {
  return (
    <Tabs
      {...tabsProps}
      isFitted
      height="100%"
      bg={useColorModeValue(
        "rgba(250, 250, 250, 0.6)",
        "rgba(28, 29, 33, 0.3)",
      )}
      borderRadius="10px"
    >
      <TabList mb="1em">
        <Tab>{tab1.name}</Tab>
        <Tab>{tab2.name}</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>{tab1.content}</TabPanel>
        <TabPanel>{tab2.content}</TabPanel>
      </TabPanels>
    </Tabs>
  )
}

export default TabsWrapper
