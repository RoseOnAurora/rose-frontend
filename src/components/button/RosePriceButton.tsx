import {
  Box,
  Button,
  Flex,
  Icon,
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList,
  Radio,
  RadioGroup,
  Spinner,
  Stack,
  Stat,
  StatArrow,
  StatGroup,
  StatNumber,
  Text,
} from "@chakra-ui/react"
import { ROSE, RUSD, SROSE, TRANSACTION_TYPES } from "../../constants"
import React, { ReactElement, useState } from "react"
import {
  RoseIconSmall,
  RusdIconSmall,
  StRoseIconSmall,
} from "../../constants/icons"
import { AppState } from "../../state"
import { BsClock } from "react-icons/bs"
import LineChart from "../LineChart"
import useAddTokenToMetamask from "../../hooks/useAddTokenToMetamask"
import { useSelector } from "react-redux"

export default function RosePriceButton(): ReactElement {
  const { rosePriceHistory, lastTransactionTimes } = useSelector(
    (state: AppState) => state.application,
  )
  const addRoseToken = useAddTokenToMetamask(ROSE)
  const addStRoseToken = useAddTokenToMetamask(SROSE)
  const addRusdToken = useAddTokenToMetamask(RUSD)
  const [timeUnit, setTimeUnit] = useState("hour")
  const priceChartLastUpdate = Math.round(
    (Date.now() - lastTransactionTimes[TRANSACTION_TYPES.ROSE_PRICE]) /
      1000 /
      60,
  )
  const formattedPriceData =
    timeUnit === "hour" && rosePriceHistory
      ? rosePriceHistory.slice(-rosePriceHistory.length / 6)
      : rosePriceHistory
  const priceChange = formattedPriceData
    ? ((formattedPriceData[formattedPriceData.length - 1].price -
        formattedPriceData[0].price) /
        formattedPriceData[0].price) *
      100
    : 0

  return (
    <Box mr="10px">
      <Menu isLazy>
        <MenuButton
          variant="outline"
          lineHeight="unset"
          whiteSpace="nowrap"
          as={Button}
          fontSize={{ base: "13px", md: "16px" }}
          leftIcon={<RoseIconSmall />}
        >
          {rosePriceHistory?.length
            ? `$${Number(
                rosePriceHistory[rosePriceHistory.length - 1].price,
              ).toFixed(3)}`
            : "-"}
        </MenuButton>
        <MenuList zIndex={10} boxShadow="md" bg="gray.900">
          <Box p="5px" textAlign="center" height="100%">
            {formattedPriceData ? (
              <>
                <RadioGroup value={timeUnit} onChange={setTimeUnit}>
                  <Stack spacing={5} direction="row" p="10px" color="gray.200">
                    <Text color="gray.50">Rose Price Chart</Text>
                    <Radio colorScheme="green" value="hour">
                      24h
                    </Radio>
                    <Radio colorScheme="green" value="day">
                      7d
                    </Radio>
                  </Stack>
                </RadioGroup>
                <Box height="10.5rem">
                  <LineChart
                    chart={{
                      datasets: {
                        label: "ROSE 🌹 Price",
                        data: formattedPriceData.map(({ time, price }) => ({
                          x: time,
                          y: price,
                        })),
                      },
                      timeUnit,
                    }}
                  />
                </Box>
                <Flex justifyContent="space-between" p="10px" mt="2px">
                  <StatGroup>
                    <Stat>
                      <StatNumber fontSize="16px">
                        <StatArrow
                          type={priceChange > 0 ? "increase" : "decrease"}
                        />
                        {priceChange.toFixed(2)}%
                      </StatNumber>
                    </Stat>
                  </StatGroup>
                  <Flex
                    alignItems="center"
                    gridGap="5px"
                    fontSize="12px"
                    color="gray.100"
                  >
                    <BsClock color="inherit" />
                    <Text as="span" color="gray.300">
                      updated{" "}
                      {priceChartLastUpdate
                        ? `${priceChartLastUpdate} min ago`
                        : "just now"}{" "}
                    </Text>
                  </Flex>
                </Flex>
              </>
            ) : (
              <Spinner size="xl" color="red.500" />
            )}
          </Box>
          <MenuDivider />
          <MenuGroup title="ROSE TOKEN" color="gray.100">
            <MenuItem
              icon={
                <Icon w="1.5em" h="1.5em" viewBox="0 0 125 99" fill="none">
                  <g clipPath="url(#clip0)">
                    <path
                      d="M17.9456 95.4377C17.9456 87.5692 24.3639 81.1886 32.279 81.1886H42.1944C48.7998 81.1886 54.1389 86.5105 54.1389 93.0628C54.1389 96.339 51.4621 99 48.1666 99H21.5289C19.543 99 17.9456 97.412 17.9456 95.4377Z"
                      fill="#D0C5F8"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M54.2684 93.2202C54.2684 93.163 54.2684 93.1201 54.2684 93.0628C54.2684 86.4962 48.915 81.1886 42.3239 81.1886H32.4085C31.2573 81.1886 30.1348 81.3173 29.0698 81.5748C35.9343 87.7409 44.6409 91.9183 54.2684 93.2202Z"
                      fill="#BBB3F4"
                    />
                    <path
                      d="M103.745 95.4377C103.745 87.5692 97.3262 81.1886 89.4112 81.1886H79.4958C72.8903 81.1886 67.5513 86.5105 67.5513 93.0628C67.5513 96.339 70.228 99 73.5235 99H100.176C102.133 99 103.745 97.412 103.745 95.4377Z"
                      fill="#D0C5F8"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M34.2793 99C28.451 96.711 23.6588 92.3762 20.8094 86.8825C19.0105 89.2717 17.9456 92.2188 17.9456 95.4377C17.9456 97.412 19.5573 99 21.5289 99H34.2793Z"
                      fill="url(#paint0_linear)"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M67.4218 93.2202C67.4218 93.163 67.4218 93.1201 67.4218 93.0628C67.4218 86.4962 72.7752 81.1886 79.3663 81.1886H89.2817C90.4329 81.1886 91.5554 81.3173 92.6204 81.5748C85.7415 87.7409 77.0349 91.9183 67.4218 93.2202Z"
                      fill="#BBB3F4"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M87.3965 99C93.2248 96.711 98.017 92.3762 100.866 86.8825C102.665 89.2717 103.73 92.2188 103.73 95.4377C103.73 97.412 102.118 99 100.147 99H87.3965Z"
                      fill="url(#paint1_linear)"
                    />
                    <path
                      d="M60.8738 90.0156C85.8997 90.0156 106.162 69.8722 106.162 45.0078C106.162 20.1434 85.8566 0 60.8738 0C35.8479 0 15.571 20.1434 15.571 45.0078C15.571 69.8722 35.8479 90.0156 60.8738 90.0156Z"
                      fill="#DDD5FF"
                    />
                    <path
                      d="M60.8739 84.8653C83.0072 84.8653 100.982 67.011 100.982 45.0221C100.982 23.0333 83.0072 5.16461 60.8739 5.16461C38.7118 5.16461 20.7662 23.0189 20.7662 45.0078C20.7662 66.9967 38.7118 84.8653 60.8739 84.8653Z"
                      fill="#CBC1F7"
                    />
                    <path
                      d="M60.8163 79.3288C79.8699 79.3288 95.3546 63.978 95.3546 45.0078C95.3546 26.0376 79.8987 10.6869 60.8163 10.6869C41.7626 10.6869 26.278 26.0376 26.278 45.0078C26.278 63.978 41.7626 79.3288 60.8163 79.3288Z"
                      fill="url(#paint2_linear)"
                    />
                    <g style={{ mixBlendMode: "screen" }} opacity="0.1">
                      <path
                        d="M61.6836 75.1655C61.6836 75.1655 51.0517 75.3672 41.9064 67.373C32.5662 59.2805 33.7572 52.1444 33.7572 52.1444C33.7572 52.1444 39.3107 54.2183 44.4594 61.4069C49.6081 68.5955 56.1301 73.0916 61.6836 75.1655Z"
                        fill="url(#paint3_linear)"
                      />
                    </g>
                    <path
                      style={{ mixBlendMode: "screen" }}
                      opacity="0.5"
                      d="M34.1642 28.4696C33.5166 32.4754 41.2014 32.0033 53.3905 31.6314C68.1269 31.1592 82.9352 43.7488 91.5842 34.7215C92.9945 33.2337 78.9201 13.6626 61.838 14.0345C44.8711 14.4923 34.7254 24.936 34.1642 28.4696Z"
                      fill="url(#paint4_linear)"
                    />
                    <path
                      d="M75.0489 33.8774H73.1925C71.1346 33.8774 69.494 35.537 69.494 37.5542V49.7289C69.494 51.7747 71.1634 53.4056 73.1925 53.4056H75.0489C77.1068 53.4056 78.7474 51.7461 78.7474 49.7289V37.5542C78.7762 35.537 77.1068 33.8774 75.0489 33.8774Z"
                      fill="#200D67"
                    />
                    <path
                      d="M75.9412 35.7516H75.0489C74.5308 35.7516 74.0991 36.1665 74.0991 36.6958V39.0134C74.0991 39.5285 74.5165 39.9577 75.0489 39.9577H75.9412C76.4592 39.9577 76.891 39.5428 76.891 39.0134V36.6958C76.891 36.1808 76.4592 35.7516 75.9412 35.7516Z"
                      fill="#CEF2E7"
                    />
                    <path
                      d="M48.7855 34.0062H46.9291C44.8712 34.0062 43.2306 35.6658 43.2306 37.683V49.8577C43.2306 51.9035 44.8999 53.5344 46.9291 53.5344H48.7855C50.8434 53.5344 52.484 51.8749 52.484 49.8577V37.683C52.5128 35.6658 50.8434 34.0062 48.7855 34.0062Z"
                      fill="#200D67"
                    />
                    <path
                      d="M49.6777 35.8804H48.7855C48.2674 35.8804 47.8357 36.2953 47.8357 36.8246V39.1422C47.8357 39.6572 48.253 40.0864 48.7855 40.0864H49.6777C50.1958 40.0864 50.6275 39.6716 50.6275 39.1422V36.8246C50.5988 36.3096 50.1814 35.8804 49.6777 35.8804Z"
                      fill="#CEF2E7"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M105.932 40.4298C105.687 38.7988 105.443 36.6815 105.069 35.0077C112.624 36.0949 108.465 35.4512 113.948 36.4526C116.754 37.1393 119.215 38.012 121.086 39.1994C122.971 40.3582 124.54 41.9892 124.914 44.1351C125.504 47.4113 123.1 50.3012 120.222 52.49C117.186 54.7934 112.825 57.0251 107.529 59.071C96.8801 63.2341 82.0286 66.9538 65.3782 69.3429C48.7567 71.7321 33.3295 72.3759 21.7736 71.446C16.0316 70.9738 11.0955 70.0869 7.4114 68.7707C3.92878 67.4688 0.647641 65.423 0.0863926 62.1468C-0.287773 60.0009 0.63325 58.0123 2.00039 56.3814C3.39632 54.7504 5.38227 53.1624 7.84313 51.7604C12.2899 49.2282 9.35418 50.6016 15.6718 47.7975C15.8157 49.6574 15.9884 51.2025 16.305 53.0337C11.9158 55.2369 14.1608 54.078 10.9372 55.9951C8.80732 57.2684 7.33944 58.4272 6.49038 59.4286C5.64131 60.4301 5.59814 61.0309 5.64131 61.3457C5.74205 61.8321 6.43281 62.9337 9.57005 64.0639C12.5202 65.1369 16.8519 65.9666 22.3348 66.4101C33.272 67.2971 48.2242 66.7249 64.5292 64.35C80.8342 62.0038 95.2395 58.3699 105.328 54.4357C110.393 52.4757 114.192 50.4585 116.639 48.6273C119.229 46.6673 119.503 45.437 119.416 44.9506C119.373 44.6358 119.1 44.0779 117.948 43.3626C116.812 42.6473 115.013 41.9606 112.537 41.3597C108.407 40.5871 111.789 41.2023 105.932 40.4298Z"
                      fill="#29E7F6"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M24.8389 69.1283C24.8677 68.742 25.2418 68.4845 25.6592 68.4988C31.1278 68.8565 37.4598 68.8851 44.3962 68.4988C44.8136 68.4702 45.1733 68.7706 45.1877 69.1283C45.2165 69.5146 44.8855 69.815 44.497 69.8436C37.5173 70.2299 31.099 70.2299 25.5584 69.8436C25.1123 69.815 24.7957 69.4717 24.8389 69.1283ZM48.8143 68.8708C48.7855 68.4845 49.0877 68.1841 49.505 68.1412C50.1958 68.0982 50.901 68.0267 51.6205 67.9695C52.0378 67.9266 52.412 68.2127 52.4408 68.5704C52.484 68.9566 52.1674 69.2857 51.7644 69.3C51.0449 69.3715 50.3541 69.4144 49.6489 69.4717C49.2172 69.5289 48.843 69.2571 48.8143 68.8708Z"
                      fill="white"
                    />
                    <path
                      opacity="0.16"
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M7.82874 51.7461C12.2755 49.2139 9.33979 50.5873 15.6574 47.7832C15.8013 49.6431 15.974 51.1882 16.2906 53.0194C11.9014 55.2225 14.1464 54.0637 10.9228 55.9808L7.82874 51.7461Z"
                      fill="black"
                    />
                    <path
                      opacity="0.16"
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M112.509 41.3454C108.407 40.5871 111.789 41.2023 105.932 40.4298C105.687 38.7988 105.443 36.6815 105.068 35.0077C112.624 36.0949 108.465 35.4512 113.948 36.4526L112.509 41.3454Z"
                      fill="black"
                    />
                  </g>
                  <defs>
                    <linearGradient
                      id="paint0_linear"
                      x1="21.0995"
                      y1="86.673"
                      x2="26.6002"
                      y2="98.8131"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#ACA4F1" />
                      <stop offset="1" stopColor="#D3C9F9" stopOpacity="0.4" />
                    </linearGradient>
                    <linearGradient
                      id="paint1_linear"
                      x1="91.2907"
                      y1="86.3394"
                      x2="96.791"
                      y2="98.4795"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#ACA4F1" />
                      <stop offset="1" stopColor="#D3C9F9" stopOpacity="0.4" />
                    </linearGradient>
                    <linearGradient
                      id="paint2_linear"
                      x1="60.8174"
                      y1="10.6907"
                      x2="60.8174"
                      y2="79.3279"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#322F82" />
                      <stop offset="1" stopColor="#6366F1" />
                    </linearGradient>
                    <linearGradient
                      id="paint3_linear"
                      x1="42.9705"
                      y1="68.5365"
                      x2="48.3956"
                      y2="62.758"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#D4E2FF" />
                      <stop offset="1" />
                    </linearGradient>
                    <linearGradient
                      id="paint4_linear"
                      x1="34.099"
                      y1="25.9943"
                      x2="91.7154"
                      y2="25.9943"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop />
                      <stop offset="1" stopColor="#6A9BFF" />
                    </linearGradient>
                    <clipPath id="clip0">
                      <rect width="125" height="99" fill="white" />
                    </clipPath>
                  </defs>
                </Icon>
              }
              href="https://dex.nearpad.io/swap?outputCurrency=0xdcD6D4e2B3e1D1E1E6Fa8C21C8A323DcbecfF970"
              as="a"
              margin="0"
              target="_blank"
              rel="noreferrer"
              fontSize="13px"
              color="gray.200"
            >
              Buy ROSE
            </MenuItem>
            <MenuItem
              icon={
                <Icon
                  width="1.5em"
                  height="1.5em"
                  fill="white"
                  fillRule="evenodd"
                  viewBox="0 0 252 300"
                  focusable="false"
                >
                  <path d="M151.818 106.866c9.177-4.576 20.854-11.312 32.545-20.541 2.465 5.119 2.735 9.586 1.465 13.193-.9 2.542-2.596 4.753-4.826 6.512-2.415 1.901-5.431 3.285-8.765 4.033-6.326 1.425-13.712.593-20.419-3.197m1.591 46.886l12.148 7.017c-24.804 13.902-31.547 39.716-39.557 64.859-8.009-25.143-14.753-50.957-39.556-64.859l12.148-7.017a5.95 5.95 0 003.84-5.845c-1.113-23.547 5.245-33.96 13.821-40.498 3.076-2.342 6.434-3.518 9.747-3.518s6.671 1.176 9.748 3.518c8.576 6.538 14.934 16.951 13.821 40.498a5.95 5.95 0 003.84 5.845zM126 0c14.042.377 28.119 3.103 40.336 8.406 8.46 3.677 16.354 8.534 23.502 14.342 3.228 2.622 5.886 5.155 8.814 8.071 7.897.273 19.438-8.5 24.796-16.709-9.221 30.23-51.299 65.929-80.43 79.589-.012-.005-.02-.012-.029-.018-5.228-3.992-11.108-5.988-16.989-5.988s-11.76 1.996-16.988 5.988c-.009.005-.017.014-.029.018-29.132-13.66-71.209-49.359-80.43-79.589 5.357 8.209 16.898 16.982 24.795 16.709 2.929-2.915 5.587-5.449 8.814-8.071C69.31 16.94 77.204 12.083 85.664 8.406 97.882 3.103 111.959.377 126 0m-25.818 106.866c-9.176-4.576-20.854-11.312-32.544-20.541-2.465 5.119-2.735 9.586-1.466 13.193.901 2.542 2.597 4.753 4.826 6.512 2.416 1.901 5.432 3.285 8.766 4.033 6.326 1.425 13.711.593 20.418-3.197"></path>
                  <path d="M197.167 75.016c6.436-6.495 12.107-13.684 16.667-20.099l2.316 4.359c7.456 14.917 11.33 29.774 11.33 46.494l-.016 26.532.14 13.754c.54 33.766 7.846 67.929 24.396 99.193l-34.627-27.922-24.501 39.759-25.74-24.231L126 299.604l-41.132-66.748-25.739 24.231-24.501-39.759L0 245.25c16.55-31.264 23.856-65.427 24.397-99.193l.14-13.754-.016-26.532c0-16.721 3.873-31.578 11.331-46.494l2.315-4.359c4.56 6.415 10.23 13.603 16.667 20.099l-2.01 4.175c-3.905 8.109-5.198 17.176-2.156 25.799 1.961 5.554 5.54 10.317 10.154 13.953 4.48 3.531 9.782 5.911 15.333 7.161 3.616.814 7.3 1.149 10.96 1.035-.854 4.841-1.227 9.862-1.251 14.978L53.2 160.984l25.206 14.129a41.926 41.926 0 015.734 3.869c20.781 18.658 33.275 73.855 41.861 100.816 8.587-26.961 21.08-82.158 41.862-100.816a41.865 41.865 0 015.734-3.869l25.206-14.129-32.665-18.866c-.024-5.116-.397-10.137-1.251-14.978 3.66.114 7.344-.221 10.96-1.035 5.551-1.25 10.854-3.63 15.333-7.161 4.613-3.636 8.193-8.399 10.153-13.953 3.043-8.623 1.749-17.689-2.155-25.799l-2.01-4.175z"></path>
                </Icon>
              }
              href="https://dexscreener.com/aurora/0xc6c3cc84eabd4643c382c988fa2830657fc70a6b"
              as="a"
              margin="0"
              target="_blank"
              rel="noreferrer"
              fontSize="13px"
              color="gray.200"
            >
              DexScreener
            </MenuItem>
            <MenuItem
              icon={
                <Icon
                  w="1.5em"
                  h="1.5em"
                  viewBox="0 0 276 276"
                  focusable="false"
                >
                  <path
                    fill="#8dc63f"
                    d="M276,137.39A138,138,0,1,1,137.39,0h0A138,138,0,0,1,276,137.39Z"
                    transform="translate(0 0)"
                  />
                  <path
                    fill="#f9e988"
                    d="M265.65,137.44a127.63,127.63,0,1,1-128.21-127h0A127.65,127.65,0,0,1,265.65,137.44Z"
                    transform="translate(0 0)"
                  />
                  <path
                    fill="#fff"
                    d="M140.35,18.66a70.18,70.18,0,0,1,24.53,0,74.75,74.75,0,0,1,23.43,7.85c7.28,4,13.57,9.43,19.83,14.52s12.49,10.3,18.42,16a93.32,93.32,0,0,1,15.71,19,108.28,108.28,0,0,1,11,22.17c5.33,15.66,7.18,32.53,4.52,48.62H257c-2.67-15.95-6.29-31.15-12-45.61A177.51,177.51,0,0,0,235.56,80,209.1,209.1,0,0,0,223.14,60a72.31,72.31,0,0,0-16.64-16.8c-6.48-4.62-13.93-7.61-21.14-10.45S171,27,163.48,24.84s-15.16-3.78-23.14-5.35Z"
                    transform="translate(0 0)"
                  />
                  <path
                    fill="#8bc53f"
                    d="M202.74,92.39c-9.26-2.68-18.86-6.48-28.58-10.32-.56-2.44-2.72-5.48-7.09-9.19-6.35-5.51-18.28-5.37-28.59-2.93-11.38-2.68-22.62-3.63-33.41-1C16.82,93.26,66.86,152.57,34.46,212.19c4.61,9.78,54.3,66.84,126.2,51.53,0,0-24.59-59.09,30.9-87.45C236.57,153.18,269.09,110.46,202.74,92.39Z"
                    transform="translate(0 0)"
                  />
                  <path
                    fill="#fff"
                    d="M213.64,131.2a5.35,5.35,0,1,1-5.38-5.32A5.36,5.36,0,0,1,213.64,131.2Z"
                    transform="translate(0 0)"
                  />
                  <path
                    fill="#009345"
                    d="M138.48,69.91c6.43.46,29.68,8,35.68,12.12-5-14.5-21.83-16.43-35.68-12.12Z"
                    transform="translate(0 0)"
                  />
                  <path
                    fill="#fff"
                    d="M144.6,106.58a24.68,24.68,0,1,1-24.69-24.67h0a24.68,24.68,0,0,1,24.68,24.66Z"
                    transform="translate(0 0)"
                  />
                  <path
                    fill="#58595b"
                    d="M137.28,106.8a17.36,17.36,0,1,1-17.36-17.36h0A17.36,17.36,0,0,1,137.28,106.8Z"
                    transform="translate(0 0)"
                  />
                  <path
                    fill="#8bc53f"
                    d="M233.63,142.08c-20,14.09-42.74,24.78-75,24.78-15.1,0-18.16-16-28.14-8.18-5.15,4.06-23.31,13.14-37.72,12.45S55,162,48.49,131.23C45.91,162,44.59,184.65,33,210.62c23,36.83,77.84,65.24,127.62,53C155.31,226.27,188,189.69,206.34,171c7-7.09,20.3-18.66,27.29-28.91Z"
                    transform="translate(0 0)"
                  />
                  <path
                    fill="#58595b"
                    d="M232.85,143c-6.21,5.66-13.6,9.85-21.12,13.55a134.9,134.9,0,0,1-23.7,8.63c-8.16,2.11-16.67,3.7-25.29,2.92s-17.43-3.71-23.14-10.17l.27-.31c7,4.54,15.08,6.14,23.12,6.37a108.27,108.27,0,0,0,24.3-2,132.71,132.71,0,0,0,23.61-7.3c7.63-3.15,15.18-6.8,21.68-12Z"
                    transform="translate(0 0)"
                  />
                </Icon>
              }
              href="https://www.coingecko.com/en/coins/rose"
              as="a"
              margin="0"
              target="_blank"
              rel="noreferrer"
              fontSize="13px"
              color="gray.200"
            >
              CoinGecko
            </MenuItem>
          </MenuGroup>
          <MenuDivider />
          <MenuGroup title="ADD TOKEN TO WALLET" color="gray.100">
            <MenuItem
              onClick={async () => {
                await addRoseToken()
              }}
              icon={<RoseIconSmall w="5" h="5" />}
              fontSize="13px"
              color="gray.200"
            >
              ROSE
            </MenuItem>
            <MenuItem
              icon={<StRoseIconSmall w="5" h="5" />}
              onClick={async () => await addStRoseToken()}
              fontSize="13px"
              color="gray.200"
            >
              stROSE
            </MenuItem>
            <MenuItem
              icon={<RusdIconSmall w="5" h="5" />}
              onClick={async () => await addRusdToken()}
              fontSize="13px"
              color="gray.200"
            >
              RUSD
            </MenuItem>
          </MenuGroup>
        </MenuList>
      </Menu>
    </Box>
  )
}
