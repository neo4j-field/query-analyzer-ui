import { useEffect, useState } from "react"
// import AddIcon from "@mui/icons-material/Add"
import { Card, CardContent, CircularProgress, Typography } from "@mui/material"

import {
  QUERY_QUERY_COUNT_BY_SERVER,
  SQLITE_ROOT,
} from "../../util/apiEndpoints"
import { convertToDataMap, fetchGetUri } from "../../util/helpers"
import { DataGrid } from "@mui/x-data-grid"

const CARD_PROPERTY = {
  borderRadius: 3,
  boxShadow: 0,
}

export default function QueriesExecutedByServer() {
  const [loadStatus, setLoadStatus] = useState({
    loading: false,
    hasError: false,
  })
  const [queryCountByServerRows, setQueryCountByServerRows] = useState<any[][]>(
    [],
  )
  const [queryCountByServerHeaders, setQueryCountByServerHeaders] = useState<
    string[]
  >([])
  const [queryCountByServerData, setQueryCountByServerData] = useState<
    Record<string, any>[]
  >([])

  const handleRefetch = async () => {
    fetchData()
  }

  useEffect(() => {
    fetchData()
  }, [])

  /****************************************************************************
   ****************************************************************************/
  const fetchData = async () => {
    setLoadStatus({ ...loadStatus, loading: true, hasError: false })
    const results = await Promise.all([
      fetchGetUri(`${SQLITE_ROOT}/${QUERY_QUERY_COUNT_BY_SERVER}`),
    ])
    setLoadStatus({ ...loadStatus, loading: false, hasError: false })

    let i = 0
    for (const result of results) {
      if (result.hasError) {
        console.error(`Error for fetch ${i}: ${result}`)
      }
      i++
    }
    // query count
    setQueryCountByServerRows(results[0].data.rows)
    setQueryCountByServerHeaders(results[0].data.headers)
    const datamap = convertToDataMap(
      results[0].data.headers,
      results[0].data.rows,
    )
    for (let i = 0; i < datamap.length; i++) {
      datamap[i].id = i
    }
    setQueryCountByServerData(datamap)
  }

  return (
    <Card sx={CARD_PROPERTY}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          Queries Executed By Server
        </Typography>

        {loadStatus.loading && <CircularProgress />}
        {!loadStatus.loading && loadStatus.hasError && (
          <Typography>Error loading query counts by server</Typography>
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

        {/* <Button startIcon={<AddIcon />} onClick={() => handleRefetch()}>
          {" "}
          Update
        </Button> */}
      </CardContent>
    </Card>
  )
}
