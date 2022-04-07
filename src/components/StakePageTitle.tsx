import { Box, Flex, Text } from "@chakra-ui/react"
import React, { ReactElement } from "react"
import { AppState } from "../state"
import classNames from "classnames"
import styles from "./StakePageTitle.module.scss"
import { useSelector } from "react-redux"

const StakePageTitle = ({ title }: { title: string }): ReactElement => {
  const { userDarkMode } = useSelector((state: AppState) => state.user)
  const { stakeStats } = useSelector((state: AppState) => state.application)

  return (
    <Box bg="var(--secondary-background)" borderRadius="10px" p="20px" w="100%">
      <Flex
        justifyContent={{ base: "center", sm: "space-between" }}
        alignItems="center"
        flexDirection={{ base: "column", sm: "row" }}
        gridGap="10px"
      >
        <Text as="h3" fontWeight={700} fontSize="28px" lineHeight="30px">
          {title}
        </Text>
        <Box
          className={classNames(
            styles.pill,
            { [styles.glowPill]: userDarkMode },
            { [styles.colorPill]: !userDarkMode },
          )}
        >
          <Box>
            1 stROSE ≈{" "}
            {stakeStats?.priceRatio
              ? (+stakeStats?.priceRatio).toFixed(5)
              : "-"}{" "}
            ROSE
          </Box>
        </Box>
      </Flex>
    </Box>
  )
}

export default StakePageTitle
