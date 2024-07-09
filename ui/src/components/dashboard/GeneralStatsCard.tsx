import { useEffect, useState } from "react"
import { Card, CardContent, CircularProgress, Typography } from "@mui/material"

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
import { DataGrid } from "@mui/x-data-grid"
import { useChosenDb } from "../App"

const { QUERY_GENERAL_STATS, rootName: SQLITE_ROOT } = API_URIS.SQLITE_ROOT

const CARD_PROPERTY = {
  borderRadius: 3,
  boxShadow: 0,
}

export default function GeneralStatsCard() {
  const [loadStatus, setLoadStatus] = useState({
    loading: false,
    hasError: false,
  })
  const [firstStartTimestamp, setFirstStartTimestamp] = useState<number>(-1)
  const [lastStartTimestamp, setLastStartTimestamp] = useState<number>(-1)
  const [logDuration, setLogDuration] = useState<number>(-1)
  const [avgPageHits, setAvgPageHits] = useState<number>(-1)
  const [avgPageFaults, setAvgPageFaults] = useState<number>(-1)
  const [avgTimeTaken, setAvgTimeTaken] = useState<number>(-1)
  const [numQueriesExecuted, setNumQueriesExecuted] = useState<number>(-1)
  const { chosenDb, triggerRefresh } = useChosenDb()

  useEffect(() => {
    if (existsInSession(QUERY_GENERAL_STATS)) {
      processFetchedData(getFromSession(QUERY_GENERAL_STATS))
    } else {
      return fetchAbortWrapper(fetchData)
    }
  }, [triggerRefresh])

  /****************************************************************************
   ****************************************************************************/
  const fetchData = async (signal: AbortSignal) => {
    setLoadStatus({ ...loadStatus, loading: true, hasError: false })
    const result = await fetchGetUri(
      `${SQLITE_ROOT}/${QUERY_GENERAL_STATS}?dbname=${chosenDb}`,
      signal,
    )

    if (result.hasError) {
      if (result.error !== FETCH_ABORT_MSG) {
        setLoadStatus({ ...loadStatus, loading: false, hasError: true })
      }
      return
    }

    setInSession(QUERY_GENERAL_STATS, result.data)

    processFetchedData(result.data)
    setLoadStatus({ ...loadStatus, loading: false, hasError: false })
  }

  const processFetchedData = (data: any) => {
    // general stats
    const datamap = convertToDataMap(data.headers, data.rows)[0]
    setFirstStartTimestamp(datamap.firstStartTimestampMs)
    setLastStartTimestamp(datamap.lastStartTimestampMs)
    setLogDuration(datamap.windowDurationMin)
    setAvgPageHits(datamap.avgPageHits)
    setAvgPageFaults(datamap.avgPageFaults)
    setAvgTimeTaken(datamap.avgTimeTaken)
    setNumQueriesExecuted(datamap.numQueriesExecuted)
  }

  return (
    <Card sx={CARD_PROPERTY}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          General Stats
        </Typography>
        {loadStatus.loading && <CircularProgress />}
        {!loadStatus.loading && loadStatus.hasError && (
          <Typography>Error loading</Typography>
        )}
        {!loadStatus.loading && !loadStatus.hasError && (
          <DataGrid
            autoHeight
            columnHeaderHeight={0}
            hideFooter={true}
            rows={[
              {
                id: 1,
                col1: "Start",
                col2: `${new Date(firstStartTimestamp).toISOString()}`,
              },
              {
                id: 2,
                col1: "End",
                col2: `${new Date(lastStartTimestamp).toISOString()}`,
              },
              {
                id: 3,
                col1: "Duration",
                col2: `${logDuration.toFixed(1)} minutes`,
              },
              {
                id: 7,
                col1: "Queries Executed",
                col2: `${numQueriesExecuted.toLocaleString()} queries`,
              },
              {
                id: 6,
                col1: "Avg Time Taken",
                col2: `${avgTimeTaken.toFixed(1)} ms`,
              },
              {
                id: 4,
                col1: "Avg Page Hits",
                col2: `${avgPageHits.toFixed(1)} hits`,
              },
              {
                id: 5,
                col1: "Avg Page Faults",
                col2: `${avgPageFaults.toFixed(1)} faults`,
              },
            ]}
            columns={[
              { field: "col1", headerName: "", flex: 1 },
              { field: "col2", headerName: "", flex: 1 },
            ]}
          />
        )}
      </CardContent>
    </Card>
  )
}
