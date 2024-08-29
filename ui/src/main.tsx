import React from "react"
import ReactDOM from "react-dom/client"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import App from "./components/App.tsx"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import "@fontsource/roboto/300.css"
import "@fontsource/roboto/400.css"
import "@fontsource/roboto/500.css"
import "@fontsource/roboto/700.css"
import Dashboard from "./components/dashboard/Dashboard.tsx"
import PerformanceOverview from "./components/performanceOverview/PerformanceOverview.tsx"
import PercentilesDashboard from "./components/percentilesDashboard/PercentilesDashboard.tsx"

const darkTheme = createTheme({
  palette: {
    mode: import.meta.env.VITE_MUI_PALETTE_MODE || "light",
  },
})

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <Dashboard />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "percentiles",
        element: <PercentilesDashboard />,
      },
      {
        path: "graphs",
        element: <PerformanceOverview />,
      },
    ],
  },
])

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>,
)
