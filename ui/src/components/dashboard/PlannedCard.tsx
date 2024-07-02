import { useEffect, useState } from "react"
import { Card, CardContent, CircularProgress, Typography } from "@mui/material"

import { QUERY_GET_PLANNING_PCT, SQLITE_ROOT } from "../../util/apiEndpoints"
import { FETCH_ABORT_MSG, fetchAbortWrapper, fetchGetUri } from "../../util/helpers"
import { DataGrid } from "@mui/x-data-grid"
import { useChosenDb } from "../App"

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
    return fetchAbortWrapper(fetchData)
  }, [triggerRefresh])

  /****************************************************************************
   ****************************************************************************/
  const fetchData = async (signal: AbortSignal) => {
    setLoadStatus({ ...loadStatus, loading: true, hasError: false })
    const results = await Promise.all([
      fetchGetUri(
        `${SQLITE_ROOT}/${QUERY_GET_PLANNING_PCT}?dbname=${chosenDb}`,
      ),
      signal,
    ])

    let i = 0
    for (const result of results) {
      if (result.hasError) {
        if (result.error !== FETCH_ABORT_MSG) {
          console.error(`Error for fetch ${i}: ${result}`)
          setLoadStatus({ ...loadStatus, loading: false, hasError: true })
        }
        return
      }
      i++
    }
    setPlannedQueriesPct(results[0].data.rows[0][0])
    setPlanElapsedPct(results[0].data.rows[0][1])
    setLoadStatus({ ...loadStatus, loading: false, hasError: false })
  }

  return (
    <Card sx={CARD_PROPERTY}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          Planning
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
                col1: "Queries Planned",
                col2: `${plannedQueriesPct.toFixed(2)} %`,
              },
              {
                id: 2,
                col1: "Planned / Elapsed",
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
