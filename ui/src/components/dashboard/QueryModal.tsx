import {
  Dialog,
  DialogTitle,
  Typography,
  IconButton,
  DialogContent,
  CircularProgress,
} from "@mui/material"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import {
  convertToDataMap,
  fetchAbortWrapper,
  fetchGetUri,
} from "../../util/helpers"
import { SQLITE_ROOT, QUERY_GET_QUERY_TEXT } from "../../util/apiEndpoints"
import { useChosenDb } from "../App"

interface Props {
  openModal: boolean
  setOpenModal: Dispatch<SetStateAction<boolean>>
  queryId: string
}

export default function QueryModal({
  openModal,
  setOpenModal,
  queryId,
}: Props) {
  const { chosenDb } = useChosenDb()
  const [modalQryText, setModalQryText] = useState<string>("")
  const [loadingQueryText, setLoadingQueryText] = useState(false)
  const handleCloseModal = () => setOpenModal(false)

  useEffect(() => {
    if (!openModal) return
    return fetchAbortWrapper(fetchData)
  }, [openModal])

  const fetchData = async (signal: AbortSignal) => {
    setLoadingQueryText(true)
    const result = await fetchGetUri(
      `${SQLITE_ROOT}/${QUERY_GET_QUERY_TEXT}/${queryId}?dbname=${chosenDb}`,
      signal, 
    )
    const datamap = convertToDataMap(result.data.headers, result.data.rows)
    setModalQryText(datamap[0].query)
    setLoadingQueryText(false)
  }

  return (
    <Dialog
      open={openModal}
      onClose={handleCloseModal}
      maxWidth={"xs"}
      fullWidth
    >
      <DialogTitle display={"inline"}>
        <Typography>Query Text</Typography>
        <IconButton
          onClick={() => navigator.clipboard.writeText(modalQryText)}
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
              {modalQryText}
            </Typography>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
