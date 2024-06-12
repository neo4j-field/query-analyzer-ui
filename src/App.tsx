import { SetStateAction, useEffect, useState } from "react"
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
import { convertToDataMap, fetchGetUri } from "./util/helpers"
import { produce } from "immer"
import PercentileCard from "./components/PercentileCard"

const CONTENT_AREA_HEIGHT = import.meta.env.VITE_CONTENT_AREA_HEIGHT || "62vh"

const BAR_CHART_WIDTH = 400
const BAR_CHART_HEIGHT = 300

const CARD_PROPERTY = {
  borderRadius: 3,
  boxShadow: 0,
}

export interface LoadingStatuses {
  logDetails: LoadingStatus
  percentile: LoadingStatus
}

export interface LoadingStatus {
  isLoading: boolean
  hasError: boolean
}

function App() {
  const [loading, setLoading] = useState<LoadingStatuses>({
    logDetails: {isLoading: false, hasError: false},
    percentile: {isLoading: false, hasError: false},
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

      fetchLogDetails()
    })()
  }, [])

  /****************************************************************************
   ****************************************************************************/
  const fetchLogDetails = async () => {
    setLoading(
      produce((draft) => {
        draft.logDetails.isLoading = true
        draft.logDetails.hasError = false
      }),
    )
    const result = await fetchGetUri(`${SQLITE_ROOT}/${QUERY_LOG_TIME_WINDOW}`)
    console.log(result.message)
    setLoading(
      produce((draft) => {
        draft.logDetails.isLoading = false
        draft.logDetails.hasError = result.hasError ? true : false
      }),
    )

    if (result.hasError) {
      return
    }

    const logDetails = convertToDataMap(result.data)[0]
    setFirstStartTimestamp(logDetails["firstStartTimestampMs"])
    setLastStartTimestamp(logDetails["lastStartTimestampMs"])
    setLogDuration(logDetails["windowDurationMin"])
  }

  return (
    <>
      <Box style={{ display: "block", height: CONTENT_AREA_HEIGHT }}>
        <CssBaseline />

        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={6} lg={4} xl={3}>
            <Card sx={CARD_PROPERTY}>
              {loading.logDetails.isLoading && <CircularProgress />}
              {(!loading.logDetails.isLoading && loading.logDetails.hasError) && <Typography>Error loading</Typography>}
              {(!loading.logDetails.isLoading && !loading.logDetails.hasError) && (
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

          <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
            <PercentileCard loading={loading} setLoading={setLoading} />
          </Grid>
        </Grid>

        {/* TOP BAR */}
        {/* <AppHeader designer={designer} /> */}
      </Box>
    </>
  )
}

export default App
