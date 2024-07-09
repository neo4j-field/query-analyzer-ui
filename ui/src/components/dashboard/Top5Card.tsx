import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { Card, CardContent, CircularProgress, Typography } from "@mui/material"
import { API_URIS } from "../../util/constants"
import {
  FETCH_ABORT_MSG,
  convertToDataMap,
  existsInSession,
  getFromSession,
  fetchAbortWrapper,
  fetchGetUri,
  setInSession,
} from "../../util/helpers"
import { DataGrid, GridEventListener } from "@mui/x-data-grid"
import { useChosenDb } from "../App"

const { QUERY_GET_QUERY_TEXT, rootName: SQLITE_ROOT } = API_URIS.SQLITE_ROOT

const CARD_PROPERTY = {
  borderRadius: 3,
  boxShadow: 0,
}

interface Props {
  uriName: string
  title: string
  openDrawer: boolean
  setOpenDrawer: Dispatch<SetStateAction<boolean>>
  setQueryText: Dispatch<SetStateAction<string>>
  setQueryId: Dispatch<SetStateAction<string>>
  setLoadingQueryText: Dispatch<SetStateAction<boolean>>
}

export default function Top5Card({
  uriName,
  title,
  openDrawer,
  setOpenDrawer,
  setQueryText,
  setQueryId,
  setLoadingQueryText,
}: Props) {
  const [loadStatus, setLoadStatus] = useState({
    loading: false,
    hasError: false,
  })
  const [headers, setHeaders] = useState<string[]>([])
  const [datamap, setDatamap] = useState<Record<string, any>[]>([])
  const { chosenDb, triggerRefresh } = useChosenDb()

  useEffect(() => {
    if (existsInSession(uriName)) {
      processFetchedData(getFromSession(uriName))
    } else {
      return fetchAbortWrapper(fetchData)
    }
  }, [triggerRefresh])

  /****************************************************************************
   ****************************************************************************/
  const fetchData = async (signal: AbortSignal) => {
    setLoadStatus({ ...loadStatus, loading: true, hasError: false })
    const result = await fetchGetUri(
      `${SQLITE_ROOT}/${uriName}?limit=5&dbname=${chosenDb}`,
    )

    if (result.hasError) {
      if (result.hasError !== FETCH_ABORT_MSG) {
        console.error(`Error for fetch: ${result}`)
        setLoadStatus({ ...loadStatus, loading: false, hasError: true })
      }
      return
    }

    setInSession(uriName, result.data)

    processFetchedData(result.data)
    setLoadStatus({ ...loadStatus, loading: false, hasError: false })
  }

  const processFetchedData = (data: any) => {
    const datamap = convertToDataMap(data.headers, data.rows)
    for (let i = 0; i < datamap.length; i++) {
      datamap[i].id = i
    }
    setHeaders(data.headers)
    setDatamap(datamap)
  }

  const handleRowClick: GridEventListener<"rowClick"> = async (params) => {
    if (!openDrawer) setOpenDrawer(true)
    fetchQueryText(params.row.query_id)
  }

  const fetchQueryText = async (queryId: string /*signal: AbortSignal*/) => {
    setLoadingQueryText(true)
    const result = await fetchGetUri(
      `${SQLITE_ROOT}/${QUERY_GET_QUERY_TEXT}/${queryId}?dbname=${chosenDb}`,
    )
    const datamap = convertToDataMap(result.data.headers, result.data.rows)
    setQueryId(queryId)
    setQueryText(datamap[0].query)
    setLoadingQueryText(false)
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
            <Typography>Error loading</Typography>
          )}
          {!loadStatus.loading && !loadStatus.hasError && (
            <DataGrid
              autoHeight
              onRowClick={handleRowClick}
              hideFooter
              rows={datamap}
              columns={headers.map((s) => {
                const ret: any = { field: s, headerName: s, flex: 1 }
                ret.valueFormatter = (x: number) => x.toLocaleString()
                return ret
              })}
            />
          )}
        </CardContent>
      </Card>
    </>
  )
}
