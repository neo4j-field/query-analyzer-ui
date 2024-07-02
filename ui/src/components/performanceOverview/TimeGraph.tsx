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

import { SQLITE_ROOT } from "../../util/apiEndpoints"
import { fetchGetUri } from "../../util/helpers"
import { useChosenDb } from "../App"

const CARD_PROPERTY = {
  borderRadius: 3,
  boxShadow: 0,
}

export const DATASET_BASE: ChartDataset<"line"> = {
  label: "Datasetlabel",
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

export const FETCH_ABORT_MSG = "Abort fetch from unmounting or dependency change"

interface Props {
  apiUri: string
  datasetLabel: string
  xLabel: string
  yLabel: string
  graphTitle: string
  dataTransformer?: (rows: any[], headers: string[]) => ChartDataset<"line">[]
}

/******************************************************************************
 * TIME GRAPH
 * @returns
 ******************************************************************************/
export default function TimeGraph({
  apiUri,
  datasetLabel,
  xLabel,
  yLabel,
  graphTitle,
  dataTransformer,
}: Props) {
  const [loadStatus, setLoadStatus] = useState({
    loading: false,
    hasError: false,
  })
  const [data, setData] = useState<ChartData<"line">>({
    labels: [],
    datasets: [],
  })
  const [options, setOptions] = useState<ChartOptions<"line">>({})
  const { chosenDb } = useChosenDb()

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal

    setData({ labels: [], datasets: [] })
    fetchData(signal)

    // Cleanup fetch request on unmount or dependency change
    // eg if user clicks on another graph type to show, cancel this fetch
    return () => {
      controller.abort(FETCH_ABORT_MSG)
    }
  }, [apiUri])

  /*********
   * FETCH *
   ********/
  const fetchData = async (signal: AbortSignal) => {
    setLoadStatus({ ...loadStatus, loading: true, hasError: false })
    const result = await fetchGetUri(
      `${SQLITE_ROOT}/${apiUri}?dbname=${chosenDb}`,
      signal,
    )
    console.debug(`Recieved: `, result)

    if (result.hasError) {
      if (result.error !== FETCH_ABORT_MSG)
        setLoadStatus({ ...loadStatus, loading: false, hasError: true})
      return
    }

    // data transformation
    const dataTransformed: ChartData<"line"> = { datasets: [] }
    if (dataTransformer) {
      dataTransformed.datasets = dataTransformer(
        result.data.rows,
        result.data.headers,
      )
    } else {
      const dataset = structuredClone(DATASET_BASE)
      dataset.data = result.data.rows.map((row: any) => ({
        x: row[0],
        y: row[1],
      }))
      dataset.label = datasetLabel
      dataTransformed.datasets.push(dataset)
    }
    setData(dataTransformed)

    const options: ChartOptions<"line"> = { ...CHART_OPTIONS_BASE }
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

      {/* BAR */}
      {!loadStatus.loading && !loadStatus.hasError && (
        <Line options={options} data={data} />
        // <Line options={fakeoptions} data={fakedata} />
      )}
    </CardContent>
  </Card>
  )
}
