import React, { ReactElement, ReactNode } from "react"
import {
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  TabsProps,
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
    <Tabs {...tabsProps} isFitted height="100%" size={{ base: "md", md: "lg" }}>
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
