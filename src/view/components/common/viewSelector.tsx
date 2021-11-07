import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import React from "react";

export default class ViewRowsSelector extends React.Component<{
  rowsPerPage:number,
  handleChangeRowsPerPage:(event:SelectChangeEvent<number>,_m:any)=>void
},{}>{
  render(){
    const {rowsPerPage,handleChangeRowsPerPage} = this.props;
    return (
    <div style={{display:"flex",justifyContent:"flex-end"}}>
      <FormControl variant="standard">
        <InputLabel>表示</InputLabel>
        <Select value={rowsPerPage} onChange={handleChangeRowsPerPage}>
        {
          [10,20,30].map((item:number)=>{
            return (<MenuItem key={item} value={item}>{item}</MenuItem>);
          })
        }
        </Select>
      </FormControl>
    </div>
    );
  }
}
