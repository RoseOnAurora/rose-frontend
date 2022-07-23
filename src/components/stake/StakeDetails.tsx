import {
  Box,
  Center,
  Collapse,
  Flex,
  Grid,
  GridItem,
  IconButton,
  Image,
  Skeleton,
  Stack,
  Text,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react"
import React, { ReactElement, ReactNode } from "react"
import { BsChevronExpand } from "react-icons/bs"
import emptyListGraphic from "../../assets/empty-list.svg"

interface StakeStatLabel {
  statLabel: ReactNode
  statTooltip?: string
  statPopOver?: ReactNode
  onClick?: () => void
}
interface StakeStats {
  statLabel: string
  statValue: string
  statTooltip?: string
  statPopOver?: ReactNode
}
interface StakedDetailsView {
  items: {
    tokenName: string
    amount: string
    icon: string
  }[]
  title?: string
}
interface Props {
  balanceView: StakedDetailsView
  stakedView: StakedDetailsView
  extraStakeDetailChild?: ReactNode
  bottom?: ReactNode
  stats?: StakeStats[]
  loading?: boolean
}

const StakeBalanceView = ({
  items,
  title,
}: StakedDetailsView): ReactElement => {
  return (
    <Box bg="bgDark" borderRadius="8px" p="28px">
      <Box textAlign="left" mb="20px">
        <Text fontSize="25px" fontWeight={700} lineHeight="30px">
          {title}
        </Text>
      </Box>
      {items.length ? (
        <Stack spacing="10px">
          {items.map(({ icon, tokenName, amount }) => {
            return (
              <Flex
                key={tokenName}
                justifyContent="space-between"
                alignItems="center"
              >
                <Flex alignItems="center" gap="5px">
                  <Box boxSize="30px">
                    <Image src={icon} objectFit="cover" w="full" />
                  </Box>
                  <Text
                    fontSize="15px"
                    fontWeight={500}
                    lineHeight="21px"
                    color="gray.50"
                  >
                    {tokenName}
                  </Text>
                </Flex>
                <Text
                  fontSize={{
                    base: "13px",
                    xl: "14px",
                  }}
                  fontWeight={700}
                  lineHeight="18px"
                >
                  {amount}
                </Text>
              </Flex>
            )
          })}
        </Stack>
      ) : (
        <Center w="full" isolation="isolate" pos="relative" mt="15px">
          <Text
            zIndex={2}
            color="gray.200"
            fontWeight={500}
            fontSize="16px"
            lineHeight="16px"
            textAlign="center"
            pt="28px"
            pb="14px"
          >
            {`${title || "Your Balances"} will appear here.`}
          </Text>
          <Box pos="absolute" top="0px" opacity={0.6}>
            <Image src={emptyListGraphic} />
          </Box>
        </Center>
      )}
    </Box>
  )
}

const StakeStatLabel = (props: StakeStatLabel): ReactElement => {
  const { statLabel, statTooltip, statPopOver, onClick } = props
  if (statTooltip) {
    return (
      <Tooltip bgColor="red.500" closeOnClick={false} label={statTooltip}>
        <Text
          fontSize={{
            base: "14px",
            lg: "15px",
            xl: "16px",
          }}
          cursor="help"
          color="gray.300"
          fontWeight={400}
        >
          {statLabel}
        </Text>
      </Tooltip>
    )
  } else if (statPopOver) {
    return (
      <Flex alignItems="center">
        <Text
          fontSize={{
            base: "14px",
            lg: "15px",
            xl: "16px",
          }}
          color="gray.300"
          fontWeight={400}
        >
          {statLabel}
        </Text>
        <IconButton
          onClick={onClick}
          aria-label="Expand"
          variant="solid"
          borderRadius="5px"
          size="xs"
          marginLeft="5px"
          icon={<BsChevronExpand />}
          title="Expand"
        />
      </Flex>
    )
  } else {
    return (
      <Text
        fontSize={{
          base: "14px",
          lg: "15px",
          xl: "15px",
        }}
        color="gray.300"
        fontWeight={400}
      >
        {statLabel}
      </Text>
    )
  }
}
const StakeDetails = (props: Props): ReactElement => {
  const {
    balanceView,
    stakedView,
    stats,
    extraStakeDetailChild,
    bottom,
    loading,
  } = props
  const { isOpen, onToggle } = useDisclosure()
  return (
    <Grid rowGap="25px" templateColumns="repeat(1, 100%)">
      {extraStakeDetailChild && (
        <GridItem>
          <Skeleton borderRadius="10px" isLoaded={!loading} fadeDuration={1}>
            {extraStakeDetailChild}
          </Skeleton>
        </GridItem>
      )}
      <GridItem>
        <Skeleton borderRadius="10px" isLoaded={!loading} fadeDuration={1}>
          <StakeBalanceView
            items={balanceView.items}
            title={balanceView.title}
          />
        </Skeleton>
      </GridItem>
      <GridItem>
        <Skeleton borderRadius="10px" isLoaded={!loading} fadeDuration={1}>
          <StakeBalanceView items={stakedView.items} title={stakedView.title} />
        </Skeleton>
      </GridItem>
      {stats && (
        <GridItem>
          <Skeleton borderRadius="10px" isLoaded={!loading} fadeDuration={1}>
            <Box bg="bgDark" borderRadius="8px" p="28px">
              <Grid rowGap="15px" gridTemplateRows="auto">
                {stats.map(
                  (
                    { statLabel, statValue, statTooltip, statPopOver },
                    index,
                  ) => {
                    return (
                      <GridItem key={index}>
                        <Flex
                          fontSize="18px"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <StakeStatLabel
                            statLabel={statLabel}
                            statTooltip={statTooltip}
                            statPopOver={statPopOver}
                            onClick={onToggle}
                          />
                          <Text
                            fontSize={{
                              base: "13px",
                              lg: "14px",
                            }}
                            fontWeight={700}
                            color="gray.50"
                          >
                            {statValue}
                          </Text>
                        </Flex>
                        {statPopOver && (
                          <Collapse in={isOpen} animateOpacity>
                            {statPopOver}
                          </Collapse>
                        )}
                      </GridItem>
                    )
                  },
                )}
              </Grid>
            </Box>
          </Skeleton>
        </GridItem>
      )}
      {bottom && (
        <GridItem>
          <Skeleton borderRadius="10px" isLoaded={!loading} fadeDuration={1}>
            <Box bg="bgDark" borderRadius="8px" p="24px">
              {bottom}
            </Box>
          </Skeleton>
        </GridItem>
      )}
    </Grid>
  )
}

export default StakeDetails
