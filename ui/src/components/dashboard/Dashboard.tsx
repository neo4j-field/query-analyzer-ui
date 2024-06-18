import { Box, Toolbar, Grid, Paper } from "@mui/material"
import GeneralStatsCard from "./GeneralStatsCard"
import PercentileCard from "./PercentileCard"
import QueriesExecutedByServerCard from "./QueriesExecutedByServerCard"
import UniqueQueriesExecutedCard from "./UniqueQueriesExecuted"
import PlannedCard from "./PlannedCard"
import Top5Card from "./Top5Card"
import {
  SQLITE_ROOT,
  QUERY_TOP5_PAGE_HITS,
  QUERY_TOP5_QUERIES_EXECUTED,
  QUERY_TOP5_PAGE_FAULTS,
  QUERY_TOP5_ELAPSED_TIME,
} from "../../util/apiEndpoints"

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

        {/* TOP 5ers*/}
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          <Top5Card
            uriName={QUERY_TOP5_QUERIES_EXECUTED}
            title={"Top 5 Queries"}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          <Top5Card uriName={QUERY_TOP5_PAGE_HITS} title={"Top 5 Page Hits"} />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          <Top5Card uriName={QUERY_TOP5_PAGE_FAULTS} title={"Top 5 Page Faults"} />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          <Top5Card uriName={QUERY_TOP5_ELAPSED_TIME} title={"Top 5 Elapsed Time"} />
        </Grid>

        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          <PercentileCard />
        </Grid>
      </Grid>
    </Box>
  )
}
