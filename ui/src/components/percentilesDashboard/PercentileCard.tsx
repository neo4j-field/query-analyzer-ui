import { KeyboardEvent, useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material"
import { QUERY_PERCENTILE, SQLITE_ROOT } from "../../util/apiEndpoints"
import {
  FETCH_ABORT_MSG,
  convertToDataMap,
  fetchAbortWrapper,
  fetchGetUri,
} from "../../util/helpers"
import { useChosenDb } from "../App"
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  useGridApiRef,
} from "@mui/x-data-grid"
import clsx from "clsx"

const CARD_PROPERTY = {
  borderRadius: 3,
  boxShadow: 0,
}

export default function PercentileCard() {
  const [loadStatus, setLoadStatus] = useState({
    loading: false,
    hasError: false,
  })
  const [headers, setHeaders] = useState<string[]>([])
  const [datamap, setDatamap] = useState<Record<string, any>[]>([])
  const [avgPageHitsThresh, setAvgPageHitsThresh] = useState<number>(100000)
  const { chosenDb, triggerRefresh } = useChosenDb()
  // const apiRef = useGridApiRef()

  useEffect(() => {
    return fetchAbortWrapper(fetchData)
  }, [triggerRefresh])

  /****************************************************************************
   ****************************************************************************/
  const fetchData = async (signal: AbortSignal) => {
    setLoadStatus({ ...loadStatus, loading: true, hasError: false })
    const result = await fetchGetUri(
      `${SQLITE_ROOT}/${QUERY_PERCENTILE}?dbname=${chosenDb}`,
      signal,
    )
    // console.log(`query percentile response`, result)

    if (result.hasError) {
      if (result.error !== FETCH_ABORT_MSG)
        setLoadStatus({ ...loadStatus, loading: false, hasError: true })
      return
    }

    const datamap = convertToDataMap(result.data.headers, result.data.rows)
    for (let i = 0; i < datamap.length; i++) {
      datamap[i].id = i
    }
    setHeaders(result.data.headers)
    setDatamap(datamap)
    setLoadStatus({ ...loadStatus, loading: false, hasError: false })
  }

  /****************************************************************************
   ****************************************************************************/
  // const handleRowDblClick: GridEventListener<"rowClick"> = async (params) => {
  //   setOpenModal(true)
  //   setChosenQueryId(params.row.query_id)
  // }

  console.log(
    headers.map((s) => {
      const ret: any = { field: s, headerName: s }
      ret.valueFormatter = (x: number) => x.toLocaleString()
      return ret
    }),
  )

  const getColDefs = () => {
    return headers.map((s) => {
      const ret: GridColDef<Record<string, any>> = {
        field: s,
        headerName: s,
      }
      ret.align = "right"

      // digits
      ret.valueFormatter = (x: number) => {
        if (typeof x !== "number") return x
        const sLower = s.toLowerCase()
        let decimalPlaces
        if (["ratio"].includes(sLower)) {
          decimalPlaces = 1
        } else if (
          [
            "avgtime_lower90",
            "avgtime_upper90",
            "avghits_lower90",
            "avghits_upper90",
          ].includes(sLower)
        ) {
          decimalPlaces = 2
        }
        return x.toLocaleString(undefined, {
          minimumFractionDigits: decimalPlaces,
          maximumFractionDigits: decimalPlaces,
        })
      }

      // highlighting
      if (s === "avgHits_lower90") {
        ret.cellClassName = (params: GridCellParams<any, number>) => {
          if (params.value == null) {
            return ""
          }

          return clsx("super-app", {
            orange: params.value > avgPageHitsThresh,
          })
        }
      }
      return ret
    })
  }

  return (
    <Card sx={CARD_PROPERTY}>
      <CardContent
        sx={{
          // "& .super-app-theme--cell": {
          //   backgroundColor: "rgba(224, 183, 60, 0.55)",
          //   color: "#1a3e72",
          //   fontWeight: "600",
          // },
          "& .super-app.positive": {
            backgroundColor: "rgba(157, 255, 118, 0.49)",
            color: "#1a3e72",
            fontWeight: "600",
          },
          "& .super-app.negative": {
            backgroundColor: "#d47483",
            color: "#1a3e72",
            fontWeight: "600",
          },
          "& .super-app.orange": {
            backgroundColor: "rgb(255, 191, 0)",
            color: "#1a3e72",
            fontWeight: "600",
          },
        }}
      >
        <Typography gutterBottom variant="h5" component="div">
          90th Percentiles
        </Typography>

        <TextField
          label="Average Page Hits Threshold"
          type="number"
          onKeyUp={(e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === "Enter") {
              setAvgPageHitsThresh(
                parseInt((e.target as HTMLTextAreaElement).value),
              )
            }
          }}
        />

        {loadStatus.loading && <CircularProgress />}
        {!loadStatus.loading && loadStatus.hasError && (
          <Typography>Error loading</Typography>
        )}
        {!loadStatus.loading && !loadStatus.hasError && (
          <DataGrid
            // apiRef={apiRef}
            autosizeOnMount
            // onRowDoubleClick={handleRowDblClick}
            // hideFooter
            rows={datamap}
            columns={getColDefs()}
            sx={{
              height: "75vh",
            }}
          />
        )}
      </CardContent>
    </Card>
  )
}
