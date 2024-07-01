import { Dispatch, SetStateAction, useEffect, useState } from "react"
import {
  Box,
  Divider,
  Drawer as MuiDrawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  styled,
  Typography,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material"
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar"
import AssignmentIcon from "@mui/icons-material/Assignment"
import MenuIcon from "@mui/icons-material/Menu"
import { v4 as uuid } from "uuid"

import CssBaseline from "@mui/material/CssBaseline"
import { Link, Outlet, useOutletContext } from "react-router-dom"
import { fetchGetUri } from "../util/helpers"
import { API_METADATA_ROOT, DB_LIST } from "../util/apiEndpoints"

const CONTENT_AREA_HEIGHT = import.meta.env.VITE_CONTENT_AREA_HEIGHT || "62vh"

const linkPages: { to: string; displayName: string }[] = [
  { to: "dashboard", displayName: "Dashboard" },
  { to: "graphs", displayName: "Performance Overview" },
]

interface AppBarProps extends MuiAppBarProps {
  open?: boolean
}

//
// COPIED
//
const drawerWidth: number = 240
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}))

//
// COPIED
//
const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9),
      },
    }),
  },
}))

export interface LoadingStatuses {
  logTimeWindow: LoadingStatus
  queryCountByServer: LoadingStatus
  percentile: LoadingStatus
  timeQueryCount: LoadingStatus
}

export interface LoadingStatus {
  isLoading: boolean
  hasError: boolean
}

type ContextType = {
  chosenDb: string
  setChosenDb: Dispatch<SetStateAction<string>>
}

/**
 * Global db state
 * @returns 
 */
export function useChosenDb() {
  return useOutletContext<ContextType>()
}

/******************************************************************************
 *
 * @returns
 *****************************************************************************/
export default function App() {
  const [open, setOpen] = useState(true)
  const [appBarName, setAppBarName] = useState<string>("")
  const [dbList, setDbList] = useState<string[]>(["stuff"])
  const [chosenDb, setChosenDb] = useState<string>("")

  const toggleDrawer = () => {
    setOpen(true)
  }

  useEffect(() => {
    ;(async () => {
      const result = await fetchGetUri(`${API_METADATA_ROOT}/${DB_LIST}?dbname=${chosenDb}`)

      if (result.hasError) {
        return
      }
      setDbList(result.data.dbList)
    })()
  }, [])

  return (
    <Box style={{ display: "flex", height: CONTENT_AREA_HEIGHT }}>
      <CssBaseline />

      <AppBar position="absolute" open={open}>
        <Toolbar
          sx={{
            pr: "24px", // keep right padding when drawer closed
          }}
        >
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer}
            sx={{
              marginRight: "36px",
              ...(open && { display: "none" }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            sx={{ flexGrow: 1 }}
          >
            {appBarName}
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer variant="permanent" open={open}>
        <Toolbar
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            px: [1],
          }}
        >
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Databases</InputLabel>
            <Select
              value={chosenDb}
              label="Databases"
              onChange={(e: SelectChangeEvent) => {
                setChosenDb(e.target.value as string)
              }}
            >
              {dbList.map((s, i) => (
                <MenuItem key={i} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Toolbar>
        <Divider />

        {/* Sidebar links */}
        <List component="nav">
          {linkPages.map(({ to, displayName }, i) => (
            <ListItemButton
              key={uuid()}
              component={Link}
              to={to}
              onClick={() => setAppBarName(displayName)}
            >
              <ListItemIcon>
                <AssignmentIcon />
              </ListItemIcon>
              <ListItemText primary={displayName} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      {/* Render data pages depending on route */}
      {chosenDb && (
        <Outlet context={{ chosenDb, setChosenDb } satisfies ContextType} />
      )}
      {!chosenDb && (
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === "light"
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            height: "100vh",
            overflow: "auto",
          }}
        >
          <Toolbar />
          <Typography>Please Choose Database</Typography>
        </Box>
      )}
    </Box>
  )
}
