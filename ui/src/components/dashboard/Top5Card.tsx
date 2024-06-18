import { useEffect, useState } from "react"
import { Card, CardContent, CircularProgress, Typography } from "@mui/material"
import { SQLITE_ROOT } from "../../util/apiEndpoints"
import { convertToDataMap, fetchGetUri } from "../../util/helpers"
import { DataGrid, GridEventListener } from "@mui/x-data-grid"
import QueryModal from "./QueryModal"

const CARD_PROPERTY = {
  borderRadius: 3,
  boxShadow: 0,
}

interface Props {
  uriName: string
  title: string
}

export default function Top5Card({ uriName, title }: Props) {
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
    const result = await fetchGetUri(`${SQLITE_ROOT}/${uriName}?limit=5`)
    setLoadStatus({ ...loadStatus, loading: false, hasError: false })

    if (result.hasError) {
      console.error(`Error for fetch: ${result}`)
    }


    const datamap = convertToDataMap(
      result.data.headers,
      result.data.rows,
    )
    for (let i = 0; i < datamap.length; i++) {
      datamap[i].id = i
    }
    setHeaders(result.data.headers)
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
            {title}
          </Typography>
          {loadStatus.loading && <CircularProgress />}
          {!loadStatus.loading && loadStatus.hasError && (
            <Typography>Error loading log time windows</Typography>
          )}
          {!loadStatus.loading && !loadStatus.hasError && (
            <DataGrid
              autoHeight
              onRowDoubleClick={handleRowDblClick}
              hideFooter
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
