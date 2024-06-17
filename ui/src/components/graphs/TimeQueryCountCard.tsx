import { Dispatch, SetStateAction, useEffect, useState } from "react"
import AddIcon from "@mui/icons-material/Add"
import { axisClasses } from "@mui/x-charts/ChartsAxis"
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/material"

import { QUERY_TIME_QUERY_COUNT, SQLITE_ROOT } from "../../util/apiEndpoints"
import { convertToDataMap, fetchGetUri } from "../../util/helpers"
import { BarChart } from "@mui/x-charts"

const valueFormatter = (value: number | null) => `${value} ff`

const chartSetting = {
  yAxis: [
    {
      label: "Number of queries",
    },
  ],
  width: 1000,
  height: 300,
  // sx: {
  //   [`.${axisClasses.left} .${axisClasses.label}`]: {
  //     transform: "translate(-20px, 0)",
  //   },
  // },
}

// const fakedataset = [
//   {
//     london: 59,
//     paris: 57,
//     newYork: 86,
//     seoul: 21,
//     month: "Jan",
//   },
//   {
//     london: 50,
//     paris: 52,
//     newYork: 78,
//     seoul: 28,
//     month: "Fev",
//   },
//   {
//     london: 47,
//     paris: 53,
//     newYork: 106,
//     seoul: 41,
//     month: "Mar",
//   },
//   {
//     london: 54,
//     paris: 56,
//     newYork: 92,
//     seoul: 73,
//     month: "Apr",
//   },
//   {
//     london: 57,
//     paris: 69,
//     newYork: 92,
//     seoul: 99,
//     month: "May",
//   },
//   {
//     london: 60,
//     paris: 63,
//     newYork: 103,
//     seoul: 144,
//     month: "June",
//   },
//   {
//     london: 59,
//     paris: 60,
//     newYork: 105,
//     seoul: 319,
//     month: "July",
//   },
//   {
//     london: 65,
//     paris: 60,
//     newYork: 106,
//     seoul: 249,
//     month: "Aug",
//   },
//   {
//     london: 51,
//     paris: 51,
//     newYork: 95,
//     seoul: 131,
//     month: "Sept",
//   },
//   {
//     london: 60,
//     paris: 65,
//     newYork: 97,
//     seoul: 55,
//     month: "Oct",
//   },
//   {
//     london: 67,
//     paris: 64,
//     newYork: 76,
//     seoul: 48,
//     month: "Nov",
//   },
//   {
//     london: 61,
//     paris: 70,
//     newYork: 103,
//     seoul: 25,
//     month: "Dec",
//   },
// ]

const CARD_PROPERTY = {
  borderRadius: 3,
  boxShadow: 0,
}

export default function TimeQueryCountCard() {
  const [loadStatus, setLoadStatus] = useState({
    loading: false,
    hasError: false,
  })
  const [dataset, setDataset] = useState<Record<string, any>[]>([])
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
    setLoadStatus({ ...loadStatus, loading: false})

    if (result.hasError) {
      return
    }

    const datamap = convertToDataMap(result.data.headers, result.data.rows)
    setDataset(datamap)
  }

  return (
    <>
      <Card sx={CARD_PROPERTY}>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            Number of queries run time graph
          </Typography>

          {loadStatus.loading && <CircularProgress />}
          {!loadStatus.loading &&
            loadStatus.hasError && (
              <Typography>Error loading</Typography>
            )}

          {/* BAR */}
          {!loadStatus.loading &&
            !loadStatus.hasError && (
              <BarChart
                dataset={dataset}
                xAxis={[{ scaleType: "band", dataKey: "time", valueFormatter: (val) => `${val.split(" ")[1]}` }]}
                series={[
                  { dataKey: "numQueries", label: "", valueFormatter },
                ]}
                {...chartSetting}
              />

              // <BarChart
              //   dataset={fakedataset}
              //   xAxis={[{ scaleType: "band", dataKey: "month" }]}
              //   series={[
              //     { dataKey: "london", label: "London", valueFormatter },
              //     { dataKey: "paris", label: "Paris", valueFormatter },
              //     { dataKey: "newYork", label: "New York", valueFormatter },
              //     { dataKey: "seoul", label: "Seoul", valueFormatter },
              //   ]}
              //   {...chartSetting}
              // />
            )}

          {/* <Button startIcon={<AddIcon />} onClick={() => handleRefetch()}>
            {" "}
            Update
          </Button> */}
        </CardContent>
      </Card>

      {/* <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth={"xs"}
        fullWidth
      >
        <DialogTitle display={"inline"}>
          <Typography>Query Text</Typography>
          <IconButton
            onClick={() => navigator.clipboard.writeText(queryText)}
            edge="start"
            sx={{ marginRight: 5 }}
          >
            <ContentCopyIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {loadingQueryText && <CircularProgress />}
          {!loadingQueryText && (
            <>
              <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                {queryText}
              </Typography>
            </>
          )}
        </DialogContent>
      </Dialog> */}
    </>
  )
}
