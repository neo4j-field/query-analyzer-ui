import { useState } from "react"
import {
  Box,
  Toolbar,
  Grid,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
} from "@mui/material"
import TimeQueryCountCard from "./TimeQueryCountGraph"

type GraphType =
  | "queries"
  | "pageFaults"
  | "pageHits"
  | "execution"
  | "planning"

export default function PerformanceOverview() {
  const [value, setValue] = useState<GraphType>("queries")

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue((event.target as HTMLInputElement).value as GraphType)
  }

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
          <FormControl>
            <RadioGroup
              row
              // aria-labelledby="demo-row-radio-buttons-group-label"
              // name="row-radio-buttons-group"
              value={value}
              onChange={handleChange}
            >
              <FormControlLabel
                value="queries"
                label="Queries"
                control={<Radio />}
              />
              <FormControlLabel
                value="pageFaults"
                label="Page Faults"
                control={<Radio />}
              />
              <FormControlLabel
                value="pageHits"
                label="Page Hits"
                control={<Radio />}
              />
              <FormControlLabel
                value="execution"
                label="Execution Time"
                control={<Radio />}
              />
              <FormControlLabel
                value="planning"
                label="Planning Time"
                control={<Radio />}
              />
            </RadioGroup>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          <TimeQueryCountCard />
        </Grid>
      </Grid>
    </Box>
  )
}
