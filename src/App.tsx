import { useEffect, useState } from "react"
import AddIcon from "@mui/icons-material/Add"
import reactLogo from "./assets/react.svg"
import viteLogo from "/vite.svg"
// import "./App.css"
import { BarChart } from "@mui/x-charts"
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material"

import CssBaseline from "@mui/material/CssBaseline"
import {
  QUERY_LOG_TIME_WINDOW,
  QUERY_PERCENTILE,
  SQLITE_ROOT,
} from "./util/apiEndpoints"
import { fetchGetUri } from "./util/helpers"
import { produce } from "immer"

const CONTENT_AREA_HEIGHT = import.meta.env.VITE_CONTENT_AREA_HEIGHT || "62vh"

const BAR_CHART_WIDTH = 400
const BAR_CHART_HEIGHT = 300

const CARD_PROPERTY = {
  borderRadius: 3,
  boxShadow: 0,
}

function App() {
  const [loading, setLoading] = useState({
    logDetails: false,
    percentile: false,
  })
  const [firstStartTimestamp, setFirstStartTimestamp] = useState<number>(-1)
  const [lastStartTimestamp, setLastStartTimestamp] = useState<number>(-1)
  const [logDuration, setLogDuration] = useState<number>(-1)

  const handleRefetch = async (uri: string, loadingKey: string) => {
    if (loadingKey === "logdetails") {
      fetchLogDetails()
    } else if (loadingKey === "percentile") {
    }
  }

  useEffect(() => {
    ;(async () => {
      setLoading(
        produce((draft) => {
          draft.percentile = true
        }),
      )
      fetchGetUri(`${SQLITE_ROOT}/${QUERY_PERCENTILE}`).then((response) => {
        setLoading(
          produce((draft) => {
            draft.percentile = false
          }),
        )
        console.log(`query percentile response`, response)
      })

      fetchLogDetails()
    })()
  }, [])

  const fetchLogDetails = async () => {
    setLoading(
      produce((draft) => {
        draft.logDetails = true
      }),
    )
    const result = await fetchGetUri(`${SQLITE_ROOT}/${QUERY_LOG_TIME_WINDOW}`)
    setLoading(
      produce((draft) => {
        draft.logDetails = false
      }),
    )

    const logDetails = convertToDataMap(result.data)[0]
    setFirstStartTimestamp(logDetails["firstStartTimestampMs"])
    setLastStartTimestamp(logDetails["lastStartTimestampMs"])
    setLogDuration(logDetails["windowDurationMin"])
  }

  const convertToDataMap = (resultData: {
    headers: string[]
    rows: any[][]
  }) => {
    const dataMap: any[] = []
    for (const row of resultData.rows) {
      const mapRow: any = {}
      for (let i = 0; i < resultData.headers.length; i++) {
        const header = resultData.headers[i]
        mapRow[header] = row[i]
      }
      dataMap.push(mapRow)
    }
    return dataMap
  }

  return (
    <>
      <Box style={{ display: "block", height: CONTENT_AREA_HEIGHT }}>
        <CssBaseline />

        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={6} lg={4} xl={3}>
            <Card sx={CARD_PROPERTY}>
              {loading.logDetails && <CircularProgress />}
              {!loading.logDetails && (
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    Log Details
                  </Typography>
                  <Typography variant="body2">
                    First Start Timestamp:{" "}
                    {`${new Date(firstStartTimestamp).toISOString()}`}
                  </Typography>
                  <Typography variant="body2">
                    Last Start Timestamp:{" "}
                    {`${new Date(lastStartTimestamp).toISOString()}`}
                  </Typography>
                  <Typography variant="body2">
                    Log Duration: {`${logDuration} minutes`}
                  </Typography>

                  <Button
                    startIcon={<AddIcon />}
                    onClick={() =>
                      handleRefetch(
                        `${SQLITE_ROOT}/${QUERY_LOG_TIME_WINDOW}`,
                        "logdetails",
                      )
                    }
                  >
                    {" "}
                    Update
                  </Button>
                </CardContent>
              )}
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={6} lg={4} xl={3}>
            <Card sx={CARD_PROPERTY}>
              {loading.percentile && <CircularProgress />}
              {!loading.percentile && (
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    Card 2
                  </Typography>
                  <BarChart
                    xAxis={[
                      {
                        id: "barCategories",
                        data: ["bar A", "bar B", "bar C"],
                        scaleType: "band",
                      },
                    ]}
                    series={[
                      {
                        data: [2, 5, 3],
                      },
                    ]}
                    width={BAR_CHART_WIDTH}
                    height={BAR_CHART_HEIGHT}
                  />

                  <Button
                    startIcon={<AddIcon />}
                    onClick={() =>
                      handleRefetch(
                        `${SQLITE_ROOT}/${QUERY_PERCENTILE}`,
                        "percentile",
                      )
                    }
                  >
                    {" "}
                    Update
                  </Button>
                </CardContent>
              )}
            </Card>
          </Grid>
        </Grid>

        {/* TOP BAR */}
        {/* <AppHeader designer={designer} /> */}
      </Box>
    </>
  )
}

export default App
