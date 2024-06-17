import { Box, Toolbar, Grid, Paper } from "@mui/material"
import GeneralStatsCard from "./GeneralStatsCard"
import PercentileCard from "./PercentileCard"
import QueriesExecutedByServerCard from "./QueriesExecutedByServerCard"
import UniqueQueriesExecutedCard from "./UniqueQueriesExecuted"
import PlannedCard from "./PlannedCard"

// Card: Top 5 queries in terms of in terms of invocations.
// Card: Top 5 queries with most page hits.
// Card: Top 5 queries with most page faults
// Card: Top 5 queries with most elapsedtime

export default function Dashboard() {
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

        {/* LEFT COLUMN  */}
        <Grid item xs={6}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <UniqueQueriesExecutedCard />
            </Grid>
            <Grid item xs={12}>
              <GeneralStatsCard />
            </Grid>
            <Grid item xs={12}>
              <PlannedCard />
            </Grid>
          </Grid>
        </Grid>

        {/* RIGHT COLUMN */}
        <Grid item xs={6}>
          <QueriesExecutedByServerCard />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          <PercentileCard />
        </Grid>
      </Grid>
    </Box>
  )
}
