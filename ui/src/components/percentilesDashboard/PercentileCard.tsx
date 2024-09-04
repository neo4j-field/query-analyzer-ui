import { ChangeEvent, useEffect, useState } from "react"
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { API_URIS } from "../../util/constants"
import {
  FETCH_ABORT_MSG,
  convertToDataMap,
  existsInSession,
  fetchAbortWrapper,
  fetchGetUri,
  fetchPostUri,
  getFromSession,
  setInSession,
} from "../../util/helpers"
import { useChosenDb } from "../App"
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridEventListener,
} from "@mui/x-data-grid"
import clsx from "clsx"
import {
  AVG_HITS_LOWER_90,
  AVG_HITS_UPPER_90,
  AVG_TIME_LOWER_90,
  AVG_TIME_UPPER_90,
} from "../../util/constants"
import QueryDrawer from "../parts/QueryDrawer"
import Markdown from "react-markdown"

const {
  QUERY_GET_QUERY_TEXT,
  QUERY_PERCENTILE,
  rootName: SQLITE_ROOT,
} = API_URIS.SQLITE_ROOT

const CARD_PROPERTY = {
  borderRadius: 3,
  boxShadow: 0,
}

const HEADER_DISPLAY_MAP: Record<string, any> = {
  query_id: { displayName: "query_id" },
  avgHits_L90: { displayName: "Avg Hits" },
  minHits_L90: { displayName: "Min Hits" },
  maxHits_L90: { displayName: "Max Hits" },
  avgTime_L90: { displayName: "Avg Elapsed (ms)" },
  minTime_L90: { displayName: "Min Elapsed (ms)" },
  maxTime_L90: { displayName: "Max Elapsed (ms)" },
  count_L90: { displayName: "Executions" },

  avgHits_U90: { displayName: "Avg Hits" },
  minHits_U90: { displayName: "Min Hits" },
  maxHits_U90: { displayName: "Max Hits" },
  avgHitsRatio: { displayName: "Hits U90:L90 Ratio" },
  avgTime_U90: { displayName: "Avg Elapsed (ms)" },
  minTime_U90: { displayName: "Min Elapsed (ms)" },
  maxTime_U90: { displayName: "Max Elapsed (ms)" },
  avgTimeRatio: { displayName: "Elapsed U90:L90 Ratio" },
  count_U90: { displayName: "Executions" },
}

const HEADERS_L90 = [
  "query_id",
  "avgHits_L90",
  "minHits_L90",
  "maxHits_L90",
  "avgTime_L90",
  "minTime_L90",
  "maxTime_L90",
  "count_L90",
]
const HEADERS_U90 = [
  "query_id",
  "avgHits_U90",
  "minHits_U90",
  "maxHits_U90",
  "avgHitsRatio",
  "avgTime_U90",
  "minTime_U90",
  "maxTime_U90",
  "avgTimeRatio",
  "count_U90",
]

export default function PercentileCard() {
  const [loadStatus, setLoadStatus] = useState({
    loading: false,
    hasError: false,
  })
  const [openaiLoadStatus, setOpenaiLoadStatus] = useState({
    loading: false,
    hasError: false,
  })
  const [openaiContent, setOpenaiContent] = useState("")
  const [disableOpenaiSummarize, setDisableOpenaiSummarize] = useState(true)
  const [headersL90, setHeadersL90] = useState<string[]>([])
  const [headersU90, setHeadersU90] = useState<string[]>([])
  const [datamap, setDatamap] = useState<Record<string, any>[]>([])
  const [avgTimeLThresh, setAvgTimeLThresh] = useState<number>(1)
  const [avgPageHitsLThresh, setAvgPageHitsLThresh] = useState<number>(100000)
  const [avgTimeUThresh, setAvgTimeUThresh] = useState<number>(100)
  const [avgPageHitsUThresh, setAvgPageHitsUThresh] = useState<number>(100000)
  const [timeRatioThreshold, setTimeRatioThreshold] = useState<number>(50)
  const [hitsRatioThreshold, setHitsRatioThreshold] = useState<number>(50)
  const { chosenDb, triggerRefresh } = useChosenDb()
  // const apiRef = useGridApiRef()

  // DRAWER RELATED
  const [openDrawer, setOpenDrawer] = useState(false)
  const [queryText, setQueryText] = useState<string>("")
  const [queryId, setQueryId] = useState<string>("")
  const [loadingQueryText, setLoadingQueryText] = useState(false)

  useEffect(() => {
    if (existsInSession(QUERY_PERCENTILE)) {
      setDisableOpenaiSummarize(true)
      processFetchedData(getFromSession(QUERY_PERCENTILE))
      setDisableOpenaiSummarize(false)
    } else {
      return fetchAbortWrapper(fetchData)
    }
  }, [triggerRefresh])

  /****************************************************************************
   ****************************************************************************/
  const fetchData = async (signal: AbortSignal) => {
    setLoadStatus({ ...loadStatus, loading: true, hasError: false })
    setOpenaiContent("")
    setDisableOpenaiSummarize(true)
    const result = await fetchGetUri(
      `${SQLITE_ROOT}/${QUERY_PERCENTILE}?dbname=${chosenDb}`,
      signal,
    )
    // console.log(`query percentile response`, result)

    if (result.hasError) {
      if (result.error !== FETCH_ABORT_MSG)
        setLoadStatus({ ...loadStatus, loading: false, hasError: true })
      return
    }

    setInSession(QUERY_PERCENTILE, result.data)

    processFetchedData(result.data)
    setLoadStatus({ ...loadStatus, loading: false, hasError: false })

    // enable button to summarize table grid with OpenAI
    setDisableOpenaiSummarize(false)
  }

  /*****************************************************************************
   * Process data into headers and datamap for display on table grid
   * @param data
   *****************************************************************************/
  const processFetchedData = (data: any) => {
    const datamap = convertToDataMap(data.headers, data.rows)
    for (let i = 0; i < datamap.length; i++) {
      datamap[i].id = i
    }
    setDatamap(datamap)

    const headersL90ToSet: string[] = []
    const headersU90ToSet: string[] = []
    for (const h of data.headers) {
      if (HEADERS_L90.includes(h)) headersL90ToSet.push(h)
      if (HEADERS_U90.includes(h)) headersU90ToSet.push(h)
    }
    setHeadersL90(headersL90ToSet)
    setHeadersU90(headersU90ToSet)
  }

  const getColDefs = (headersToMap: string[]) => {
    return headersToMap.map((s) => {
      const ret: GridColDef<Record<string, any>> = {
        field: s,
        headerName: HEADER_DISPLAY_MAP[s].displayName,
      }
      ret.align = "right"

      // digits
      ret.valueFormatter = (x: number) => {
        if (s === "query_id") return x
        if (typeof x !== "number") return x
        let decimalPlaces
        if (
          [
            "avgHitsRatio",
            "avgTimeRatio",
            AVG_TIME_LOWER_90,
            AVG_TIME_UPPER_90,
            AVG_HITS_LOWER_90,
            AVG_HITS_UPPER_90,
          ].includes(s)
        ) {
          decimalPlaces = 1
        }
        // else if ([].includes(s)) {
        //   decimalPlaces = 2
        // }
        return x.toLocaleString(undefined, {
          minimumFractionDigits: decimalPlaces,
          maximumFractionDigits: decimalPlaces,
        })
      }

      // highlighting
      ret.cellClassName = (params: GridCellParams<any, number>) => {
        const fld = params.field
        if (params.value === null || params.value === undefined) {
          return ""
        }

        if (fld === AVG_TIME_LOWER_90) {
          return clsx("cell-highlight", {
            yellow: params.value > avgTimeLThresh,
          })
        } else if (fld === AVG_HITS_LOWER_90) {
          return clsx("cell-highlight", {
            orange: params.value > avgPageHitsLThresh,
          })
        } else if (fld === AVG_TIME_UPPER_90) {
          return clsx("cell-highlight", {
            yellow: params.value > avgTimeUThresh,
          })
        } else if (fld === AVG_HITS_UPPER_90) {
          return clsx("cell-highlight", {
            orange: params.value > avgPageHitsUThresh,
          })
        } else if (fld === "avgTimeRatio") {
          return clsx("cell-highlight", {
            negative: params.value >= timeRatioThreshold,
          })
        } else if (fld === "avgHitsRatio") {
          return clsx("cell-highlight", {
            negative: params.value >= hitsRatioThreshold,
          })
        } else {
          return ""
        }
      }

      return ret
    })
  }

  const handleRowClick: GridEventListener<"rowClick"> = async (params) => {
    if (!openDrawer) setOpenDrawer(true)
    fetchQueryText(params.row.query_id)
  }

  const fetchQueryText = async (queryId: string /*signal: AbortSignal*/) => {
    setLoadingQueryText(true)
    const result = await fetchGetUri(
      `${SQLITE_ROOT}/${QUERY_GET_QUERY_TEXT}/${queryId}?dbname=${chosenDb}`,
    )
    const datamap = convertToDataMap(result.data.headers, result.data.rows)
    setQueryId(queryId)
    setQueryText(datamap[0].query)
    setLoadingQueryText(false)
  }

  const handleSummarizeOpenai = async () => {
    setOpenaiLoadStatus({ loading: true, hasError: false })
    const result = await fetchPostUri(
      `openai/percentile`,
      getFromSession(QUERY_PERCENTILE),
    )

    setOpenaiContent(result.data.message)
    setOpenaiLoadStatus({ loading: false, hasError: false })
  }

  return (
    <QueryDrawer
      open={openDrawer}
      setOpen={setOpenDrawer}
      queryText={queryText}
      queryId={queryId}
      loadingQueryText={loadingQueryText}
    >
      <Typography sx={{ fontWeight: "bold" }} variant={"h4"} gutterBottom>
        Percentiles by Elapsed Time
      </Typography>

      {openaiLoadStatus.loading && (
        <>
          Generating summary text...
          <LinearProgress />
        </>
      )}
      {!openaiLoadStatus.loading && openaiLoadStatus.hasError && (
        <Typography>Error loading</Typography>
      )}
      {!openaiLoadStatus.loading && !openaiLoadStatus.hasError && (
        <Box width={"70vw"}>
          <Markdown>{openaiContent}</Markdown>
        </Box>
      )}

      <Card sx={CARD_PROPERTY}>
        <CardContent
          sx={{
            // "& .cell-highlight-theme--cell": {
            //   backgroundColor: "rgba(224, 183, 60, 0.55)",
            //   color: "#1a3e72",
            //   fontWeight: "600",
            // },
            "& .cell-highlight.positive": {
              backgroundColor: "rgba(157, 255, 118, 0.49)",
              color: "#1a3e72",
              fontWeight: "600",
            },
            "& .cell-highlight.negative": {
              backgroundColor: "#d47483",
              color: "#1a3e72",
              fontWeight: "600",
            },
            "& .cell-highlight.orange": {
              backgroundColor: "rgb(255, 191, 0)",
              color: "#1a3e72",
              fontWeight: "600",
            },
            "& .cell-highlight.yellow": {
              backgroundColor: "#FFEA00",
              color: "#1a3e72",
              fontWeight: "600",
            },
          }}
        >
          <Stack direction={"column"} spacing={2}>
            {import.meta.env.VITE_ENABLE_GENAI === "true" && (
              <Stack direction={"row"} spacing={2}>
                <Button
                  disabled={disableOpenaiSummarize}
                  onClick={() => handleSummarizeOpenai()}
                  variant="contained"
                >
                  Summarize
                </Button>
              </Stack>
            )}

            <Typography sx={{ fontWeight: "bold" }} variant="h5" gutterBottom>
              Lower 90
            </Typography>
            <Stack direction={"row"} spacing={2}>
              <TextField
                label={
                  HEADER_DISPLAY_MAP.avgTime_L90.displayName + " Threshold"
                }
                type="number"
                value={avgTimeLThresh}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setAvgTimeLThresh(
                    parseInt((e.target as HTMLInputElement).value),
                  )
                }}
              />
              <TextField
                label={
                  HEADER_DISPLAY_MAP.avgHits_L90.displayName + " Threshold"
                }
                type="number"
                value={avgPageHitsLThresh}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setAvgPageHitsLThresh(
                    parseInt((e.target as HTMLInputElement).value),
                  )
                }}
              />
            </Stack>

            <Stack width="70vw" sx={{ height: "75vh" }}>
              {loadStatus.loading && <CircularProgress />}
              {!loadStatus.loading && loadStatus.hasError && (
                <Typography>Error loading</Typography>
              )}
              {!loadStatus.loading && !loadStatus.hasError && (
                <DataGrid
                  // apiRef={apiRef}
                  autosizeOnMount
                  onRowClick={handleRowClick}
                  rows={datamap}
                  columns={getColDefs(headersL90)}
                />
              )}
            </Stack>

            <Typography sx={{ fontWeight: "bold" }} variant="h5" gutterBottom>
              Upper 90
            </Typography>
            <Stack direction={"row"} spacing={2}>
              <TextField
                label={
                  HEADER_DISPLAY_MAP.avgTime_U90.displayName + " Threshold"
                }
                type="number"
                value={avgTimeUThresh}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setAvgTimeUThresh(
                    parseInt((e.target as HTMLInputElement).value),
                  )
                }}
              />
              <TextField
                label={
                  HEADER_DISPLAY_MAP.avgTime_U90.displayName + " Threshold"
                }
                type="number"
                value={avgPageHitsUThresh}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setAvgPageHitsUThresh(
                    parseInt((e.target as HTMLInputElement).value),
                  )
                }}
              />
              <TextField
                label="Elapsed U90:L90 Ratio"
                type="number"
                value={timeRatioThreshold}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setTimeRatioThreshold(
                    parseInt((e.target as HTMLInputElement).value),
                  )
                }}
              />
              <TextField
                label="Hits U90:L90 Ratio"
                type="number"
                value={hitsRatioThreshold}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setHitsRatioThreshold(
                    parseInt((e.target as HTMLInputElement).value),
                  )
                }}
              />
            </Stack>

            <Stack width="70vw" sx={{ height: "75vh" }}>
              {loadStatus.loading && <CircularProgress />}
              {!loadStatus.loading && loadStatus.hasError && (
                <Typography>Error loading</Typography>
              )}
              {!loadStatus.loading && !loadStatus.hasError && (
                <DataGrid
                  autosizeOnMount
                  onRowClick={handleRowClick}
                  rows={datamap}
                  columns={getColDefs(headersU90)}
                />
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </QueryDrawer>
  )
}
