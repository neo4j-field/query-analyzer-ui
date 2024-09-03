import { Box, Grid, Typography } from "@mui/material"
import GeneralStatsCard from "./GeneralStatsCard"
import QueriesExecutedByServerCard from "./QueriesExecutedByServerCard"
import UniqueQueriesExecutedCard from "./UniqueQueriesExecuted"
import PlannedCard from "./PlannedCard"
import Top5Card from "./Top5Card"
import { API_URIS } from "../../util/constants"
import * as React from "react"
import { useState } from "react"
import QueryDrawer from "../parts/QueryDrawer"

const {
  QUERY_TOP5_QUERIES_EXECUTED,
  QUERY_TOP5_PAGE_HITS,
  QUERY_TOP5_PAGE_FAULTS,
  QUERY_TOP5_ELAPSED_TIME,
} = API_URIS.SQLITE_ROOT

export default function Dashboard() {
  // const theme = useTheme()
  const [open, setOpen] = React.useState(false)
  const [queryText, setQueryText] = useState<string>("")
  const [queryId, setQueryId] = useState<string>("")
  const [loadingQueryText, setLoadingQueryText] = useState(false)

  return (
    <Box sx={{ display: "flex" }}>
      {/* <CssBaseline /> */}

      <QueryDrawer
        open={open}
        setOpen={setOpen}
        queryText={queryText}
        queryId={queryId}
        loadingQueryText={loadingQueryText}
      >
        <Typography sx={{ fontWeight: "bold" }} variant={"h4"}>
          Dashboard
        </Typography>
        <Grid container spacing={4}>
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
          {[
            { uriName: QUERY_TOP5_QUERIES_EXECUTED, title: "Top 5 Queries" },
            { uriName: QUERY_TOP5_PAGE_HITS, title: "Top 5 Page Hits" },
            { uriName: QUERY_TOP5_PAGE_FAULTS, title: "Top 5 Page Faults" },
            { uriName: QUERY_TOP5_ELAPSED_TIME, title: "Top 5 Elapsed Time" },
          ].map((x, i) => (
            <Grid key={i} item xs={11} sm={11} md={11} lg={11} xl={11}>
              <Top5Card
                uriName={x.uriName}
                title={x.title}
                setQueryText={setQueryText}
                openDrawer={open}
                setOpenDrawer={setOpen}
                setLoadingQueryText={setLoadingQueryText}
                setQueryId={setQueryId}
              />
            </Grid>
          ))}
        </Grid>
      </QueryDrawer>
    </Box>
  )
}
