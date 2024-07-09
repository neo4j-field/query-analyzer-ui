import { useEffect, useState } from "react"
import {
  Toolbar,
  Grid,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  CircularProgress,
  Typography,
} from "@mui/material"
import TimeGraph, { DATASET_BASE } from "./TimeGraph"
import { API_URIS } from "../../util/constants"
import { ChartDataset } from "chart.js"
import {
  fetchGetUri,
  FETCH_ABORT_MSG,
  fetchAbortWrapper,
} from "../../util/helpers"
import { useChosenDb } from "../App"

export type GraphType =
  | "queries"
  | "pageFaults"
  | "pageHits"
  | "execution"
  | "planning"

export type StatType = "total" | "avg" | "min" | "max"

const ALL_SERVERS = "All Servers"
const NO_COLUMN = "NO_COLUMN_FOUND"

// /** Returns the "dataset" object of the data */
interface GraphTypeMapObject {
  apiUri: string
  xLabel: string
  yLabel: string
  graphTitle: string
  dataTransformer: (
    rows: any[],
    headers: string[],
  ) => Record<StatType, ChartDataset<"line">[]>
}

const {
  QUERY_TIME_ELAPSED_TIME_COUNT,
  QUERY_TIME_PAGE_FAULTS_COUNT,
  QUERY_TIME_PAGE_HITS_COUNT,
  QUERY_TIME_PLANNING_COUNT,
  QUERY_TIME_QUERY_COUNT,
  rootName: SQLITE_ROOT,
} = API_URIS.SQLITE_ROOT

const graphTypeMap: Record<GraphType, GraphTypeMapObject> = {
  queries: {
    apiUri: QUERY_TIME_QUERY_COUNT,
    xLabel: "Timestamp",
    yLabel: "Total Count",
    graphTitle: "Queries Per Minute",
    dataTransformer: statsTransformer,
  },

  pageFaults: {
    apiUri: QUERY_TIME_PAGE_FAULTS_COUNT,
    xLabel: "Timestamp",
    yLabel: "Total Count",
    graphTitle: "Page Faults Per Minute",
    dataTransformer: statsTransformer,
  },

  pageHits: {
    apiUri: QUERY_TIME_PAGE_HITS_COUNT,
    xLabel: "Timestamp",
    yLabel: "Total Count",
    graphTitle: "Page Hits Per Minute",
    dataTransformer: statsTransformer,
  },

  execution: {
    apiUri: QUERY_TIME_ELAPSED_TIME_COUNT,
    xLabel: "Timestamp",
    yLabel: "Total (ms)",
    graphTitle: "Execution Time Per Minute",
    dataTransformer: statsTransformer,
  },

  planning: {
    apiUri: QUERY_TIME_PLANNING_COUNT,
    xLabel: "Timestamp",
    yLabel: "Total (ms)",
    graphTitle: "Planning Time Per Minute",
    dataTransformer: statsTransformer,
  },
}

function statsTransformer(rows: any[], headers: string[]) {
  // partition rows by server
  const dataByServer: Record<string, any[]> = {}
  for (const row of rows) {
    const [timestamp, server, total, avg, min_, max_] = row
    if (!(server in dataByServer)) {
      dataByServer[server] = []
    }
    dataByServer[server].push({
      x: timestamp,
      total: total === undefined ? NO_COLUMN : total,
      avg: avg === undefined ? NO_COLUMN : avg,
      min: min_ === undefined ? NO_COLUMN : min_,
      max: max_ === undefined ? NO_COLUMN : max_,
    })
  }

  const ret: Record<StatType, ChartDataset<"line">[]> = {
    total: [],
    avg: [],
    min: [],
    max: [],
  }
  for (const [server, data] of Object.entries(dataByServer)) {
    // {"x": 1709229540000, "total":6, "avg":0.0276, "min":0, "max":1 }
    if (data[0].total !== NO_COLUMN) {
      const totalDataset = structuredClone(DATASET_BASE)
      totalDataset.label = server
      totalDataset.data = data.map((n) => ({ x: n.x, y: n.total })) as any
      ret.total.push(totalDataset)
    }

    if (data[0].avg !== NO_COLUMN) {
      const avgDataset = structuredClone(DATASET_BASE)
      avgDataset.label = server
      avgDataset.data = data.map((n) => ({ x: n.x, y: n.avg })) as any
      ret.avg.push(avgDataset)
    }

    if (data[0].min !== NO_COLUMN) {
      const minDataset = structuredClone(DATASET_BASE)
      minDataset.label = server
      minDataset.data = data.map((n) => ({ x: n.x, y: n.min })) as any
      ret.min.push(minDataset)
    }

    if (data[0].max !== NO_COLUMN) {
      const maxDataset = structuredClone(DATASET_BASE)
      maxDataset.label = server
      maxDataset.data = data.map((n) => ({ x: n.x, y: n.max })) as any
      ret.max.push(maxDataset)
    }
  }
  return ret
}

/******************************************************************************
 * PERFORMANCE OVERVIEW COMPONENT
 * @returns
 ******************************************************************************/
export default function PerformanceOverview() {
  const [graphType, setGraphType] = useState<GraphType>("queries")
  const [loadStatus, setLoadStatus] = useState({
    loading: false,
    hasError: false,
  })
  const [chartDatasetByStat, setChartDatasetByStat] = useState<Record<
    StatType,
    ChartDataset<"line">[]
  > | null>(null)
  const [statType, setStatType] = useState<StatType>("total")

  const { chosenDb, triggerRefresh } = useChosenDb()

  useEffect(() => {
    return fetchAbortWrapper(fetchData)
  }, [graphType, triggerRefresh])

  /*************************************
   *
   * @param event
   *************************************/
  const handleChangeStatType = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStatType((event.target as HTMLInputElement).value as StatType)
  }

  /*************************************
   *
   * @param event
   *************************************/
  const handleChangeGraphType = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setGraphType((event.target as HTMLInputElement).value as GraphType)
  }

  /**************************************
   * FETCH *
   **************************************/
  const fetchData = async (signal?: AbortSignal) => {
    const { apiUri, dataTransformer } = graphTypeMap[graphType]

    setLoadStatus({ ...loadStatus, loading: true, hasError: false })
    const result = await fetchGetUri(
      `${SQLITE_ROOT}/${apiUri}?dbname=${chosenDb}`,
      signal,
    )
    console.debug(`Recieved: `, result)

    if (result.hasError) {
      if (result.error !== FETCH_ABORT_MSG)
        setLoadStatus({ ...loadStatus, loading: false, hasError: true })
      return
    }

    // data transformation
    setChartDatasetByStat(
      dataTransformer(result.data.rows, result.data.headers),
    )
    setLoadStatus({ ...loadStatus, loading: false, hasError: false })
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
          <FormControl>
            <RadioGroup row value={statType} onChange={handleChangeStatType}>
              <FormControlLabel
                value="total"
                label="Total"
                control={<Radio />}
              />

              {/* MIN MAX AVERAGE FOR BELOW GRAPHTYPES */}
              {["pageFaults", "pageHits", "execution", "planning"].includes(
                graphType,
              ) && (
                <>
                  <FormControlLabel
                    value="avg"
                    label="Average"
                    control={<Radio />}
                  />
                  <FormControlLabel
                    value="min"
                    label="Min"
                    control={<Radio />}
                  />
                  <FormControlLabel
                    value="max"
                    label="Max"
                    control={<Radio />}
                  />
                </>
              )}
            </RadioGroup>
          </FormControl>
        </Grid>

        {/* CHART */}
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          {loadStatus.loading && <CircularProgress />}
          {!loadStatus.loading && loadStatus.hasError && (
            <Typography>Error loading</Typography>
          )}
          {!loadStatus.loading && !loadStatus.hasError && (
            <TimeGraph
              xLabel={graphTypeMap[graphType].xLabel}
              yLabel={graphTypeMap[graphType].yLabel}
              graphTitle={graphTypeMap[graphType].graphTitle}
              chartData={{
                labels: [],
                datasets:
                  chartDatasetByStat?.[statType].filter(
                    (d) => d.label === ALL_SERVERS,
                  ) || [],
              }}
            />
          )}
        </Grid>

        {/* CHART BY SERVER */}
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          {loadStatus.loading && <CircularProgress />}
          {!loadStatus.loading && loadStatus.hasError && (
            <Typography>Error loading</Typography>
          )}
          {!loadStatus.loading && !loadStatus.hasError && (
            <TimeGraph
              xLabel={graphTypeMap[graphType].xLabel}
              yLabel={graphTypeMap[graphType].yLabel}
              graphTitle={graphTypeMap[graphType].graphTitle + " By Server"}
              chartData={{
                labels: [],
                datasets:
                  chartDatasetByStat?.[statType].filter(
                    (d) => d.label !== ALL_SERVERS,
                  ) || [],
              }}
            />
          )}
        </Grid>
      </Grid>
    </>
  )
}
