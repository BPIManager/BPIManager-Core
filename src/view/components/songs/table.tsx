import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";

const columns = [
  { id: "difficultyLevel", label: "☆"},
  { id: "title", label: "曲名" },
  { id: "currentBPI", label: "BPI"},
  {
    id: "exScore",
    label: "EX",
  },
];

export default class SongsTable extends React.Component<{data:any},{page:number,rowsPerPage:number}>{

  constructor(props:{ data: any }){
    super(props);
    this.state = {
      page : 0,
      rowsPerPage : 10
    }
  }

  handleChangePage = (event:React.MouseEvent<HTMLButtonElement, MouseEvent> | null, newPage:number):void => this.setState({page:newPage});

  handleChangeRowsPerPage = (event:React.ChangeEvent<HTMLInputElement>):void => this.setState({page:0,rowsPerPage:+event.target.value});

  difficultColor = (i:number,row: any)=>{
    if(i !== 0){return void(0);}
    switch (row.difficulty){
      default:
      case "hyper" : return "#ffdb00";
      case "another" : return "#f50057";
      case "leggendaria" : return "#ff00f4";
    }
  }

  render(){
    const {page,rowsPerPage} = this.state;
    return (
      <Paper style={{width:"100%",overflowX:"auto"}}>
        <div>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map(column => (
                  <TableCell
                    key={column.id}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {this.props.data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row:any,i:number) => {
                console.log(row);
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.title} style ={ i % 2? { background : "#f7f7f7" }:{ background : "white" }}>
                    {columns.map((column,j) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} style={{backgroundColor : this.difficultColor(j,row)}}>
                          {value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={this.props.data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          labelRowsPerPage=""
          backIconButtonProps={{
            "aria-label": "previous page",
          }}
          nextIconButtonProps={{
            "aria-label": "next page",
          }}
          onChangePage={this.handleChangePage}
          onChangeRowsPerPage={this.handleChangeRowsPerPage}
        />
      </Paper>
    );
  }
}
