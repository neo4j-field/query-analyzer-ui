import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import {
  QUERY_GET_QUERY_TEXT,
  QUERY_TOP5_PAGE_HITS,
  SQLITE_ROOT,
} from "../../util/apiEndpoints"
import { convertToDataMap, fetchGetUri } from "../../util/helpers"
import { DataGrid, GridEventListener } from "@mui/x-data-grid"

const CARD_PROPERTY = {
  borderRadius: 3,
  boxShadow: 0,
}

export default function TopPageHitsCard() {
  const [loadStatus, setLoadStatus] = useState({
    loading: false,
    hasError: false,
  })
  const [headers, setHeaders] = useState<string[]>([])
  const [datamap, setDatamap] = useState<Record<string, any>[]>([])
  const [modalQryText, setModalQryText] = useState<string>("")
  const [openModal, setOpenModal] = useState(false)
  const [loadingQueryText, setLoadingQueryText] = useState(false)

  const handleRefetch = async () => fetchData()

  const handleCloseModal = () => setOpenModal(false)

  useEffect(() => {
    fetchData()
  }, [])

  /****************************************************************************
   ****************************************************************************/
  const fetchData = async () => {
    setLoadStatus({ ...loadStatus, loading: true, hasError: false })
    const results = await Promise.all([
      fetchGetUri(`${SQLITE_ROOT}/${QUERY_TOP5_PAGE_HITS}?limit=5`),
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
    console.log(datamap)
  }

  const handleRowDblClick: GridEventListener<"rowClick"> = async (params) => {
    setOpenModal(true)
    setLoadingQueryText(true)
    const result = await fetchGetUri(
      `${SQLITE_ROOT}/${QUERY_GET_QUERY_TEXT}/${params.row.query_id}`,
    )
    setLoadingQueryText(false)
    const datamap = convertToDataMap(result.data.headers, result.data.rows)
    setModalQryText(datamap[0].query)
  }

  return (
    <>
      <Card sx={CARD_PROPERTY}>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            Top 5 Page Hits
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

      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth={"xs"}
        fullWidth
      >
        <DialogTitle display={"inline"}>
          <Typography>Query Text</Typography>
          <IconButton
            onClick={() => navigator.clipboard.writeText(modalQryText)}
            edge="start"
            sx={{ marginRight: 5 }}
          >
            <ContentCopyIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {loadingQueryText && <CircularProgress />}
          {!loadingQueryText && (
            <>
              <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                {modalQryText}
              </Typography>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
