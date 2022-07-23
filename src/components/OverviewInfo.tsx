import {
  Box,
  Collapse,
  Divider,
  Flex,
  Grid,
  GridItem,
  IconButton,
  List,
  ListIcon,
  ListItem,
  Text,
} from "@chakra-ui/react"
import React, { ReactElement, ReactNode, useState } from "react"
import { BsChevronExpand } from "react-icons/bs"
import { IconType } from "react-icons"

interface InfoSection {
  title: string
  items: {
    icon: IconType | undefined
    text: ReactNode
  }[]
}

interface Props {
  sections: InfoSection[]
  infoType: "Farm" | "Pool" | "Borrow"
}

const OverviewInfo = ({ sections, infoType }: Props): ReactElement => {
  const [howTo, setHowTo] = useState<{ [key: number]: boolean }>(
    sections.reduce(
      (acc, _, index) => ({
        ...acc,
        [index]: index === 0 ? true : false,
      }),
      {},
    ),
  )

  return (
    <Box p="30px" borderRadius="10px" bg="gray.900">
      <Grid gridTemplateRows="auto" rowGap="15px">
        <GridItem>
          <Text fontSize="25px" fontWeight="700">
            {infoType} Information
          </Text>
        </GridItem>
        <Divider />
        {sections.map(({ title, items }, i) => {
          return (
            <GridItem key={i}>
              <Flex alignItems="center">
                <Text fontWeight={700} fontSize="20px" color="gray.100">
                  {title}
                </Text>
                <IconButton
                  onClick={() =>
                    setHowTo((prev) => ({ ...prev, [i]: !howTo[i] }))
                  }
                  aria-label={howTo[i] ? "Collapse" : "Expand"}
                  variant="solid"
                  size="xs"
                  marginLeft="5px"
                  borderRadius="8px"
                  icon={<BsChevronExpand />}
                  title={howTo[i] ? "Collapse" : "Expand"}
                />
              </Flex>
              <Collapse in={howTo[i]} animateOpacity>
                <List color="gray.300" spacing={3}>
                  {items.map(({ icon, text }, j) => {
                    return (
                      <ListItem key={j} pt="10px">
                        <ListIcon as={icon} color="red.500" />
                        {text}
                      </ListItem>
                    )
                  })}
                </List>
              </Collapse>
              {i !== sections.length - 1 && <Divider m="10px 0" />}
            </GridItem>
          )
        })}
      </Grid>
    </Box>
  )
}

export default OverviewInfo
