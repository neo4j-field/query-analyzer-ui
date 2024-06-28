import { useState } from "react"
import {
  Box,
  Toolbar,
  Grid,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
} from "@mui/material"
import TimeGraph, { DATASET_BASE } from "./TimeGraph"
import {
  QUERY_TIME_ELAPSED_TIME_COUNT,
  QUERY_TIME_PAGE_FAULTS_COUNT,
  QUERY_TIME_PAGE_HITS_COUNT,
  QUERY_TIME_PLANNING_COUNT,
  QUERY_TIME_QUERY_COUNT,
} from "../../util/apiEndpoints"
import { ChartDataset } from "chart.js"

export type GraphType =
  | "queries"
  | "pageFaults"
  | "pageHits"
  | "execution"
  | "planning"

const graphTypeMap: Record<GraphType, Record<string, any>> = {
  queries: {
    apiUri: QUERY_TIME_QUERY_COUNT,
    datasetLabel: "All",
    xLabel: "Timestamp",
    yLabel: "Total Count",
    graphTitle: "Queries Per Minute By Server",
    dataTransformer: function(rows: any[]) {
      // partition data by server
      const datasets: ChartDataset<"line">[] = []
      const dataByServer: Record<string, { x: string; y: string }[]> = {}
      for (const row of rows) {
        const [timestamp, server, count] = row
        if (!(server in dataByServer)) {
          dataByServer[server] = []
        }
        dataByServer[server].push({ x: timestamp, y: count })
      }
    
      // Default show only All Servers dataset
      for (const [server, data] of Object.entries(dataByServer)) {
        const dataset = structuredClone(DATASET_BASE)
        dataset.data = data as any
        dataset.label = server
        dataset.hidden = server !== "All Servers"
        if (server === "All Servers") {
          datasets.unshift(dataset)
        } else {
          datasets.push(dataset)
        }
      }
    
      return datasets
    }
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

/******************************************************************************
 * 
 * @returns 
 ******************************************************************************/
export default function PerformanceOverview() {
  const [graphType, setGraphType] = useState<GraphType>("queries")
  
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGraphType((event.target as HTMLInputElement).value as GraphType)
  }

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
          <TimeGraph
            apiUri={graphTypeMap[graphType].apiUri}
            datasetLabel={graphTypeMap[graphType].datasetLabel}
            xLabel={graphTypeMap[graphType].xLabel}
            yLabel={graphTypeMap[graphType].yLabel}
            graphTitle={graphTypeMap[graphType].graphTitle}
            graphType={graphTypeMap[graphType].graphType}
            dataTransformer={graphTypeMap[graphType].dataTransformer}
          />
        </Grid>
      </Grid>
    </Box>
  )
}
