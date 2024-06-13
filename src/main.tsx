import React from "react"
import ReactDOM from "react-dom/client"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import App from "./App.tsx"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import "@fontsource/roboto/300.css"
import "@fontsource/roboto/400.css"
import "@fontsource/roboto/500.css"
import "@fontsource/roboto/700.css"
import Dashboard from "./components/Dashboard.tsx"
import Graphs from "./components/Graphs.tsx"

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
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "graphs",
        element: <Graphs />,
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
