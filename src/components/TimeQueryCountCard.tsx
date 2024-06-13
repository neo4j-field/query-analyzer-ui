import { Dispatch, SetStateAction, useEffect, useState } from "react"
import AddIcon from "@mui/icons-material/Add"
import { axisClasses } from "@mui/x-charts/ChartsAxis"
import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/material"

import {
  QUERY_TIME_QUERY_COUNT,
  SQLITE_ROOT,
} from "../util/apiEndpoints"
import { convertToDataMap, fetchGetUri } from "../util/helpers"
import { produce } from "immer"
import { LoadingStatuses } from "../App"
import { BarChart } from "@mui/x-charts"

const valueFormatter = (value: number | null) => `${value} ff`

const chartSetting = {
  yAxis: [
    {
      label: "Number of queries",
    },
  ],
  width: 1000,
  height: 300,
  sx: {
    [`.${axisClasses.left} .${axisClasses.label}`]: {
      transform: "translate(-20px, 0)",
    },
  },
}

const CARD_PROPERTY = {
  borderRadius: 3,
  boxShadow: 0,
}

interface Props {
  loading: LoadingStatuses
  setLoading: Dispatch<SetStateAction<LoadingStatuses>>
}

export default function TimeQueryCountCard({ loading, setLoading }: Props) {
  const [dataset, setDataset] = useState<Record<string, any>[]>([])
  // const [openModal, setOpenModal] = useState(false)
  // const [loadingQueryText, setLoadingQueryText] = useState(false)
  // const [queryText, setQueryText] = useState("kdfjldkfj")

  const handleRefetch = async () => {
    fetchData()
  }

  // const handleCloseModal = () => setOpenModal(false)

  useEffect(() => {
    fetchData()
  }, [])

  /****************************************************************************
   ****************************************************************************/
  const fetchData = async () => {
    setLoading(
      produce((draft) => {
        draft.timeQueryCount.isLoading = true
        draft.timeQueryCount.hasError = false
      }),
    )
    const result = await fetchGetUri(`${SQLITE_ROOT}/${QUERY_TIME_QUERY_COUNT}`)
    setLoading(
      produce((draft) => {
        draft.timeQueryCount.isLoading = false
        draft.timeQueryCount.hasError = result.hasError ? true : false
      }),
    )

    if (result.hasError) {
      return
    }

    const datamap = convertToDataMap(result.data.headers, result.data.rows)
    setDataset(datamap)
    console.log("dataset", datamap)
  }

  return (
    <>
      <Card sx={CARD_PROPERTY}>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            Number of queries run time graph
          </Typography>
          {loading.timeQueryCount.isLoading && <CircularProgress />}
          {!loading.timeQueryCount.isLoading && loading.timeQueryCount.hasError && (
            <Typography>Error loading</Typography>
          )}

          {/* BAR */}
          {!loading.timeQueryCount.isLoading && !loading.timeQueryCount.hasError && (
            <BarChart
              dataset={dataset}
              xAxis={[{ scaleType: "band", dataKey: "time" }]}
              series={[
                { dataKey: "numQueries", label: "", valueFormatter },
              ]}
              {...chartSetting}
            />
          )}

          <Button startIcon={<AddIcon />} onClick={() => handleRefetch()}>
            {" "}
            Update
          </Button>
        </CardContent>
      </Card>

      {/* <Dialog
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
      </Dialog> */}
    </>
  )
}
