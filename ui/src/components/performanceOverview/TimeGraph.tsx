import { useEffect, useState } from "react"
import "chartjs-adapter-moment"
import { Card, CardContent, CircularProgress, Typography } from "@mui/material"
import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
  ChartDataset,
  CategoryScale,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  LineController,
} from "chart.js"
import "chart.js/auto"
import { Line } from "react-chartjs-2"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
)

const CARD_PROPERTY = {
  borderRadius: 3,
  boxShadow: 0,
}

export const DATASET_BASE: ChartDataset<"line"> = {
  label: "Insert Dataset Label",
  data: [],
  // tension: 0.1,
  borderColor: "rgba(75, 192, 192, 1)",
  borderWidth: 1,
  pointRadius: 1, // Set to 0 to hide the points
  // fill: {
  //   target: 'origin',
  //   above: 'rgb(255, 0, 0)',   // Area will be red above the origin
  //   below: 'rgb(0, 0, 255)'    // And blue below the origin
  // },
}

const CHART_OPTIONS_BASE: ChartOptions<"line"> = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
      // onClick: function (
      //   e: ChartEvent,
      //   legendItem: LegendItem,
      //   legend: LegendElement<"line">,
      // ) {
      //   const index = legendItem.datasetIndex!
      //   const ci = legend.chart
      //   if (ci.isDatasetVisible(index)) {
      //     ci.hide(index)
      //     legendItem.hidden = true
      //   } else {
      //     ci.show(index)
      //     legendItem.hidden = false
      //   }
      // },
    },
    title: {
      display: true,
      text: "Title",
    },
    // decimation: {
    //   enabled: true,
    //   algorithm: "lttb",
    //   samples: 500,

    //   // algorithm: "min-max",
    //   // threshold: 90,
    // },
  },
  indexAxis: "x",
  parsing: false,
  scales: {
    x: {
      type: "time",
      time: {
        displayFormats: {
          second: "YYYY-MM-DDTHH:mm",
          millisecond: "YYYY-MM-DDTHH:mm",
          minute: "YYYY-MM-DDTHH:mm",
          hour: "YYYY-MM-DDTHH:mm",
          day: "YYYY-MM-DDTHH:mm",
          week: "YYYY-MM-DDTHH:mm",
          month: "YYYY-MM-DDTHH:mm",
          quarter: "YYYY-MM-DDTHH:mm",
          year: "YYYY-MM-DDTHH:mm",
        },
      },
      // ticks: {
      //   maxTicksLimit: 90,
      // },
      title: {
        display: true,
        text: "Timestamp", // default value
      },
    },
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "Query Count",
      },
    },
  },
}

interface Props {
  // apiUri: string
  // datasetLabel: string
  xLabel: string
  yLabel: string
  graphTitle: string
  chartData: ChartData<"line">
}

/******************************************************************************
 * TIME GRAPH
 * @returns
 ******************************************************************************/
export default function TimeGraph({
  xLabel,
  yLabel,
  graphTitle,
  chartData,
}: Props) {
  const [loadStatus, setLoadStatus] = useState({
    loading: false,
    hasError: false,
  })
  const [options, setOptions] = useState<ChartOptions<"line">>({})

  useEffect(() => {
    updateData()
  }, [])

  const updateData = () => {
    setLoadStatus({ ...loadStatus, loading: true, hasError: false })
    const options: ChartOptions<"line"> = structuredClone(CHART_OPTIONS_BASE)
    options.scales!.x!.title!.text = xLabel
    options.scales!.y!.title!.text = yLabel
    options.plugins!.title!.text = graphTitle
    setOptions(options)
    setLoadStatus({ ...loadStatus, loading: false, hasError: false })
  }

  // console.log("render data", data)
  // console.log("render options", options)

  return (
    <Card sx={CARD_PROPERTY}>
      <CardContent>
        {loadStatus.loading && <CircularProgress />}
        {!loadStatus.loading && loadStatus.hasError && (
          <Typography>Error loading</Typography>
        )}

        {!loadStatus.loading && !loadStatus.hasError && (
          <Line options={options} data={chartData} />
        )}
      </CardContent>
    </Card>
  )
}
