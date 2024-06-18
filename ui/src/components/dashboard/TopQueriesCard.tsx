import { useEffect, useState } from "react"
import { Card, CardContent, CircularProgress, Typography } from "@mui/material"
import {
  QUERY_TOP5_QUERIES_EXECUTED,
  SQLITE_ROOT,
} from "../../util/apiEndpoints"
import { convertToDataMap, fetchGetUri } from "../../util/helpers"
import { DataGrid, GridEventListener } from "@mui/x-data-grid"
import QueryModal from "./QueryModal"

const CARD_PROPERTY = {
  borderRadius: 3,
  boxShadow: 0,
}

export default function TopQueriesCard() {
  const [loadStatus, setLoadStatus] = useState({
    loading: false,
    hasError: false,
  })
  const [headers, setHeaders] = useState<string[]>([])
  const [datamap, setDatamap] = useState<Record<string, any>[]>([])
  const [openModal, setOpenModal] = useState(false)
  const [chosenQueryId, setChosenQueryId] = useState("")

  const handleRefetch = async () => fetchData()

  useEffect(() => {
    fetchData()
  }, [])

  /****************************************************************************
   ****************************************************************************/
  const fetchData = async () => {
    setLoadStatus({ ...loadStatus, loading: true, hasError: false })
    const results = await Promise.all([
      fetchGetUri(`${SQLITE_ROOT}/${QUERY_TOP5_QUERIES_EXECUTED}?limit=5`),
    ])
    setLoadStatus({ ...loadStatus, loading: false, hasError: false })

    let i = 0
    for (const result of results) {
      if (result.hasError) {
        console.error(`Error for fetch ${i}: ${result}`)
      }
      i++
    }

    const datamap = convertToDataMap(
      results[0].data.headers,
      results[0].data.rows,
    )
    i = 0
    for (const x of datamap) {
      x.id = i
      i++
    }
    setHeaders(results[0].data.headers)
    setDatamap(datamap)
  }

  const handleRowDblClick: GridEventListener<"rowClick"> = async (params) => {
    setOpenModal(true)
    setChosenQueryId(params.row.query_id)
  }

  return (
    <>
      <Card sx={CARD_PROPERTY}>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            Top 5 Queries
          </Typography>
          {loadStatus.loading && <CircularProgress />}
          {!loadStatus.loading && loadStatus.hasError && (
            <Typography>Error loading log time windows</Typography>
          )}
          {!loadStatus.loading && !loadStatus.hasError && (
            <DataGrid
              autoHeight
              onRowDoubleClick={handleRowDblClick}
              // hideFooter
              rows={datamap}
              columns={headers.map((s) => {
                const ret: any = { field: s, headerName: s, flex: 1 }
                ret.valueFormatter = (x: number) => x.toLocaleString()
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

      <QueryModal
        queryId={chosenQueryId}
        openModal={openModal}
        setOpenModal={setOpenModal}
      />
    </>
  )
}
