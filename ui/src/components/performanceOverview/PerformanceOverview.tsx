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
    graphTitle: "Queries Per Minute",
    dataTransformer: function statsTransformer(rows: any[], headers: string[]) {
      const totalDataset = structuredClone(DATASET_BASE)
      totalDataset.label = "Total"
      for (const row of rows) {
        const [timestamp, total] = row
        totalDataset.data.push({ x: timestamp, y: total })
      }
      return [totalDataset]
    },
  },

  pageFaults: {
    apiUri: QUERY_TIME_PAGE_FAULTS_COUNT,
    datasetLabel: "All",
    xLabel: "Timestamp",
    yLabel: "Total Count",
    graphTitle: "Page Faults Per Minute",
    dataTransformer: statsTransformer,
  },

  pageHits: {
    apiUri: QUERY_TIME_PAGE_HITS_COUNT,
    datasetLabel: "All",
    xLabel: "Timestamp",
    yLabel: "Total Count",
    graphTitle: "Page Hits Per Minute",
    dataTransformer: statsTransformer,
  },

  execution: {
    apiUri: QUERY_TIME_ELAPSED_TIME_COUNT,
    datasetLabel: "All",
    xLabel: "Timestamp",
    yLabel: "Total (ms)",
    graphTitle: "Execution Time Per Minute",
    dataTransformer: statsTransformer,
  },

  planning: {
    apiUri: QUERY_TIME_PLANNING_COUNT,
    datasetLabel: "All",
    xLabel: "Timestamp",
    yLabel: "Total (ms)",
    graphTitle: "Planning Time Per Minute",
    dataTransformer: statsTransformer,
  },
}

function statsTransformer(rows: any[], headers: string[]) {
  const totalDataset = structuredClone(DATASET_BASE)
  totalDataset.label = "Total"
  const avgDataset = structuredClone(DATASET_BASE)
  avgDataset.label = "Average"
  const minDataset = structuredClone(DATASET_BASE)
  minDataset.label = "Min"
  const maxDataset = structuredClone(DATASET_BASE)
  maxDataset.label = "Max"
  for (const row of rows) {
    const [timestamp, total, avg, min_, max_] = row
    totalDataset.data.push({ x: timestamp, y: total })
    avgDataset.data.push({ x: timestamp, y: avg })
    minDataset.data.push({ x: timestamp, y: min_ })
    maxDataset.data.push({ x: timestamp, y: max_ })
  }
  return [totalDataset, avgDataset, minDataset, maxDataset]
}

function byServerTransformer (rows: any[]) {
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

/******************************************************************************
 * PERFORMANCE OVERVIEW COMPONENT
 * @returns
 ******************************************************************************/
export default function PerformanceOverview() {
  const [graphType, setGraphType] = useState<GraphType>("queries")

  const handleChangeGraphType = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setGraphType((event.target as HTMLInputElement).value as GraphType)
  }
  // console.log("render perfoverview")

  return (
    <>
      <Toolbar />
      <Grid container spacing={2}>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          <FormControl>
            <RadioGroup row value={graphType} onChange={handleChangeGraphType}>
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
            dataTransformer={graphTypeMap[graphType].dataTransformer}
          />
        </Grid>
      </Grid>
    </>
  )
}
