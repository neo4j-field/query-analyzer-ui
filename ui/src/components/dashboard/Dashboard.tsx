import {
  Box,
  Grid,
  Typography,
  Toolbar,
  CircularProgress,
  Button,
} from "@mui/material"
import GeneralStatsCard from "./GeneralStatsCard"
import QueriesExecutedByServerCard from "./QueriesExecutedByServerCard"
import UniqueQueriesExecutedCard from "./UniqueQueriesExecuted"
import PlannedCard from "./PlannedCard"
import Top5Card from "./Top5Card"
import { API_URIS } from "../../util/constants"
import * as React from "react"
import { styled } from "@mui/material/styles"
import Drawer from "@mui/material/Drawer"
import CssBaseline from "@mui/material/CssBaseline"
import CloseIcon from "@mui/icons-material/Close"
import { useState } from "react"

const {
  QUERY_TOP5_QUERIES_EXECUTED,
  QUERY_TOP5_PAGE_HITS,
  QUERY_TOP5_PAGE_FAULTS,
  QUERY_TOP5_ELAPSED_TIME,
} = API_URIS.SQLITE_ROOT

const drawerWidth = 240

const Div = styled("div", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginRight: `-${drawerWidth}px`,
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

export default function Dashboard() {
  // const theme = useTheme()
  const [open, setOpen] = React.useState(false)
  const [queryText, setQueryText] = useState<string>("")
  const [queryId, setQueryId] = useState<string>("")
  const [loadingQueryText, setLoadingQueryText] = useState(false)

  const toggleDrawer = (b: boolean) => {
    if (b === undefined) setOpen(!open)
    else setOpen(b)
  }

  return (
    <Box sx={{ display: "flex" }}>
      {/* <CssBaseline /> */}

      <Div open={open}>
        <DrawerHeader />

        <Grid container spacing={4}>
          {/* LEFT COLUMN  */}
          <Grid item xs={6}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <UniqueQueriesExecutedCard />
              </Grid>
              <Grid item xs={12}>
                <GeneralStatsCard />
              </Grid>
              <Grid item xs={12}>
                <PlannedCard />
              </Grid>
            </Grid>
          </Grid>

          {/* RIGHT COLUMN */}
          <Grid item xs={6}>
            <QueriesExecutedByServerCard />
          </Grid>

          {/* TOP 5ers*/}
          {[
            { uriName: QUERY_TOP5_QUERIES_EXECUTED, title: "Top 5 Queries" },
            { uriName: QUERY_TOP5_PAGE_HITS, title: "Top 5 Page Hits" },
            { uriName: QUERY_TOP5_PAGE_FAULTS, title: "Top 5 Page Faults" },
            { uriName: QUERY_TOP5_ELAPSED_TIME, title: "Top 5 Elapsed Time" },
          ].map((x, i) => (
            <Grid key={i} item xs={11} sm={11} md={11} lg={11} xl={11}>
              <Top5Card
                uriName={x.uriName}
                title={x.title}
                setQueryText={setQueryText}
                openDrawer={open}
                setOpenDrawer={setOpen}
                setLoadingQueryText={setLoadingQueryText}
                setQueryId={setQueryId}
              />
            </Grid>
          ))}
        </Grid>
      </Div>

      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
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
            <Button onClick={() => toggleDrawer(false)}>
              <CloseIcon />
            </Button>
            <Typography variant="h5">Query Id: {queryId}</Typography>
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
