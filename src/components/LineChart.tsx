/* eslint @typescript-eslint/no-unsafe-assignment: 0 */
/* eslint @typescript-eslint/no-explicit-any: 0 */
/* eslint @typescript-eslint/no-unsafe-member-access: 0 */
/* eslint @typescript-eslint/no-unsafe-return: 0 */
import "chartjs-adapter-moment"
import React, { ReactElement, useMemo } from "react"
import { Line } from "react-chartjs-2"
import { useColorModeValue } from "@chakra-ui/react"

interface Props {
  chart: Chart
}

interface Chart {
  datasets: ChartInfo
  timeUnit: string
}

interface ChartInfo {
  label: string
  data: AxisData[]
}

interface AxisData {
  x: number
  y: number
}

interface ChartColors {
  datasets: string
  grid: string
  ticks: string
}

const LineChart = (props: Props): ReactElement => {
  const { chart } = props
  const colors = {
    datasets: useColorModeValue("#070605", "#f8f9fa"),
    grid: useColorModeValue("rgba(0, 0, 0, .2)", "rgba(255, 255, 255, .2)"),
    ticks: useColorModeValue("#070605", "#f8f9fa"),
  }
  const { data, options } = configs(chart, colors)
  return useMemo(() => <Line data={data} options={options} />, [data, options])
}

function configs(chart: Chart, colors: ChartColors): { [key: string]: any } {
  return {
    data: {
      datasets: [
        {
          label: chart.datasets.label,
          tension: 0,
          pointRadius: 1,
          pointBorderColor: "transparent",
          pointBackgroundColor: colors.datasets,
          borderColor: colors.datasets,
          borderWidth: 4,
          backgroundColor: "transparent",
          fill: true,
          data: chart.datasets.data,
          maxBarThickness: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context: { [key: string]: any }) => {
              let label = context.dataset.label || ""
              if (label) {
                label += ": "
              }
              if (context.parsed.y !== null) {
                label += new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumSignificantDigits: 3,
                }).format(context.parsed.y)
              }
              return label
            },
          },
        },
      },
      interaction: {
        intersect: false,
        mode: "index",
      },
      scales: {
        y: {
          grid: {
            drawBorder: false,
            display: true,
            drawOnChartArea: true,
            drawTicks: false,
            borderDash: [3, 3],
            color: colors.grid,
          },
          ticks: {
            display: true,
            color: colors.ticks,
            padding: 10,
            font: {
              size: 12,
              weight: 300,
              family: "Neue Machina, sans-serif",
              style: "normal",
              lineHeight: 2,
            },
            callback: (value: number) => "$" + value.toFixed(3),
          },
        },
        x: {
          type: "time",
          time: {
            unit: chart.timeUnit,
          },
          grid: {
            drawBorder: false,
            display: false,
            drawOnChartArea: false,
            drawTicks: false,
            borderDash: [5, 5],
          },
          ticks: {
            display: true,
            color: colors.ticks,
            padding: 10,
            autoSkip: true,
            maxTicksLimit: 7,
            font: {
              size: 14,
              weight: 300,
              family: "Neue Machina, sans-serif",
              style: "normal",
              lineHeight: 2,
            },
          },
        },
      },
    },
  }
}

export default LineChart
