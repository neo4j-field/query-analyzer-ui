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
import LogDetailsCard from "./components/LogDetailsCard"

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

export default function App() {
  const [loading, setLoading] = useState<LoadingStatuses>({
    logDetails: {isLoading: false, hasError: false},
    percentile: {isLoading: false, hasError: false},
  })

  return (
    <>
      <Box style={{ display: "block", height: CONTENT_AREA_HEIGHT }}>
        <CssBaseline />

        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={6} lg={4} xl={3}>
            <LogDetailsCard loading={loading} setLoading={setLoading} />
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
