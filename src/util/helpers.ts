export const fetchGetUri = async (urlPattern: string) => {
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
    const url = `${import.meta.env.VITE_API_URI}/${urlPattern}`
    console.log("awaiting fetch...")
    const response = await fetch(url, { method: "GET", headers })

    if (!response.ok) {
      throw new Error("Network response was not ok")
    }

    return response.json()
    // setData(result);
  } catch (error) {
    // setError(error);
    alert(error)
  } finally {
    // setLoading(false);
  }
}
