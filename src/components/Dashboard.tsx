import { Box, Flex, Stack, Text } from "@chakra-ui/react"
import React, { ReactElement, ReactNode } from "react"
import { FaLayerGroup } from "react-icons/fa"

interface DashboardProps {
  dashboardContent: ReactNode
  dashboardName: string
}

const Dashboard = ({
  dashboardContent,
  dashboardName,
}: DashboardProps): ReactElement => {
  return (
    <Stack spacing="10px">
      <Box
        background="var(--background-element)"
        borderRadius="10px"
        p="10px"
        boxShadow="var(--shadow)"
      >
        <Box
          background="var(--secondary-background)"
          p="15px"
          borderRadius="10px"
        >
          <Flex justifyContent="space-between" alignItems="center">
            <Text fontSize="35px" fontWeight="700" as="h2">
              {dashboardName}
            </Text>
            <FaLayerGroup color="#cc3a59" size="45px" title="Dashboard" />
          </Flex>
        </Box>
      </Box>
      <Box
        background="var(--background-element)"
        borderRadius="10px"
        p="10px"
        boxShadow="var(--shadow)"
      >
        {dashboardContent}
      </Box>
    </Stack>
  )
}

export default Dashboard
