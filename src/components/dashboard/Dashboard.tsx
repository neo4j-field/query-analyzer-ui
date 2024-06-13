import { Box, Toolbar, Grid, Paper } from "@mui/material"
import TimePeriodCard from "./TimePeriodCard"
import PercentileCard from "./PercentileCard"
import { useState } from "react"
import { LoadingStatus } from "../App"
import QueriesExecutedCard from "./QueriesExecutedCard"

export interface DashboardLoadingStatuses {
  logTimeWindow: LoadingStatus
  queriesExecuted: LoadingStatus
  percentile: LoadingStatus
}

// Card: Total number of unique queries.
// Card: Time Peiod. Number of Queries executed. Average time taken, avg page hits, avg page faults.
// Card: Percentage queries planned, percentage of planning time/elapsedtime
// Card: Top 5 queries in terms of in terms of invocations.
// Card: Top 5 queries with most page hits.
// Card: Top 5 queries with most page faults
// Card: Top 5 queries with most elapsedtime

export default function Dashboard() {
  const [loading, setLoading] = useState<DashboardLoadingStatuses>({
    logTimeWindow: { isLoading: false, hasError: false },
    queriesExecuted: { isLoading: false, hasError: false },
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

        {/* <Grid item xs={12} sm={12} md={12} lg={12} xl={12}> */}
        <Grid item xs={6}>
          <TimePeriodCard loading={loading} setLoading={setLoading} />
        </Grid>
        <Grid item xs={12}>
          <QueriesExecutedCard loading={loading} setLoading={setLoading} />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          <PercentileCard loading={loading} setLoading={setLoading} />
        </Grid>
      </Grid>
    </Box>
  )
}
