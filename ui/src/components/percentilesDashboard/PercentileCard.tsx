import { useEffect, useState } from "react"
import { Card, CardContent, CircularProgress, Typography } from "@mui/material"
import { QUERY_PERCENTILE, SQLITE_ROOT } from "../../util/apiEndpoints"
import {
  FETCH_ABORT_MSG,
  convertToDataMap,
  fetchAbortWrapper,
  fetchGetUri,
} from "../../util/helpers"
import { useChosenDb } from "../App"
import { DataGrid, GridEventListener, useGridApiRef } from "@mui/x-data-grid"

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
  const { chosenDb, triggerRefresh } = useChosenDb()
  const apiRef = useGridApiRef()

  useEffect(() => {
    return fetchAbortWrapper(fetchData)
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

    const datamap = convertToDataMap(result.data.headers, result.data.rows)
    for (let i = 0; i < datamap.length; i++) {
      datamap[i].id = i
    }
    setHeaders(result.data.headers)
    setDatamap(datamap)
    setLoadStatus({ ...loadStatus, loading: false, hasError: false })
  }

  /****************************************************************************
   ****************************************************************************/
  // const handleRowDblClick: GridEventListener<"rowClick"> = async (params) => {
  //   setOpenModal(true)
  //   setChosenQueryId(params.row.query_id)
  // }

  console.log(
    headers.map((s) => {
      const ret: any = { field: s, headerName: s }
      ret.valueFormatter = (x: number) => x.toLocaleString()
      return ret
    }),
  )

  return (
    <Card sx={CARD_PROPERTY}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          90th Percentiles
        </Typography>
        {loadStatus.loading && <CircularProgress />}
        {!loadStatus.loading && loadStatus.hasError && (
          <Typography>Error loading</Typography>
        )}
        {!loadStatus.loading && !loadStatus.hasError && (
          <DataGrid
            apiRef={apiRef}
            autosizeOnMount
            // onRowDoubleClick={handleRowDblClick}
            // hideFooter
            rows={datamap}
            columns={headers.map((s) => {
              const ret: any = { field: s, headerName: s }
              ret.valueFormatter = (x: number) => x.toLocaleString()
              return ret
            })}
            sx={{
              height: "75vh",
            }}
          />
        )}
      </CardContent>
    </Card>
  )
}
