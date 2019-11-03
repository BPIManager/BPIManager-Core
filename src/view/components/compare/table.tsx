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
    const {full,isLoading,page,rowsPerPage,changeSort,sort,isDesc} = this.props;

    const columns = [
      { id: "difficultyLevel", label: "☆"},
      { id: "title", label: "曲名" },
      { id: "exScore", label: "Source"},
      {
        id: "compareData",
        label: "Compare",
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
            {full.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row:any,i:number) => {
              return (
                <TableRow
                  onClick={()=>this.handleOpen(false,row)}
                  hover role="checkbox" tabIndex={-1} key={row.title} style ={ i % 2? { background : "#f7f7f7" }:{ background : "white" }}>
                  {columns.map((column,j) => {
                    const prefix = row.difficulty === "hyper" ? "(H)" : row.difficulty === "leggendaria" ? "(†)" : "";
                    return (
                      <TableCell key={column.id + prefix} style={{backgroundColor : diffColor(j,row.scoreData),position:"relative"}}>
                        {row[column.id]}
                        {(j === 3) && <span className="plusOverlayScore">
                          {row.gap}
                          </span>
                        }
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
