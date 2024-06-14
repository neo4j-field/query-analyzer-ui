import { useEffect, useState } from "react"
// import AddIcon from "@mui/icons-material/Add"
import {
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/material"

import {
  QUERY_COUNT_UNIQUE_QUERIES,
  SQLITE_ROOT,
} from "../../util/apiEndpoints"
import { fetchGetUri } from "../../util/helpers"
import { DataGrid } from "@mui/x-data-grid"

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

  const handleRefetch = async () => fetchData()
  useEffect(() => {
    fetchData()
  }, [])

  /****************************************************************************
   ****************************************************************************/
  const fetchData = async () => {
    setLoadStatus({ ...loadStatus, loading: true, hasError: false })
    const results = await Promise.all([
      fetchGetUri(`${SQLITE_ROOT}/${QUERY_COUNT_UNIQUE_QUERIES}`),
    ])
    setLoadStatus({ ...loadStatus, loading: false, hasError: false })

    let i = 0
    for (const result of results) {
      if (result.hasError) {
        console.error(`Error for fetch ${i}: ${result}`)
      }
      i++
    }

    setNumUniqueQueries(results[0].data.rows[0])
  }

  return (
    <Card sx={CARD_PROPERTY}>
      <CardContent>
        {loadStatus.loading && <CircularProgress />}
        {!loadStatus.loading && loadStatus.hasError && (
          <Typography>Error loading log time windows</Typography>
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

        {/* <Button startIcon={<AddIcon />} onClick={() => handleRefetch()}>
          {" "}
          Update
        </Button> */}
      </CardContent>
    </Card>
  )
}
