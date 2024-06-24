import { useEffect, useState } from "react"
import "chartjs-adapter-moment"
import { Card, CardContent, CircularProgress, Typography } from "@mui/material"
import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
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

const TIME_QUERY_COUNT_OPTIONS: ChartOptions<"line"> = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Number of Queries Run",
    },
    decimation: {
      enabled: true,
      algorithm: "lttb",
      samples: 10,
    },
  },
  scales: {
    x: {
      type: "time",
      time: {
        unit: "second",
        // tooltipFormat: "ll HH:mm:ss",
      },
      ticks: {
        maxTicksLimit: 10,
      },
      title: {
        display: true,
        text: "Timestamp",
      },
    },
  },
}

export default function TimeQueryCountCard() {
  const [loadStatus, setLoadStatus] = useState({
    loading: false,
    hasError: false,
  })
  const [data, setData] = useState<ChartData<"line">>({
    labels: [],
    datasets: [],
  })
  const [options, setOptions] = useState<ChartOptions<"line">>({})

  // const [openModal, setOpenModal] = useState(false)
  // const [loadingQueryText, setLoadingQueryText] = useState(false)
  // const [queryText, setQueryText] = useState("kdfjldkfj")

  const handleRefetch = async () => {
    fetchData()
  }

  // const handleCloseModal = () => setOpenModal(false)

  useEffect(() => {
    fetchData()
  }, [])

  /****************************************************************************
   ****************************************************************************/
  const fetchData = async () => {
    setLoadStatus({ ...loadStatus, loading: true, hasError: false })
    const result = await fetchGetUri(`${SQLITE_ROOT}/${QUERY_TIME_QUERY_COUNT}`)
    setLoadStatus({ ...loadStatus, loading: false })

    if (result.hasError) {
      return
    }

    const dataTransformed = {
      datasets: [
        {
          label: "All queries",
          data: result.data.rows.map((row: any) => ({ x: row[0], y: row[1] })),
          // tension: 0.1,
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
          pointRadius: 0, // Set to 0 to hide the points
          fill: false,
        },
      ],
    }
    setData(dataTransformed)
    setOptions(TIME_QUERY_COUNT_OPTIONS)
  }

  // const fakeoptions = {
  //   scales: {
  //     x: {
  //       type: "time",
  //       time: {
  //         unit: "second", // Adjust the unit as needed
  //         tooltipFormat: "ll HH:mm:ss",
  //       },
  //       ticks: {
  //         maxTicksLimit: 10, // Set the maximum number of x-axis intervals
  //       },
  //     },
  //     y: {
  //       beginAtZero: true,
  //     },
  //   },
  //   plugins: {
  //     decimation: {
  //       enabled: true,
  //       algorithm: "lttb", // 'lttb' (Largest Triangle Three Buckets) algorithm
  //       samples: 100, // Maximum number of points to display
  //     },
  //   },
  // }
  // const now = Date.now()
  // const fakedatainner = Array.from({ length: 1000 }, (_, i) => ({
  //   x: now + i * 1000, // 1-second interval
  //   y: Math.sin(i / 10),
  // }))
  // console.log(fakedatainner)
  // const fakedata = {
  //   type: "line",
  //   data: {
  //     datasets: [
  //       {
  //         label: "Sample Dataset",
  //         data: fakedatainner,
  //         borderColor: "rgba(75, 192, 192, 1)",
  //         borderWidth: 1,
  //         pointRadius: 2, // Reduce the radius of the points
  //       },
  //     ],
  //   },
  // }

  console.log("render data", data)
  console.log("render options", options)

  const foptions = {
    response: true,
    scales: {
      x: {
        type: "time",
        time: {
          unit: "day",
        },
      },
    },
  }

  const values = [
    {
      x: new Date("2020-01-01"),
      y: 100.2,
    },
    {
      x: new Date("2020-01-02"),
      y: 102.2,
    },
    {
      x: new Date("2020-01-03"),
      y: 105.3,
    },
    {
      x: new Date("2020-01-11"),
      y: 104.4,
    },
  ]

  const fdata = {
    datasets: [
      {
        data: values,
      },
    ],
  }

  return (
    <>
      <Card sx={CARD_PROPERTY}>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            Number of queries run time graph
          </Typography>

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
