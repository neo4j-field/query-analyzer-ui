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
  QUERY_LOG_TIME_WINDOW,
  QUERY_QUERY_COUNT_BY_SERVER,
  SQLITE_ROOT,
} from "../util/apiEndpoints"
import { convertToDataMap, fetchGetUri } from "../util/helpers"
import { produce } from "immer"
import { LoadingStatuses } from "../App"

const CARD_PROPERTY = {
  borderRadius: 3,
  boxShadow: 0,
}

interface Props {
  loading: LoadingStatuses
  setLoading: Dispatch<SetStateAction<LoadingStatuses>>
}

export default function LogDetailsCard({ loading, setLoading }: Props) {
  const [firstStartTimestamp, setFirstStartTimestamp] = useState<number>(-1)
  const [lastStartTimestamp, setLastStartTimestamp] = useState<number>(-1)
  const [logDuration, setLogDuration] = useState<number>(-1)
  const [rows, setRows] = useState<any[][]>([])
  const [headers, setHeaders] = useState<string[]>([])

  const handleRefetch = async () => {
    fetchLogTimeWindow()
    fetchQueryCountByServer()
  }

  useEffect(() => {
    fetchLogTimeWindow()
    fetchQueryCountByServer()
  }, [])

  /****************************************************************************
   ****************************************************************************/
  const fetchLogTimeWindow = async () => {
    setLoading(
      produce((draft) => {
        draft.logTimeWindow.isLoading = true
        draft.logTimeWindow.hasError = false
      }),
    )
    const result = await fetchGetUri(`${SQLITE_ROOT}/${QUERY_LOG_TIME_WINDOW}`)
    setLoading(
      produce((draft) => {
        draft.logTimeWindow.isLoading = false
        draft.logTimeWindow.hasError = result.hasError ? true : false
      }),
    )

    if (result.hasError) {
      return
    }

    const datamap = convertToDataMap(result.data.headers, result.data.rows)[0]
    setFirstStartTimestamp(datamap["firstStartTimestampMs"])
    setLastStartTimestamp(datamap["lastStartTimestampMs"])
    setLogDuration(datamap["windowDurationMin"])
  }

  /****************************************************************************
   ****************************************************************************/
  const fetchQueryCountByServer = async () => {
    setLoading(
      produce((draft) => {
        draft.queryCountByServer.isLoading = true
        draft.queryCountByServer.hasError = false
      }),
    )
    const result = await fetchGetUri(
      `${SQLITE_ROOT}/${QUERY_QUERY_COUNT_BY_SERVER}`,
    )
    setLoading(
      produce((draft) => {
        draft.queryCountByServer.isLoading = false
        draft.queryCountByServer.hasError = result.hasError ? true : false
      }),
    )

    if (result.hasError) {
      return
    }

    setRows(result.data.rows)
    setHeaders(result.data.headers)
  }

  return (
    <Card sx={CARD_PROPERTY}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          Log Details
        </Typography>
        {loading.logTimeWindow.isLoading && <CircularProgress />}
        {!loading.logTimeWindow.isLoading && loading.logTimeWindow.hasError && (
          <Typography>Error loading log time windows</Typography>
        )}
        {!loading.logTimeWindow.isLoading &&
          !loading.logTimeWindow.hasError && (
            <>
              <Typography variant="body2">
                Start: {`${new Date(firstStartTimestamp).toISOString()}`}
              </Typography>
              <Typography variant="body2">
                End: {`${new Date(lastStartTimestamp).toISOString()}`}
              </Typography>
              <Typography variant="body2">
                Log Duration: {`${logDuration} minutes`}
              </Typography>
            </>
          )}

        {loading.queryCountByServer.isLoading && <CircularProgress />}
        {!loading.queryCountByServer.isLoading &&
          loading.queryCountByServer.hasError && (
            <Typography>Error loading query counts by server</Typography>
          )}
        {!loading.queryCountByServer.isLoading &&
          !loading.queryCountByServer.hasError && (
            
            <TableContainer component={Paper} sx={{ maxHeight: 800 }}>
              <Table
                stickyHeader
                sx={{ minWidth: 650 }}
                aria-label="simple table"
              >
                <TableHead>
                  <TableRow>
                    {headers.map((header, i) => (
                      <TableCell key={i} align="left">
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, i) => {
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
