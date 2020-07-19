import React from "react";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import { diffColor } from "@/view/components/songs/common";
import { _currentViewComponents, _traditionalMode } from "@/components/settings";
import Details from "./modal";
import { withRivalData } from "@/components/stats/radar";

const columns = [
  { id: "difficultyLevel", label: "☆"},
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
  data:withRivalData[],
  page:number,
  mode:number,
  handleChangePage:(_e:React.MouseEvent<HTMLButtonElement, MouseEvent> | null, newPage:number)=>void
}

interface S{
  rowsPerPage:number,
  isOpen:boolean,
  currentScoreData:withRivalData | null,
  components:string[]
}

export default class ScoreTable extends React.Component<Readonly<P>,S>{

  constructor(props:Readonly<P>){
    super(props);
    this.state = {
      rowsPerPage : 10,
      isOpen:false,
      currentScoreData:null,
      components:_currentViewComponents().split(","),
    }
  }

  handleChangeRowsPerPage = (event:React.ChangeEvent<HTMLInputElement>):void => {
    this.props.handleChangePage(null,0);
    this.setState({rowsPerPage:+event.target.value});
  }

  willBeRendered =(component:string):boolean=>{
    return this.state.components.indexOf(component) > -1;
  }

  showDetails = (row:withRivalData|null)=>this.setState({currentScoreData:row,isOpen:!this.state.isOpen});

  render(){
    const {rowsPerPage,currentScoreData,isOpen} = this.state;
    const {page,data,mode} = this.props;
    return (
      <Paper style={{width:"100%",overflowX:"auto"}} className={_traditionalMode() === 1 ? "traditionalMode" : ""}>
        <div>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
              {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row:withRivalData,i:number) => {
                const prefix = row.difficulty === "hyper" ? "(H)" : row.difficulty === "leggendaria" ? "(†)" : "";
                const a:number = mode === 0 ? row.rivalEx : mode === 1 ? row.rivalClearState : row.rivalMissCount as number;
                const b:number = mode === 0 ? row.myEx : mode === 1 ? row.myClearState : row.myMissCount as number;
                return (
                <TableBody className="rival" key={row.title + i} onClick={()=>this.showDetails(row)}>
                  <TableRow
                    hover role="checkbox" tabIndex={-1} className={ i % 2 ? "isOdd" : "isEven"}>
                    <TableCell
                      rowSpan={2}
                      style={{position:"relative"}}
                    >
                      {row["difficultyLevel"]}
                    </TableCell>
                    <TableCell
                      rowSpan={1}
                      colSpan={3}
                      style={{position:"relative"}}
                    >
                      {row["title"]}
                      {prefix}
                    </TableCell>
                  </TableRow>
                  <TableRow className="rivalBody">
                    <TableCell
                      style={{
                        borderLeft:`4px solid ${diffColor(2,row.myClearState,2)}`,
                        position:"relative"}}
                    >
                      <span className={"bodyNumber"}>
                        {((Number.isNaN(b) || !b) ? "-" : b)}
                      </span>
                    </TableCell>
                    <TableCell
                      style={{
                        borderLeft:`4px solid ${diffColor(3,row.rivalClearState,3)}`,
                        position:"relative"}}
                    >
                      <span className={"bodyNumber"}>
                        {((Number.isNaN(a) || !a) ? "-" : a)}
                      </span>
                    </TableCell>
                    <TableCell
                      style={{
                        borderLeft:"0px",
                        position:"relative"}}
                    >
                      <span className={"bodyNumber"}
                        style={ (b-a) >= 0 ? {color:"rgb(0, 177, 14)"} : {color:"#ff0000"}}>
                        {Number.isNaN(b - a) ? Number.isNaN(b) ? "-" : b : Number(b-a)}
                      </span>
                    </TableCell>
                  </TableRow>
                </TableBody>
                );
              })}
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
        {isOpen && <Details showDetails={this.showDetails} currentScoreData={currentScoreData} />}
      </Paper>
    );
  }
}
