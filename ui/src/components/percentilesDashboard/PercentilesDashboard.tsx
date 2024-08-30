import { Grid } from "@mui/material"
import PercentileCard from "./PercentileCard"

/******************************************************************************
 * PERCENTILES DASHBOARD COMPONENT
 * @returns
 ******************************************************************************/
export default function PercentilesDashboard() {
  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          <PercentileCard />
        </Grid>
      </Grid>
    </>
  )
}
