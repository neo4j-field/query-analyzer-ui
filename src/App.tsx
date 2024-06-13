import { useState } from "react"
import { Box, Grid } from "@mui/material"

import CssBaseline from "@mui/material/CssBaseline"
import PercentileCard from "./components/PercentileCard"
import LogDetailsCard from "./components/LogDetailsCard"

const CONTENT_AREA_HEIGHT = import.meta.env.VITE_CONTENT_AREA_HEIGHT || "62vh"

export interface LoadingStatuses {
  logTimeWindow: LoadingStatus
  queryCountByServer: LoadingStatus
  percentile: LoadingStatus
}

export interface LoadingStatus {
  isLoading: boolean
  hasError: boolean
}

export default function App() {
  const [loading, setLoading] = useState<LoadingStatuses>({
    logTimeWindow: { isLoading: false, hasError: false },
    queryCountByServer: { isLoading: false, hasError: false },
    percentile: { isLoading: false, hasError: false },
  })

  return (
    <>
      <Box style={{ display: "block", height: CONTENT_AREA_HEIGHT }}>
        <CssBaseline />

        <Grid container spacing={4}>
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
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
