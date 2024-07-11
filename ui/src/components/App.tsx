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
import CachedIcon from "@mui/icons-material/Cached"
import MenuIcon from "@mui/icons-material/Menu"
import { v4 as uuid } from "uuid"

import CssBaseline from "@mui/material/CssBaseline"
import { Link, Outlet, useOutletContext } from "react-router-dom"
import { fetchGetUri } from "../util/helpers"
import { API_URIS } from "../util/constants"

const { rootName: API_METADATA_ROOT, DB_LIST } = API_URIS.API_METADATA_ROOT

const CONTENT_AREA_HEIGHT = import.meta.env.VITE_CONTENT_AREA_HEIGHT || "62vh"

const linkPages: { to: string; displayName: string }[] = [
  { to: "dashboard", displayName: "Dashboard" },
  { to: "percentiles", displayName: "Percentiles" },
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
  triggerRefresh: boolean
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
  const [dbList, setDbList] = useState<string[]>([])
  const [chosenDb, setChosenDb] = useState<string>(
    import.meta.env.VITE_DEBUG_DEFAULT_DB || "",
  )
  const [localDbPath, setLocalDbPath] = useState<string>()
  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(false)

  // const toggleDrawer = () => {
  //   setOpen(true)
  // }

  useEffect(() => {
    ;(async () => {
      const result = await fetchGetUri(
        `${API_METADATA_ROOT}/${DB_LIST}?dbname=${chosenDb}`,
      )

      if (result.hasError) {
        return
      }
      setDbList(result.data.dbList)
      setLocalDbPath(result.data.dbDirectory)
    })()
  }, [])

  return (
    <Box style={{ display: "flex", height: CONTENT_AREA_HEIGHT }}>
      <CssBaseline />

      <AppBar position="absolute" open>
        <Toolbar
          sx={{
            pr: "24px", // keep right padding when drawer closed
          }}
        >
          <Typography variant={"button"}>Database Directory</Typography>
          <Typography>&nbsp;&nbsp;</Typography>
          <Typography variant={"caption"}>{localDbPath}</Typography>
        </Toolbar>
      </AppBar>

      <Drawer variant="permanent" open>
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
          <IconButton
            color="inherit"
            onClick={(e) => {
              for (const x of Object.values(API_URIS)) {
                for (const k of Object.values(x)) {
                  sessionStorage.removeItem(k)
                }
              }
              setTriggerRefresh(!triggerRefresh)
            }}
          >
            <CachedIcon />
          </IconButton>
        </Toolbar>
        <Divider />

        {/* Sidebar links */}
        <List component="nav">
          {linkPages.map(({ to, displayName }, i) => (
            <ListItemButton
              key={uuid()}
              component={Link}
              to={to}
            >
              <ListItemIcon>
                <AssignmentIcon />
              </ListItemIcon>
              <ListItemText primary={displayName} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

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
        {/* Render data pages depending on route */}
        {chosenDb ? (
          <Outlet
            context={
              { chosenDb, setChosenDb, triggerRefresh } satisfies ContextType
            }
          />
        ) : (
          <>
            <Toolbar />
            <Typography>Please Choose Database</Typography>
          </>
        )}
      </Box>
    </Box>
  )
}
