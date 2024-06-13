import { Box, Toolbar, Grid } from "@mui/material"
import LogDetailsCard from "./LogDetailsCard"
import PercentileCard from "./PercentileCard"
import { useState } from "react"
import { LoadingStatus } from "../App"

export interface DashboardLoadingStatuses {
  logTimeWindow: LoadingStatus
  queryCountByServer: LoadingStatus
  percentile: LoadingStatus
}

export default function Dashboard() {
  const [loading, setLoading] = useState<DashboardLoadingStatuses>({
    logTimeWindow: { isLoading: false, hasError: false },
    queryCountByServer: { isLoading: false, hasError: false },
    percentile: { isLoading: false, hasError: false },
  })

  return (
    <Box
      component="main"
      sx={{
        backgroundColor: (theme) =>
          theme.palette.mode === "light"
            ? theme.palette.grey[100]
            : theme.palette.grey[900],
        flexGrow: 1,
        height: "100vh",
        overflow: "auto",
      }}
    >
      <Toolbar />
      <Grid container spacing={4}>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          <LogDetailsCard loading={loading} setLoading={setLoading} />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          <PercentileCard loading={loading} setLoading={setLoading} />
        </Grid>
      </Grid>
    </Box>
  )
}
