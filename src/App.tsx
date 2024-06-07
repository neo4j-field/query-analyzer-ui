import { useState } from "react"
import AddIcon from "@mui/icons-material/Add"
import reactLogo from "./assets/react.svg"
import viteLogo from "/vite.svg"
import "./App.css"
import { BarChart } from "@mui/x-charts"
import { Button } from "@mui/material"

function App() {
  const [count, setCount] = useState(0)

  const handleFetchQueryTimestamps = async () => {
    // const data = await fetch(`${import.meta.env.VITE_API_URL}/` )
    const username = "admin"
    const password = "neo4j"
    const credentials = btoa(`${username}:${password}`)

    // Set up the headers
    const headers = new Headers({
      Accept: "application/json; indent=2",
      Authorization: `Basic ${credentials}`,
    })

    try {
      // const params = new URLSearchParams({ param1: 'value1', param2: 'value2' });
      const url = `${import.meta.env.VITE_API_URI}/read-sqlite/query_db2.db`
      console.log("awaiting fetch...")
      const response = await fetch(url, { method: "GET", headers })

      if (!response.ok) {
        throw new Error("Network response was not ok")
      }

      const result = await response.json()
      console.log(result)
      // setData(result);
    } catch (error) {
      // setError(error);
      alert(error)
    } finally {
      // setLoading(false);
    }
  }

  return (
    <>
      <BarChart
        xAxis={[
          {
            id: "barCategories",
            data: ["bar A", "bar B", "bar C"],
            scaleType: "band",
          },
        ]}
        series={[
          {
            data: [2, 5, 3],
          },
        ]}
        width={500}
        height={300}
      />

      <Button
        startIcon={<AddIcon />}
        onClick={() => handleFetchQueryTimestamps()}
      >
        {" "}
        Fetch
      </Button>

      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
