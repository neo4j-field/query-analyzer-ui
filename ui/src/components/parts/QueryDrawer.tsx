import {
  Box,
  Typography,
  Toolbar,
  CircularProgress,
  Button,
  Stack,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import Drawer from "@mui/material/Drawer"
import CssBaseline from "@mui/material/CssBaseline"
import CloseIcon from "@mui/icons-material/Close"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import { Dispatch, ReactNode, SetStateAction } from "react"

const DRAWER_WIDTH = 240

const Div = styled("div", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginRight: `-${DRAWER_WIDTH}px`,
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: 0,
  }),
}))

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-start",
}))

interface Props {
  children: ReactNode
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  queryText: string
  queryId: string
  loadingQueryText: boolean
}

export default function QueryDrawer({
  children,
  open,
  setOpen,
  queryText,
  queryId,
  loadingQueryText,
}: Props) {
  const toggleDrawer = (b: boolean) => {
    if (b === undefined) setOpen(!open)
    else setOpen(b)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(queryText)
  }

  return (
    <Box sx={{ display: "flex" }}>
      {/* <CssBaseline /> */}

      <Div open={open}>
        <DrawerHeader />
        {children}
      </Div>

      <Drawer
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
          },
        }}
        variant="persistent"
        anchor="right"
        open={open}
      >
        <CssBaseline />
        <Toolbar />

        {loadingQueryText && <CircularProgress />}
        {!loadingQueryText && (
          <>
            <Stack direction={"row-reverse"}>
              <Button onClick={() => toggleDrawer(false)}>
                <CloseIcon />
              </Button>

              <Button onClick={copyToClipboard}>
                <ContentCopyIcon />
              </Button>
            </Stack>
            <Typography variant="h6">Query Id: {queryId}</Typography>
            <Typography
              sx={{
                fontFamily: "Courier New, Courier, monospace",
              }}
            >
              {queryText}
            </Typography>
          </>
        )}
      </Drawer>
    </Box>
  )
}
