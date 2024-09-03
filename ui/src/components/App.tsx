import { Dispatch, SetStateAction, useEffect, useState } from "react"
import {
  Box,
  Divider,
  Drawer as MuiDrawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  styled,
  Typography,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  SelectChangeEvent,
  useTheme,
} from "@mui/material"
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar"
import CachedIcon from "@mui/icons-material/Cached"
import { v4 as uuid } from "uuid"

import CssBaseline from "@mui/material/CssBaseline"
import { Link, Outlet, useOutletContext, useLocation } from "react-router-dom"
import { fetchGetUri } from "../util/helpers"
import { API_URIS } from "../util/constants"

const { rootName: API_METADATA_ROOT, DB_LIST } = API_URIS.API_METADATA_ROOT

const CONTENT_AREA_HEIGHT = import.meta.env.VITE_CONTENT_AREA_HEIGHT || "62vh"

const linkPages: { to: string; displayName: string; ignore?: boolean }[] = [
  { ignore: true, to: "", displayName: "Dashboard" },
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
  const { hash, pathname: currentPathname, search } = useLocation()
  const [dbList, setDbList] = useState<string[]>([])
  const [chosenDb, setChosenDb] = useState<string>(
    import.meta.env.VITE_DEBUG_DEFAULT_DB || "",
  )
  const [localDbPath, setLocalDbPath] = useState<string>()
  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(false)
  const { palette } = useTheme()

  // const toggleDrawer = () => {
  //   setOpen(true)
  // }

  useEffect(() => {
    ;(async () => {
      const result = await fetchGetUri(`${API_METADATA_ROOT}/${DB_LIST}`)

      if (result.hasError) {
        return
      }
      setDbList(result.data.dbList)
      setLocalDbPath(result.data.dbDirectory)
    })()
  }, [])

  const isSelected = (itemDisplayName: string) => {
    const currentDisplayName = linkPages.filter(
      (x) => `/${x.to}` === currentPathname,
    )[0].displayName
    return currentDisplayName === itemDisplayName
  }

  return (
    <Box style={{ display: "flex", height: CONTENT_AREA_HEIGHT }}>
      <CssBaseline />

      <AppBar position="absolute" open>
        <Toolbar
          sx={{
            pr: "24px", // keep right padding when drawer closed
          }}
        >
          {/* DATABASE DROPDOWN */}
          <FormControl sx={{ width: "30vh" }}>
            <InputLabel>Databases</InputLabel>
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

          {/* DATABASE DIRECTORY DISPLAY */}
          <Typography>&nbsp;&nbsp;</Typography>
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
          <Box
            component="img"
            src={
              palette.mode === "dark"
                ? "src/assets/neo4j-long-white.svg"
                : "src/assets/neo4j-long.svg"
            }
            alt="logo"
            sx={{ height: 40, mr: 2 }}
          />
        </Toolbar>
        <Divider />

        {/* Sidebar links */}
        <List component="nav">
          {linkPages.map(({ to, displayName, ignore }, i) =>
            ignore ? null : (
              <ListItemButton
                key={uuid()}
                component={Link}
                to={to}
                selected={isSelected(displayName)}
              >
                <ListItemText primary={displayName} />
              </ListItemButton>
            ),
          )}
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
