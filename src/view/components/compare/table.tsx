import * as React from 'react';
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import DetailedSongInformation from "../../components/songs/detailsScreen";
import CircularProgress from "@material-ui/core/CircularProgress";
import Container from "@material-ui/core/Container";
import { scoreData, songData } from '../../../types/data';
import { diffColor } from "../songs/common";
import Tooltip from '@material-ui/core/Tooltip';

interface S {
  isOpen:boolean,
  currentSongData:songData | null,
  currentScoreData:scoreData | null,
}

interface P{
  isLoading:boolean,
  full:any[],
  page:number,
  rowsPerPage:number,
  handleChangePage:(newPage:number)=>void,
  handleChangeRowsPerPage:(value:string)=>void,
  changeSort:(value:number)=>void,
  sort:number,
  isDesc:boolean,
  displayMode:string,
}

export default class Compare extends React.Component<P,S> {

  constructor(props:P){
    super(props);
    this.state ={
      isOpen:false,
      currentSongData:null,
      currentScoreData:null,
    }
  }

  handleOpen = async(updateFlag:boolean,row?:any):Promise<void>=> {
    if(updateFlag){

    }
    return this.setState({
      isOpen:!this.state.isOpen,
      currentSongData:row ? row["songData"] : null,
      currentScoreData:row ? row["scoreData"] : null
    });
  }

  cloneState = () => JSON.parse(JSON.stringify(this.state))

  handleChangePage = (_e:React.MouseEvent<HTMLButtonElement, MouseEvent> | null, newPage:number):void => this.props.handleChangePage(newPage);

  handleChangeRowsPerPage = (event:React.ChangeEvent<HTMLInputElement>):void => this.props.handleChangeRowsPerPage(event.target.value);

  render(){
    const {currentScoreData,currentSongData,isOpen} = this.state;
    const {full,isLoading,page,rowsPerPage,changeSort,sort,isDesc,displayMode} = this.props;
    const columns = [
      { id: "difficultyLevel", label: "☆"},
      { id: "title", label: "曲名" },
      { id: "exScore", label: "S"},
      {
        id: "compareData",
        label: "W",
      },
      {
        id: "gap",
        label: "G",
      }
    ];
    if(isLoading){
      return (
        <Container className="loaderCentered">
          <CircularProgress />
        </Container>
      );
    }
    return (
    <Paper style={{width:"100%",overflowX:"auto"}}>
      <div>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column,i) => (
                <TableCell
                  key={column.id}
                  onClick={()=>changeSort(i)}
                  className={i === 4 ? "compareGap" : ""}
                >
                  <Tooltip title={i === 2 ? "比較元" : i === 3 ? "比較先" : i === 4 ? "差" : ""} placement="top">
                    <span>
                    {column.label}
                    {i === sort &&
                      <span>
                        { isDesc && <span>▼</span> }
                        { !isDesc && <span>▲</span> }
                      </span>
                    }
                    {i !== sort && <span>△</span>}
                    </span>
                  </Tooltip>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {full.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row:any,i:number) => {
              return (
                <TableRow
                  onClick={()=>this.handleOpen(false,row)}
                  hover role="checkbox" tabIndex={-1} key={row.title + i} className={ i % 2 ? "isOdd" : "isEven"}>
                  {columns.map((column,j) => {
                    const prefix = row.difficulty === "hyper" ? "(H)" : row.difficulty === "leggendaria" ? "(†)" : "";
                    return (
                      <TableCell key={column.id + prefix} className={j === 4 ? "compareGap" : ""} style={{backgroundColor : diffColor(j,row.scoreData.clearState),position:"relative"}}>
                        {j === 2 &&
                          <span>
                            {displayMode === "exScore" && row[column.id]}
                            {displayMode === "bpi" && Number(row.scoreData.currentBPI).toFixed(2)}
                            {displayMode === "percentage" && Number(row[column.id]).toFixed(2)}
                          </span>
                        }
                        {j !==  2 &&
                          <span style={ (j === 4 && row[column.id] >= 0) ? {color:"rgb(0, 177, 14)"} : (j === 4 && row[column.id] < 0) ? {color:"#ff0000"} : {color:"inherit"}}>
                            {(j <= 2 || displayMode === "exScore") && row[column.id]}
                            {(j > 2 && displayMode !== "exScore") && Number(row[column.id]).toFixed(2)}
                          </span>
                        }
                        {j === 1 && prefix}
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
        count={full.length}
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
      {isOpen &&
        <DetailedSongInformation isOpen={isOpen} song={currentSongData} score={currentScoreData} handleOpen={this.handleOpen}/>
      }
    </Paper>
    );
  }
}
