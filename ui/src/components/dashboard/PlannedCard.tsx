import { useEffect, useState } from "react"
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

const { QUERY_GET_PLANNING_PCT, rootName: SQLITE_ROOT } = API_URIS.SQLITE_ROOT

const CARD_PROPERTY = {
  borderRadius: 3,
  boxShadow: 0,
}

export default function PlannedCard() {
  const [loadStatus, setLoadStatus] = useState({
    loading: false,
    hasError: false,
  })

  const [plannedQueriesPct, setPlannedQueriesPct] = useState<number>(-1)
  const [planElapsedPct, setPlanElapsedPct] = useState<number>(-1)
  const { chosenDb, triggerRefresh } = useChosenDb()

  // const handleRefetch = async () => fetchData()

  useEffect(() => {
    if (existsInSession(QUERY_GET_PLANNING_PCT)) {
      processFetchedData(getFromSession(QUERY_GET_PLANNING_PCT))
    } else {
      return fetchAbortWrapper(fetchData)
    }
  }, [triggerRefresh])

  /****************************************************************************
   ****************************************************************************/
  const fetchData = async (signal: AbortSignal) => {
    setLoadStatus({ ...loadStatus, loading: true, hasError: false })
    const result = await fetchGetUri(
      `${SQLITE_ROOT}/${QUERY_GET_PLANNING_PCT}?dbname=${chosenDb}`,
      signal,
    )

    if (result.hasError) {
      if (result.error !== FETCH_ABORT_MSG) {
        setLoadStatus({ ...loadStatus, loading: false, hasError: true })
      }
      return
    }

    setInSession(QUERY_GET_PLANNING_PCT, result.data)

    processFetchedData(result.data)
    setLoadStatus({ ...loadStatus, loading: false, hasError: false })
  }

  const processFetchedData = (data: any) => {
    setPlannedQueriesPct(data.rows[0][0])
    setPlanElapsedPct(data.rows[0][1])
  }

  return (
    <Card sx={CARD_PROPERTY}>
      <CardContent>
        <Typography gutterBottom variant="h6" component="div">
          Query Executions and Planning Time
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
                col1: "% of all executions",
                col2: `${plannedQueriesPct.toFixed(2)} %`,
              },
              {
                id: 2,
                col1: "% of total elapsed",
                col2: `${planElapsedPct.toFixed(2)} %`,
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
