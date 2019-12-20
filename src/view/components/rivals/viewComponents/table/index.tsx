import React from "react";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";

import {scoreData, songData} from "../../../../../types/data";
import { _prefix, convertClearState } from "../../../../../components/songs/filter";
import { diffColor } from "../../../songs/common";
import _djRank from "../../../../../components/common/djRank";
import { _currentViewComponents, _traditionalMode } from "../../../../../components/settings";
import { scoresDB } from "../../../../../components/indexedDB";

const columns = [
  { id: "difficultyLevel", label: "☆"},
  { id: "title", label: "曲名" },
  { id: "myEx", label: "YOU"},
  {
    id: "rivalEx",
    label: "RIVAL",
  },
  {
    id: "gap",
    label: "GAP",
  },
];

interface P{
  data:scoreData[],
  sort:number,
  isDesc:boolean,
  changeSort:(newNum:number)=>void,
  page:number,
  mode:number,
  handleChangePage:(_e:React.MouseEvent<HTMLButtonElement, MouseEvent> | null, newPage:number)=>void
}

interface S{
  rowsPerPage:number,
  isOpen:boolean,
  currentSongData:songData | null,
  currentScoreData:scoreData | null,
  components:string[]
}

export default class ScoreTable extends React.Component<Readonly<P>,S>{

  constructor(props:Readonly<P>){
    super(props);
    this.state = {
      rowsPerPage : 10,
      isOpen:false,
      currentSongData:null,
      currentScoreData:null,
      components:_currentViewComponents().split(","),
    }
  }

  handleOpen = (row?:any):void=> {
    return this.setState({
      isOpen:!this.state.isOpen,
    });
  }

  handleChangeRowsPerPage = (event:React.ChangeEvent<HTMLInputElement>):void => {
    this.props.handleChangePage(null,0);
    this.setState({rowsPerPage:+event.target.value});
  }

  willBeRendered =(component:string):boolean=>{
    return this.state.components.indexOf(component) > -1;
  }
//diffColor(j,row)
  render(){
    const {rowsPerPage} = this.state;
    const {page,data,changeSort,sort,isDesc,mode} = this.props;
    return (
      <Paper style={{width:"100%",overflowX:"auto"}} className={_traditionalMode() === 1 ? "traditionalMode" : ""}>
        <div>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((column,i) => (
                  <TableCell
                    key={column.id}
                    onClick={()=>changeSort(i)}
                  >
                    {column.label}
                    {i === sort &&
                      <span>
                        { isDesc && <span>▼</span> }
                        { !isDesc && <span>▲</span> }
                      </span>
                    }
                    {i !== sort && <span>△</span>}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row:any,i:number) => {
                const prefix = row.difficulty === "hyper" ? "(H)" : row.difficulty === "leggendaria" ? "(†)" : "";
                return (
                  <TableRow
                    onClick={()=>this.handleOpen(row)}
                    hover role="checkbox" tabIndex={-1} key={row.title + row.prefix + i} className={ i % 2 ? "isOdd" : "isEven"}>
                    {columns.map((column,j) => {
                      const a = mode === 0 ? row.rivalEx : mode === 1 ? row.rivalClearState : row.rivalMissCount;
                      const b = mode === 0 ? row.myEx : mode === 1 ? row.myClearState : row.myMissCount;
                      return (
                        <TableCell key={column.id + prefix} style={{
                          borderLeft:j === 2 ? `4px solid ${diffColor(j,row.myClearState,2)}`: j === 3 ? `4px solid ${diffColor(j,row.rivalClearState,3)}` : "0px",
                          position:"relative"}}
                        >
                          <span className={j >= 2 ? "bodyNumber" : ""}>
                            {j < 2 && row[column.id]}
                            {(mode !== 1 && j > 1 && j < 4) && ((Number.isNaN(j === 2 ? b : a) || (j === 2 ? !b : !a)) ? "-" : j === 2 ? b : a)}
                            {(mode === 1 && j > 1 && j < 4) && convertClearState(j === 2 ? b : a,1,true)}
                            {j === 4 && <span>
                              {b - a >= 0 && <span>+</span>}
                              {Number.isNaN(b - a) ? Number.isNaN(b) ? "-" : b : Number(b-a)}
                            </span>}
                          </span>
                          {column.id === "title" && prefix}
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
          onChangePage={this.props.handleChangePage}
          onChangeRowsPerPage={this.handleChangeRowsPerPage}
        />
      </Paper>
    );
  }
}
