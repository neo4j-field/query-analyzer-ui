import { Dispatch, SetStateAction, useEffect, useState } from "react"
import AddIcon from "@mui/icons-material/Add"
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/material"

import { QUERY_LOG_TIME_WINDOW, SQLITE_ROOT } from "../util/apiEndpoints"
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

  const handleRefetch = async () => {
    fetchLogDetails()
  }

  useEffect(() => {
    fetchLogDetails()
  }, [])

  /****************************************************************************
   ****************************************************************************/
  const fetchLogDetails = async () => {
    setLoading(
      produce((draft) => {
        draft.logDetails.isLoading = true
        draft.logDetails.hasError = false
      }),
    )
    const result = await fetchGetUri(`${SQLITE_ROOT}/${QUERY_LOG_TIME_WINDOW}`)
    console.log(result.message)
    setLoading(
      produce((draft) => {
        draft.logDetails.isLoading = false
        draft.logDetails.hasError = result.hasError ? true : false
      }),
    )

    if (result.hasError) {
      return
    }

    const logDetails = convertToDataMap(result.data)[0]
    setFirstStartTimestamp(logDetails["firstStartTimestampMs"])
    setLastStartTimestamp(logDetails["lastStartTimestampMs"])
    setLogDuration(logDetails["windowDurationMin"])
  }

  return (
    <Card sx={CARD_PROPERTY}>
      {loading.logDetails.isLoading && <CircularProgress />}
      {!loading.logDetails.isLoading && loading.logDetails.hasError && (
        <Typography>Error loading</Typography>
      )}
      {!loading.logDetails.isLoading && !loading.logDetails.hasError && (
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            Log Details
          </Typography>
          <Typography variant="body2">
            First Start Timestamp:{" "}
            {`${new Date(firstStartTimestamp).toISOString()}`}
          </Typography>
          <Typography variant="body2">
            Last Start Timestamp:{" "}
            {`${new Date(lastStartTimestamp).toISOString()}`}
          </Typography>
          <Typography variant="body2">
            Log Duration: {`${logDuration} minutes`}
          </Typography>

          <Button startIcon={<AddIcon />} onClick={() => handleRefetch()}>
            {" "}
            Update
          </Button>
        </CardContent>
      )}
    </Card>
  )
}
