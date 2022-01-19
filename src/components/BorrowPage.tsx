import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  IconButton,
  Progress,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { FaHandHoldingMedical, FaInfoCircle } from "react-icons/fa"
import React, { ReactElement, useRef } from "react"
import AdvancedOptions from "./AdvancedOptions"
import { AppState } from "../state"
import BorrowForm from "./BorrowForm"
import { BsSliders } from "react-icons/bs"
import { IconButtonPopover } from "./Popover"
import StakeDetails from "./StakeDetails"
import roseIcon from "../assets/icons/rose.svg"
import styles from "./BorrowPage.module.scss"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

const BorrowPage = (): ReactElement => {
  const { t } = useTranslation()
  const { userDarkMode } = useSelector((state: AppState) => state.user)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = useRef<HTMLButtonElement>(null)
  return (
    <div className={styles.borrowPage}>
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>How TF do I Borrow?</DrawerHeader>
          <DrawerBody>Put SOme helpful shit here</DrawerBody>
          <DrawerFooter>Helpful footer shit</DrawerFooter>
        </DrawerContent>
      </Drawer>
      <div className={styles.borrowTabs}>
        <Tabs
          isFitted
          variant="primary"
          bgColor={
            userDarkMode ? "rgba(28, 29, 33, 0.3)" : "rgba(242, 236, 236, 0.8)"
          }
          borderRadius="10px"
          height="100%"
        >
          <TabList mb="1em">
            <Tab>{t("borrow")}</Tab>
            <Tab>{t("Repay")}</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Box
                bg="var(--secondary-background)"
                border="1px solid var(--outline)"
                borderRadius="10px"
                p="15px"
              >
                <Flex justifyContent="space-between" alignItems="center">
                  <Text
                    as="h3"
                    fontWeight="700"
                    fontSize="30px"
                    lineHeight="30px"
                  >
                    Borrow RUSD
                  </Text>
                  <IconButtonPopover
                    IconButtonProps={{
                      "aria-label": "Configure Settings",
                      variant: "outline",
                      size: "lg",
                      icon: <BsSliders size="25px" />,
                      title: "Configure Settings",
                    }}
                    PopoverBodyContent={<AdvancedOptions />}
                  />
                </Flex>
              </Box>
              <BorrowForm
                borrowToken={{ token: "RUSD", tokenIcon: roseIcon }}
                collateralToken={{ token: "ROSE", tokenIcon: roseIcon }}
                max="100"
                submitButtonLabel="Add Collateral & Borrow"
                formDescription={
                  <Flex justifyContent="space-between">
                    <Box>1 RUSD = 1 USD</Box>
                    <Box>1 ROSE = 0.23 RUSD</Box>
                  </Flex>
                }
                handleSubmit={() => Promise.resolve()}
              />
            </TabPanel>
            <TabPanel>
              <div className={styles.titleWrapper}>
                <h3 className={styles.borrowTitle}>Repay RUSD</h3>
              </div>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
      <div className={styles.borrowDetailsContainer}>
        <StakeDetails
          extraStakeDetailChild={
            <>
              <FaHandHoldingMedical
                size="35px"
                color="#cc3a59"
                title="Your Position Health."
              />
              <Box width={200}>
                <Progress colorScheme="green" height="30px" value={80} />
              </Box>
            </>
          }
          balanceView={{
            title: t("Balances"),
            items: [
              {
                tokenName: "ROSE",
                icon: roseIcon,
                amount: "0.0",
              },
              {
                tokenName: "RUSD",
                icon: roseIcon,
                amount: "0.0",
              },
            ],
          }}
          stakedView={{
            title: t("My Open Position"),
            items: [
              {
                tokenName: "ROSE Collateral Deposited",
                icon: roseIcon,
                amount: "0.0",
              },
              {
                tokenName: "RUSD Borrowed",
                icon: roseIcon,
                amount: "0.0",
              },
            ],
          }}
          stats={[
            {
              statLabel: "Liquidation Price",
              statValue: "0.0",
            },
            {
              statLabel: "RUSD Left to Borrow",
              statValue: "0.0",
            },
            {
              statLabel: "Maximum collateral ratio",
              statValue: "0.0",
            },
            {
              statLabel: "Liquidation fee",
              statValue: "0.0",
            },
            {
              statLabel: "Borrow fee",
              statValue: "0.0",
            },
            {
              statLabel: "Interest",
              statValue: "0.0",
            },
            {
              statLabel: (
                <Box mt="20px">
                  <IconButton
                    ref={btnRef}
                    onClick={onOpen}
                    aria-label="Get Help"
                    variant="outline"
                    size="md"
                    icon={<FaInfoCircle />}
                    title="Get Help"
                  />
                </Box>
              ),
              statValue: <Box mt="20px">Need Help?</Box>,
            },
          ]}
        />
      </div>
    </div>
  )
}

export default BorrowPage
