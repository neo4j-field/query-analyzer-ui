import { FETCH_ABORT_MSG } from "../components/performanceOverview/TimeGraph"

export const fetchGetUri = async (urlPattern: string, signal?: AbortSignal) => {
  const username = "admin"
  const password = "neo4j"
  const credentials = btoa(`${username}:${password}`)

  // Set up the headers
  const headers = new Headers({
    Accept: "application/json; indent=2",
    Authorization: `Basic ${credentials}`,
  })

  try {
    const url = `${import.meta.env.VITE_API_URI}/${urlPattern}`
    const options: RequestInit = { method: "GET", headers }
    if (signal) options.signal = signal
    const response = await fetch(url, options)

    if (!response.ok) {
      throw new Error("Network response was not ok")
    }

    return response.json()
  } catch (error) {
    if (error === FETCH_ABORT_MSG) console.debug(error)
    else console.error(error)
    return { hasError: true, error }
  }
}

/****************************************************************************
 ****************************************************************************/
export const convertToDataMap = (headers: string[], rows: any[][]) => {
  const dataMap: Record<string, any>[] = []
  for (const row of rows) {
    const mapRow: any = {}
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i]
      mapRow[header] = row[i] === null ? "NULL" : row[i]
    }
    dataMap.push(mapRow)
  }
  return dataMap
}
