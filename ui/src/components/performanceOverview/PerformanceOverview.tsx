import { Box, Toolbar, Grid } from "@mui/material"
import TimeQueryCountCard from "./TimeQueryCountGraph"

export default function Graphs() {

  return (
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
      <Toolbar />
      <Grid container spacing={4}>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
            <TimeQueryCountCard />
          </Grid>
        </Grid>
      </Grid>
    </Box>
  )
}
