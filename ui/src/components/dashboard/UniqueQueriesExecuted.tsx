import { useEffect, useState } from "react"
// import AddIcon from "@mui/icons-material/Add"
import { Card, CardContent, CircularProgress, Typography } from "@mui/material"

import { API_URIS } from "../../util/constants"
import {
  FETCH_ABORT_MSG,
  existsInSession,
  fetchAbortWrapper,
  fetchGetUri,
  getFromSession,
  setInSession,
} from "../../util/helpers"
import { DataGrid } from "@mui/x-data-grid"
import { useChosenDb } from "../App"

const { QUERY_COUNT_UNIQUE_QUERIES, rootName: SQLITE_ROOT } =
  API_URIS.SQLITE_ROOT

const CARD_PROPERTY = {
  borderRadius: 3,
  boxShadow: 0,
}

export default function UniqueQueriesExecutedCard() {
  const [loadStatus, setLoadStatus] = useState({
    loading: false,
    hasError: false,
  })
  const [numUniqueQueries, setNumUniqueQueries] = useState<number>(-1)
  const { chosenDb, triggerRefresh } = useChosenDb()

  useEffect(() => {
    if (existsInSession(QUERY_COUNT_UNIQUE_QUERIES)) {
      processFetchedData(getFromSession(QUERY_COUNT_UNIQUE_QUERIES))
    } else {
      return fetchAbortWrapper(fetchData)
    }
  }, [triggerRefresh])

  /****************************************************************************
   ****************************************************************************/
  const fetchData = async (signal: AbortSignal) => {
    setLoadStatus({ ...loadStatus, loading: true, hasError: false })
    const result = await fetchGetUri(
      `${SQLITE_ROOT}/${QUERY_COUNT_UNIQUE_QUERIES}?dbname=${chosenDb}`,
      signal,
    )

    if (result.hasError) {
      if (result.error !== FETCH_ABORT_MSG) {
        setLoadStatus({ ...loadStatus, loading: false, hasError: true })
      }
      return
    }

    setInSession(QUERY_COUNT_UNIQUE_QUERIES, result.data)

    processFetchedData(result.data)
    setLoadStatus({ ...loadStatus, loading: false, hasError: false })
  }

  const processFetchedData = (data: any) => {
    setNumUniqueQueries(data.rows[0])
  }

  return (
    <Card sx={CARD_PROPERTY}>
      <CardContent>
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
                col1: "Total Unique Queries",
                col2: numUniqueQueries,
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
