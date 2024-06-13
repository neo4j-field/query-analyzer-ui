import { Dispatch, SetStateAction, useEffect, useState } from "react"
import AddIcon from "@mui/icons-material/Add"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"

import {
  QUERY_GET_QUERY_TEXT,
  QUERY_PERCENTILE,
  SQLITE_ROOT,
} from "../util/apiEndpoints"
import { convertToDataMap, fetchGetUri } from "../util/helpers"
import { produce } from "immer"
import { DashboardLoadingStatuses } from "./dashboard/Dashboard"

const CARD_PROPERTY = {
  borderRadius: 3,
  boxShadow: 0,
}

interface Props {
  loading: DashboardLoadingStatuses
  setLoading: Dispatch<SetStateAction<DashboardLoadingStatuses>>
}

export default function PercentileCard({ loading, setLoading }: Props) {
  const [rows, setRows] = useState<any[][]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [openModal, setOpenModal] = useState(false)
  const [loadingQueryText, setLoadingQueryText] = useState(false)
  const [queryText, setQueryText] = useState("")

  const handleRefetch = async () => {
    fetchPercentile()
  }

  const handleCloseModal = () => setOpenModal(false)

  useEffect(() => {
    fetchPercentile()
  }, [])

  /****************************************************************************
   ****************************************************************************/
  const fetchPercentile = async () => {
    setLoading(
      produce((draft) => {
        draft.percentile.isLoading = true
        draft.percentile.hasError = false
      }),
    )
    const result = await fetchGetUri(`${SQLITE_ROOT}/${QUERY_PERCENTILE}`)
    setLoading(
      produce((draft) => {
        draft.percentile.isLoading = false
        draft.percentile.hasError = result.hasError ? true : false
      }),
    )
    // console.log(`query percentile response`, result)

    if (result.hasError) {
      return
    }
    setRows(result.data.rows)
    setHeaders(result.data.headers)
  }

  return (
    <>
      <Card sx={CARD_PROPERTY}>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            90th Percentiles
          </Typography>
          {loading.percentile.isLoading && <CircularProgress />}
          {!loading.percentile.isLoading && loading.percentile.hasError && (
            <Typography>Error loading</Typography>
          )}
          {!loading.percentile.isLoading && !loading.percentile.hasError && (
            <TableContainer component={Paper} sx={{ maxHeight: 800 }}>
              <Table
                stickyHeader
                sx={{ minWidth: 650 }}
                aria-label="simple table"
              >
                <TableHead>
                  <TableRow>
                    {headers.map((header, i) => (
                      <TableCell key={i} align="right">
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, i) => {
                    const query_id = row[headers.indexOf("query_id")]
                    return (
                      <TableRow
                        key={`r${i}`}
                        hover
                        onDoubleClick={async (e) => {
                          setOpenModal(true)
                          setLoadingQueryText(true)
                          const result = await fetchGetUri(
                            `${SQLITE_ROOT}/${QUERY_GET_QUERY_TEXT}/${query_id}`,
                          )
                          setLoadingQueryText(false)
                          const dataMap = convertToDataMap(result.data.headers, result.data.rows)
                          setQueryText(dataMap[0].query)
                        }}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        {row.map((v, j) => (
                          <TableCell key={`c${j}`} align="right">
                            {v}
                          </TableCell>
                        ))}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          <Button startIcon={<AddIcon />} onClick={() => handleRefetch()}>
            {" "}
            Update
          </Button>
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
            onClick={() => navigator.clipboard.writeText(queryText)}
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
                {queryText}
              </Typography>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
