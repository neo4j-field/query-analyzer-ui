import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CircularProgress,
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
  QUERY_PERCENTILE,
  SQLITE_ROOT,
} from "../../util/apiEndpoints"
import { fetchGetUri } from "../../util/helpers"
import QueryModal from "./QueryModal"

const CARD_PROPERTY = {
  borderRadius: 3,
  boxShadow: 0,
}

export default function PercentileCard() {
  const [loadStatus, setLoadStatus] = useState({
    loading: false,
    hasError: false,
  })
  const [rows, setRows] = useState<any[][]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [openModal, setOpenModal] = useState(false)
  const [chosenQueryId, setChosenQueryId] = useState("")

  // const handleRefetch = async () => {
  //   fetchPercentile()
  // }

  useEffect(() => {
    fetchPercentile()
  }, [])

  /****************************************************************************
   ****************************************************************************/
  const fetchPercentile = async () => {
    setLoadStatus({ ...loadStatus, loading: true, hasError: false })
    const result = await fetchGetUri(`${SQLITE_ROOT}/${QUERY_PERCENTILE}`)
    setLoadStatus({ ...loadStatus, loading: false, hasError: false })
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
          {loadStatus.loading && <CircularProgress />}
          {!loadStatus.loading && loadStatus.hasError && (
            <Typography>Error loading</Typography>
          )}
          {!loadStatus.loading && !loadStatus.hasError && (
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
                          setChosenQueryId(query_id)
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
        </CardContent>
      </Card>

      <QueryModal openModal={openModal} setOpenModal={setOpenModal} queryId={chosenQueryId} />
    </>
  )
}
