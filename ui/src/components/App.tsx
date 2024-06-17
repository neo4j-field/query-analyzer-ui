import { useState } from "react"
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
} from "@mui/material"
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import AssignmentIcon from "@mui/icons-material/Assignment"
import MenuIcon from "@mui/icons-material/Menu"
import { v4 as uuid } from "uuid"

import CssBaseline from "@mui/material/CssBaseline"
import { Link, Outlet } from "react-router-dom"

const CONTENT_AREA_HEIGHT = import.meta.env.VITE_CONTENT_AREA_HEIGHT || "62vh"

const linkPages: { to: string; displayName: string }[] = [
  { to: "dashboard", displayName: "Dashboard" },
  { to: "graphs", displayName: "Graphs" },
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

export default function App() {
  const [open, setOpen] = useState(true)
  const toggleDrawer = () => {
    setOpen(true)
  }

  const [loading, setLoading] = useState<LoadingStatuses>({
    logTimeWindow: { isLoading: false, hasError: false },
    queryCountByServer: { isLoading: false, hasError: false },
    percentile: { isLoading: false, hasError: false },
    timeQueryCount: { isLoading: false, hasError: false },
  })

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
            Dashboard
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
          <IconButton onClick={toggleDrawer}>
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>
        
        <Divider />
        
        {/* Sidebar links */}
        <List component="nav">
          {linkPages.map(({to, displayName}, i) => (
            <ListItemButton key={uuid()} component={Link} to={to}>
              <ListItemIcon>
                <AssignmentIcon />
              </ListItemIcon>
              <ListItemText primary={displayName} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      {/* Render data pages depending on route */}
      <Outlet />
    </Box>
  )
}
