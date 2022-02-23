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
    <Box p="30px" borderRadius="10px" background="var(--background-element)">
      <Grid gridTemplateRows="auto" rowGap="15px">
        <GridItem>
          <Text fontSize="25px" fontWeight="700">
            {infoType} Information
          </Text>
        </GridItem>
        <Divider />
        {sections.map(({ title, items }, i) => {
          return (
            <>
              <GridItem key={i}>
                <Flex>
                  <Text mb="10px" fontWeight="600" fontSize="20px">
                    {title}
                  </Text>
                  <IconButton
                    onClick={() =>
                      setHowTo((prev) => ({ ...prev, [i]: !howTo[i] }))
                    }
                    aria-label={howTo[i] ? "Collapse" : "Expand"}
                    variant="outline"
                    size="xs"
                    marginLeft="5px"
                    icon={<BsChevronExpand />}
                    title={howTo[i] ? "Collapse" : "Expand"}
                  />
                </Flex>
                <Collapse in={howTo[i] ? true : false} animateOpacity>
                  <List color="var(--text-lighter)" spacing={3}>
                    {items.map(({ icon, text }, j) => {
                      return (
                        <ListItem key={j}>
                          <ListIcon as={icon} color="var(--text-primary)" />
                          {text}
                        </ListItem>
                      )
                    })}
                  </List>
                </Collapse>
              </GridItem>
              {i !== sections.length - 1 && <Divider />}
            </>
          )
        })}
      </Grid>
    </Box>
  )
}

export default OverviewInfo
