import { Dispatch, SetStateAction, useEffect, useState } from "react"
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
  QUERY_GET_PLANNING_PCT,
  QUERY_LOG_TIME_WINDOW,
  QUERY_QUERY_COUNT_BY_SERVER,
  SQLITE_ROOT,
} from "../../util/apiEndpoints"
import { convertToDataMap, fetchGetUri } from "../../util/helpers"
import { produce } from "immer"
import { DashboardLoadingStatuses } from "./Dashboard"
import { DataGrid } from "@mui/x-data-grid"

const CARD_PROPERTY = {
  borderRadius: 3,
  boxShadow: 0,
}

interface Props {
  loading: DashboardLoadingStatuses
  setLoading: Dispatch<SetStateAction<DashboardLoadingStatuses>>
}

export default function QueriesExecuted({ loading, setLoading }: Props) {
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
    setLoading(
      produce((draft) => {
        draft.queriesExecuted.isLoading = true
        draft.queriesExecuted.hasError = false
      }),
    )
    const results = await Promise.all([
      fetchGetUri(`${SQLITE_ROOT}/${QUERY_QUERY_COUNT_BY_SERVER}`),
    ])
    console.log("results", results)
    setLoading(
      produce((draft) => {
        draft.queriesExecuted.isLoading = false
        draft.queriesExecuted.hasError = false
      }),
    )

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

        {loading.queriesExecuted.isLoading && <CircularProgress />}
        {!loading.queriesExecuted.isLoading && loading.logTimeWindow.hasError && (
          <Typography>Error loading query counts by server</Typography>
        )}
        {!loading.queriesExecuted.isLoading &&
          !loading.queriesExecuted.hasError && (
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
