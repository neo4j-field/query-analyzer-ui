import { useEffect, useState } from "react"
import {
  Box,
  Toolbar,
  Grid,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
} from "@mui/material"
import TimeQueryCountCard from "./TimeGraph"
import {
  QUERY_TIME_ELAPSED_TIME_COUNT,
  QUERY_TIME_PAGE_FAULTS_COUNT,
  QUERY_TIME_PAGE_HITS_COUNT,
  QUERY_TIME_PLANNING_COUNT,
  QUERY_TIME_QUERY_COUNT,
} from "../../util/apiEndpoints"

type GraphType =
  | "queries"
  | "pageFaults"
  | "pageHits"
  | "execution"
  | "planning"

const graphTypeMap: Record<GraphType, Record<string, string>> = {
  queries: {
    apiUri: QUERY_TIME_QUERY_COUNT,
    datasetLabel: "All",
    xLabel: "Timestamp",
    yLabel: "Total Count",
    graphTitle: "Queries Per Minute",
  },
  pageFaults: {
    apiUri: QUERY_TIME_PAGE_FAULTS_COUNT,
    datasetLabel: "All",
    xLabel: "Timestamp",
    yLabel: "Total Count",
    graphTitle: "Page Faults Per Minute",
  },
  pageHits: {
    apiUri: QUERY_TIME_PAGE_HITS_COUNT,
    datasetLabel: "All",
    xLabel: "Timestamp",
    yLabel: "Total Count",
    graphTitle: "Page Hits Per Minute",
  },
  execution: {
    apiUri: QUERY_TIME_ELAPSED_TIME_COUNT,
    datasetLabel: "All",
    xLabel: "Timestamp",
    yLabel: "Total (ms)",
    graphTitle: "Execution Time Per Minute",
  },
  planning: {
    apiUri: QUERY_TIME_PLANNING_COUNT,
    datasetLabel: "All",
    xLabel: "Timestamp",
    yLabel: "Total (ms)",
    graphTitle: "Planning Time Per Minute",
  },
}

export default function PerformanceOverview() {
  const [graphType, setGraphType] = useState<GraphType>("queries")
  const [apiUri, setApiUri] = useState<string>(graphTypeMap.queries.apiUri)
  const [datasetLabel, setDatasetLabel] = useState<string>(
    graphTypeMap.queries.datasetLabel,
  )
  const [xLabel, setXLabel] = useState<string>(graphTypeMap.queries.xLabel)
  const [yLabel, setYLabel] = useState<string>(graphTypeMap.queries.yLabel)
  const [graphTitle, setGraphTitle] = useState<string>(
    graphTypeMap.queries.graphTitle,
  )
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGraphType((event.target as HTMLInputElement).value as GraphType)
  }

  useEffect(() => {
    setApiUri(graphTypeMap[graphType].apiUri)
    setDatasetLabel(graphTypeMap[graphType].datasetLabel)
    setXLabel(graphTypeMap[graphType].xLabel)
    setYLabel(graphTypeMap[graphType].yLabel)
    setGraphTitle(graphTypeMap[graphType].graphTitle)
  }, [graphType])

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
          <FormControl>
            <RadioGroup
              row
              // aria-labelledby="demo-row-radio-buttons-group-label"
              // name="row-radio-buttons-group"
              value={graphType}
              onChange={handleChange}
            >
              <FormControlLabel
                value="queries"
                label="Queries"
                control={<Radio />}
              />
              <FormControlLabel
                value="pageFaults"
                label="Page Faults"
                control={<Radio />}
              />
              <FormControlLabel
                value="pageHits"
                label="Page Hits"
                control={<Radio />}
              />
              <FormControlLabel
                value="execution"
                label="Execution Time"
                control={<Radio />}
              />
              <FormControlLabel
                value="planning"
                label="Planning Time"
                control={<Radio />}
              />
            </RadioGroup>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          <TimeQueryCountCard
            apiUri={apiUri}
            datasetLabel={datasetLabel}
            xLabel={xLabel}
            yLabel={yLabel}
            graphTitle={graphTitle}
          />
        </Grid>
      </Grid>
    </Box>
  )
}
