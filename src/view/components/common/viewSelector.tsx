import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import React from "react";

const ViewRowsSelector: React.FC<{
  rowsPerPage: number,
  handleChangeRowsPerPage: (event: SelectChangeEvent<number>, _m: any) => void
}> = ({ rowsPerPage, handleChangeRowsPerPage }) => (
  <div style={{ display: "flex", justifyContent: "flex-end" }}>
    <FormControl variant="standard">
      <InputLabel>表示</InputLabel>
      <Select value={rowsPerPage} onChange={handleChangeRowsPerPage}>
        {
          [10, 20, 30].map((item: number) => <MenuItem key={item} value={item}>{item}</MenuItem>)
        }
      </Select>
    </FormControl>
  </div>
)

export default ViewRowsSelector;
