export const FETCH_ABORT_MSG =
  "Abort fetch from unmounting or dependency change"

/****************************************************************************
 ****************************************************************************/
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

    const json = await response.json()
    if (!response.ok) {
      console.error(json)
      throw new Error(`Network response returned error`)
    }

    return json
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

/****************************************************************************
 * Wrapper for fetching data to be able to abort fetches
 ****************************************************************************/
export const fetchAbortWrapper = (fetchData: (signal: AbortSignal) => any) => {
  const controller = new AbortController()
  fetchData(controller.signal)

  // Cleanup fetch request on unmount or dependency change
  // eg if user clicks on another graph type to show, cancel this fetch
  return () => {
    controller.abort(FETCH_ABORT_MSG)
  }
}

export const setInSession = (k: string, v: any) => {
  sessionStorage.setItem(k, JSON.stringify(v))
}

export const getFromSession = (k: string) => {
  const n = sessionStorage.getItem(k)
  return n === null ? null : JSON.parse(n)
}

export const existsInSession = (k: string) => {
  return sessionStorage.getItem(k) !== null
}
