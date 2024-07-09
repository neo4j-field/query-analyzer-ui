import { useEffect, useState } from "react"
// import AddIcon from "@mui/icons-material/Add"
import { Card, CardContent, CircularProgress, Typography } from "@mui/material"

import { API_URIS } from "../../util/constants"
import {
  FETCH_ABORT_MSG,
  convertToDataMap,
  fetchAbortWrapper,
  fetchGetUri,
} from "../../util/helpers"
import { DataGrid } from "@mui/x-data-grid"
import { useChosenDb } from "../App"

const { QUERY_QUERY_COUNT_BY_SERVER, rootName: SQLITE_ROOT } =
  API_URIS.SQLITE_ROOT

const CARD_PROPERTY = {
  borderRadius: 3,
  boxShadow: 0,
}

export default function QueriesExecutedByServer() {
  const [loadStatus, setLoadStatus] = useState({
    loading: false,
    hasError: false,
  })
  // const [queryCountByServerRows, setQueryCountByServerRows] = useState<any[][]>(
  //   [],
  // )
  const [queryCountByServerHeaders, setQueryCountByServerHeaders] = useState<
    string[]
  >([])
  const [queryCountByServerData, setQueryCountByServerData] = useState<
    Record<string, any>[]
  >([])
  const { chosenDb, triggerRefresh } = useChosenDb()

  // const handleRefetch = async () => {
  //   fetchData()
  // }

  useEffect(() => {
    return fetchAbortWrapper(fetchData)
  }, [triggerRefresh])

  /****************************************************************************
   ****************************************************************************/
  const fetchData = async (signal: AbortSignal) => {
    setLoadStatus({ ...loadStatus, loading: true, hasError: false })
    const results = await Promise.all([
      fetchGetUri(
        `${SQLITE_ROOT}/${QUERY_QUERY_COUNT_BY_SERVER}?dbname=${chosenDb}`,
      ),
      signal,
    ])

    let i = 0
    for (const result of results) {
      if (result.hasError) {
        if (result.hasError !== FETCH_ABORT_MSG) {
          console.error(`Error for fetch ${i}: ${result}`)
          setLoadStatus({ ...loadStatus, loading: false, hasError: true })
        }
        return
      }
      i++
    }
    // query count
    // setQueryCountByServerRows(results[0].data.rows)
    setQueryCountByServerHeaders(results[0].data.headers)
    const datamap = convertToDataMap(
      results[0].data.headers,
      results[0].data.rows,
    )
    for (let i = 0; i < datamap.length; i++) {
      datamap[i].id = i
    }
    setQueryCountByServerData(datamap)
    setLoadStatus({ ...loadStatus, loading: false, hasError: false })
  }

  return (
    <Card sx={CARD_PROPERTY}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          Queries Executed By Server
        </Typography>

        {loadStatus.loading && <CircularProgress />}
        {!loadStatus.loading && loadStatus.hasError && (
          <Typography>Error loading</Typography>
        )}
        {!loadStatus.loading && !loadStatus.hasError && (
          <DataGrid
            autoHeight
            slots={{
              footer: () => null,
            }}
            rows={queryCountByServerData}
            columns={queryCountByServerHeaders.map((s) => {
              const ret: any = { field: s, headerName: s, flex: 1 }
              if (s === "Number of Queries Run") {
                ret.valueFormatter = (x: number) => x.toLocaleString()
              }
              return ret
            })}
          />
        )}
      </CardContent>
    </Card>
  )
}
