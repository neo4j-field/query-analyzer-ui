import { ChangeEvent, useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CircularProgress,
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

const {
  QUERY_GET_QUERY_TEXT,
  QUERY_PERCENTILE,
  rootName: SQLITE_ROOT,
} = API_URIS.SQLITE_ROOT

const CARD_PROPERTY = {
  borderRadius: 3,
  boxShadow: 0,
}

export default function PercentileCard() {
  const [loadStatus, setLoadStatus] = useState({
    loading: false,
    hasError: false,
  })
  const [headers, setHeaders] = useState<string[]>([])
  const [datamap, setDatamap] = useState<Record<string, any>[]>([])
  const [avgTimeThresh, setAvgTimeThresh] = useState<number>(1)
  const [avgPageHitsThresh, setAvgPageHitsThresh] = useState<number>(100000)
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
      processFetchedData(getFromSession(QUERY_PERCENTILE))
    } else {
      return fetchAbortWrapper(fetchData)
    }
  }, [triggerRefresh])

  /****************************************************************************
   ****************************************************************************/
  const fetchData = async (signal: AbortSignal) => {
    setLoadStatus({ ...loadStatus, loading: true, hasError: false })
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
  }

  const processFetchedData = (data: any) => {
    const datamap = convertToDataMap(data.headers, data.rows)
    for (let i = 0; i < datamap.length; i++) {
      datamap[i].id = i
    }
    setHeaders(data.headers)
    setDatamap(datamap)
  }

  const getColDefs = () => {
    return headers.map((s) => {
      const ret: GridColDef<Record<string, any>> = {
        field: s,
        headerName: s,
      }
      ret.align = "right"

      // digits
      ret.valueFormatter = (x: number) => {
        if (typeof x !== "number") return x
        let decimalPlaces
        if (
          [
            "ratio",
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
            yellow: params.value > avgTimeThresh,
          })
        } else if (fld === AVG_HITS_LOWER_90) {
          return clsx("cell-highlight", {
            orange: params.value > avgPageHitsThresh,
          })
        } else if (fld === AVG_TIME_UPPER_90) {
          return clsx("cell-highlight", {
            negative:
              params.value / params.row[AVG_TIME_LOWER_90] >=
              timeRatioThreshold,
          })
        } else if (fld === AVG_HITS_UPPER_90) {
          return clsx("cell-highlight", {
            negative:
              params.value / params.row[AVG_HITS_LOWER_90] >=
              hitsRatioThreshold,
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

  return (
    <QueryDrawer
      open={openDrawer}
      setOpen={setOpenDrawer}
      queryText={queryText}
      queryId={queryId}
      loadingQueryText={loadingQueryText}
    >
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
            <Stack direction={"row"} spacing={2}>
              <TextField
                label="Avg Time Lower 90 Threshold"
                type="number"
                value={avgTimeThresh}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setAvgTimeThresh(
                    parseInt((e.target as HTMLInputElement).value),
                  )
                }}
              />
              <TextField
                label="Avg Page Hits Upper 90 Threshold"
                type="number"
                value={avgPageHitsThresh}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setAvgPageHitsThresh(
                    parseInt((e.target as HTMLInputElement).value),
                  )
                }}
              />
              <TextField
                label="Avg Time Upper 90 Ratio Threshold"
                type="number"
                value={timeRatioThreshold}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setTimeRatioThreshold(
                    parseInt((e.target as HTMLInputElement).value),
                  )
                }}
              />
              <TextField
                label="Avg Hits Upper 90 Ratio Threshold"
                type="number"
                value={hitsRatioThreshold}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setHitsRatioThreshold(
                    parseInt((e.target as HTMLInputElement).value),
                  )
                }}
              />
            </Stack>

            <Stack sx={{ height: "75vh" }}>
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
                  columns={getColDefs()}
                />
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </QueryDrawer>
  )
}
