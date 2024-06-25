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

import { QUERY_TIME_QUERY_COUNT, SQLITE_ROOT } from "../../util/apiEndpoints"
import { fetchGetUri } from "../../util/helpers"

const CARD_PROPERTY = {
  borderRadius: 3,
  boxShadow: 0,
}

const DATASETS_BASE: ChartDataset<"line"> = {
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
    },
    title: {
      display: true,
      text: "Title",
    },
    decimation: {
      enabled: true,
      algorithm: "lttb",
      // samples: 500,

      // algorithm: "min-max",
      // threshold: 90,
    },
  },
  indexAxis: "x",
  parsing: false,
  scales: {
    x: {
      type: "time",
      time: {
        unit: "second",
      },
      ticks: {
        maxTicksLimit: 90,
      },
      title: {
        display: true,
        text: "Timestamp",
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
  apiUri: string
  datasetLabel: string
  xLabel: string
  yLabel: string
  graphTitle: string
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

  const handleRefetch = async () => {
    fetchData()
  }

  useEffect(() => {
    setData({ labels: [], datasets: [] })
    fetchData()
  }, [apiUri])

  /****************************************************************************
   * FETCH
   ****************************************************************************/
  const fetchData = async () => {
    setLoadStatus({ ...loadStatus, loading: true, hasError: false })
    const result = await fetchGetUri(`${SQLITE_ROOT}/${apiUri}`)
    setLoadStatus({ ...loadStatus, loading: false })

    if (result.hasError) {
      return
    }

    const datasetsBase = structuredClone(DATASETS_BASE)
    datasetsBase.data = result.data.rows.map((row: any) => ({
      x: row[0],
      y: row[1],
    }))
    datasetsBase.label = datasetLabel

    const dataTransformed = {
      datasets: [datasetsBase],
    }

    setData(dataTransformed)
    const options: ChartOptions<"line"> = structuredClone(CHART_OPTIONS_BASE)
    options.scales!.x!.title!.text = xLabel
    options.scales!.y!.title!.text = yLabel
    options.plugins!.title!.text = graphTitle
    setOptions(options)
  }

  // console.log("render data", data)
  // console.log("render options", options)

  return (
    <>
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

          {/* <Button startIcon={<AddIcon />} onClick={() => handleRefetch()}>
            {" "}
            Update
          </Button> */}
        </CardContent>
      </Card>
    </>
  )
}
