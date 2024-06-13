import { useEffect, useState } from "react"
import AddIcon from "@mui/icons-material/Add"
import {
  Button,
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
  QUERY_QUERY_COUNT_BY_SERVER,
  SQLITE_ROOT,
} from "../../util/apiEndpoints"
import { fetchGetUri } from "../../util/helpers"

const CARD_PROPERTY = {
  borderRadius: 3,
  boxShadow: 0,
}

export default function QueriesExecuted() {
  const [loadStatus, setLoadStatus] = useState({loading: false, hasError: false})
  const [queryCountByServerRows, setQueryCountByServerRows] = useState<any[][]>(
    [],
  )
  const [queryCountByServerHeaders, setQueryCountByServerHeaders] = useState<
    string[]
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
  }

  return (
    <Card sx={CARD_PROPERTY}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          Queries Executed
        </Typography>

        {loadStatus.loading && <CircularProgress />}
        {!loadStatus.loading && loadStatus.hasError && (
          <Typography>Error loading query counts by server</Typography>
        )}
        {!loadStatus.loading &&
          !loadStatus.hasError && (
            <TableContainer component={Paper} sx={{ maxHeight: 800 }}>
              <Table
                stickyHeader
                // sx={{ }}
                aria-label="simple table"
              >
                <TableHead>
                  <TableRow>
                    {queryCountByServerHeaders.map((header, i) => (
                      <TableCell key={i} align="left">
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {queryCountByServerRows.map((row, i) => {
                    return (
                      <TableRow
                        key={`r${i}`}
                        hover
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        {row.map((v, j) => (
                          <TableCell key={`c${j}`} align="left">
                            {v === null ? "null" : v}
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
  )
}
