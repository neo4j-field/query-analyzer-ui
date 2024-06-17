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
  QUERY_GET_PLANNING_PCT,
  SQLITE_ROOT,
} from "../../util/apiEndpoints"
import { convertToDataMap, fetchGetUri } from "../../util/helpers"
import { DataGrid } from "@mui/x-data-grid"

const CARD_PROPERTY = {
  borderRadius: 3,
  boxShadow: 0,
}

export default function PlannedCard() {
  const [loadStatus, setLoadStatus] = useState({
    loading: false,
    hasError: false,
  })
  const [numUniqueQueries, setNumUniqueQueries] = useState<number>(-1)

  const [planningPercent, setPlanningPercent] = useState<number>(-1)

  const handleRefetch = async () => fetchData()
  useEffect(() => {
    fetchData()
  }, [])

  /****************************************************************************
   ****************************************************************************/
  const fetchData = async () => {
    setLoadStatus({ ...loadStatus, loading: true, hasError: false })
    const results = await Promise.all([
      fetchGetUri(`${SQLITE_ROOT}/${QUERY_GET_PLANNING_PCT}`),
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

    // // log time window
    // const datamap = convertToDataMap(
    //   results[0].data.headers,
    //   results[0].data.rows,
    // )[0]
    // setFirstStartTimestamp(datamap["firstStartTimestampMs"])
    // setLastStartTimestamp(datamap["lastStartTimestampMs"])
    // setLogDuration(datamap["windowDurationMin"])

    // // planning percent
    // setPlanningPercent(results[1].data.rows[0][0])
  }

  return (
    <Card sx={CARD_PROPERTY}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          Queries Executed, remove
        </Typography>
        {loadStatus.loading && <CircularProgress />}
        {!loadStatus.loading && loadStatus.hasError && (
          <Typography>Error loading log time windows</Typography>
        )}
        {!loadStatus.loading && !loadStatus.hasError && (
          // <TableContainer component={Paper} sx={{ maxHeight: 800 }}>
          //   <Table
          //     stickyHeader
          //     aria-label="simple table"
          //   >
          //     <TableBody>
          //       {[
          //         ["Start", `${new Date(firstStartTimestamp).toISOString()}`],
          //         ["End", `${new Date(lastStartTimestamp).toISOString()}`],
          //         ["Duration", `${logDuration} minutes`],
          //         [
          //           "Planning / Elapsed Time",
          //           `${planningPercent.toFixed(2)} %`,
          //         ],
          //       ].map((row, i) => {
          //         return (
          //           <TableRow
          //             key={`r${i}`}
          //             hover
          //             sx={{
          //               "&:last-child td, &:last-child th": { border: 0 },
          //             }}
          //           >
          //             {row.map((v, j) => (
          //               <TableCell key={`c${j}`} align="left">
          //                 {v === null ? "null" : v}
          //               </TableCell>
          //             ))}
          //           </TableRow>
          //         )
          //       })}
          //     </TableBody>
          //   </Table>
          // </TableContainer>
        //   <DataGrid
        //     autoHeight
        //     slots={{
        //       columnHeaders: () => null,
        //       footer: () => null,
        //     }}
        //     rows={[
        //       {
        //         id: 1,
        //         col1: "Start",
        //         col2: `${new Date(firstStartTimestamp).toISOString()}`,
        //       },
        //       {
        //         id: 2,
        //         col1: "End",
        //         col2: `${new Date(lastStartTimestamp).toISOString()}`,
        //       },
        //       { id: 3, col1: "Duration", col2: `${logDuration} minutes` },
        //       {
        //         id: 4,
        //         col1: "Planning / Elapsed Time",
        //         col2: `${planningPercent.toFixed(2)} %`,
        //       },
        //     ]}
        //     columns={[
        //       { field: "col1", headerName: "", flex: 1 },
        //       { field: "col2", headerName: "", flex: 1 },
        //     ]}
        //   />
        <div>todo</div>
        )}

        {/* <Button startIcon={<AddIcon />} onClick={() => handleRefetch()}>
          {" "}
          Update
        </Button> */}
      </CardContent>
    </Card>
  )
}
