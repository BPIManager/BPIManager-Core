import React from "react";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";

import {scoreData, songData} from "../../../../types/data";
import { _prefix } from "../../../../components/songs/filter";
import DetailedSongInformation from "../detailsScreen";
import { diffColor, behindScore, bp } from "../common";
import _djRank from "../../../../components/common/djRank";
import { _currentViewComponents } from "../../../../components/settings";
import bpiCalcuator from "../../../../components/bpi";
import { scoresDB } from "../../../../components/indexedDB";

const columns = [
  { id: "difficultyLevel", label: "☆"},
  { id: "title", label: "曲名" },
  { id: "currentBPI", label: "BPI"},
  {
    id: "exScore",
    label: "EX",
  },
];

interface P{
  data:scoreData[],
  sort:number,
  isDesc:boolean,
  changeSort:(newNum:number)=>void,
  mode:number,
  allSongsData:{[key:string]:any}
  updateScoreData:()=>void,
  page:number,
  handleChangePage:(_e:React.MouseEvent<HTMLButtonElement, MouseEvent> | null, newPage:number)=>void
}

interface S{
  rowsPerPage:number,
  isOpen:boolean,
  currentSongData:songData | null,
  currentScoreData:scoreData | null,
  components:string[]
}

export default class SongsTable extends React.Component<Readonly<P>,S>{

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

  private scoresDB = new scoresDB();

  handleOpen = (updateFlag:boolean,row?:any,_willDeleteItems?:any):void=> {
    if(updateFlag){this.props.updateScoreData();}
    return this.setState({
      isOpen:!this.state.isOpen,
      currentSongData:row ? this.props.allSongsData[row.title + _prefix(row.difficulty)] : null,
      currentScoreData:row ? row : null
    });
  }

  handleChangeRowsPerPage = (event:React.ChangeEvent<HTMLInputElement>):void => {
    this.props.handleChangePage(null,0);
    this.setState({rowsPerPage:+event.target.value});
  }

  willBeRendered =(component:string):boolean=>{
    return this.state.components.indexOf(component) > -1;
  }

  render(){
    const bpiCalc = new bpiCalcuator();
    const last = this.willBeRendered("last"), lastVer = this.willBeRendered("lastVer"),
    estRank = this.willBeRendered("estRank"), djLevel = this.willBeRendered("djLevel");
    const {rowsPerPage,isOpen,currentSongData,currentScoreData} = this.state;
    const {page,data,changeSort,sort,isDesc,mode} = this.props;
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
                    {(mode < 5 || i !== 2 ) && column.label}
                    {(mode > 4 && i === 2) && "BP"}
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
                const max  = this.props.allSongsData[row.title + prefix]["notes"] * 2;
                return (
                  <TableRow
                    onClick={()=>this.handleOpen(false,row)}
                    hover role="checkbox" tabIndex={-1} key={row.title + row.prefix + i} className={ i % 2 ? "isOdd" : "isEven"}>
                    {columns.map((column,j) => {
                      return (
                        <TableCell key={column.id + prefix} style={{backgroundColor : diffColor(j,row),position:"relative"}}>
                          {(mode < 6 && column.id === "currentBPI") && <span className={j >= 2 ? "bodyNumber" : ""}>{Number(row[column.id]).toFixed(2)}</span>}
                          {(mode < 6 && column.id !== "currentBPI") && <span className={j >= 2 ? "bodyNumber" : ""}>{row[column.id]}</span>}

                          {column.id === "title" && prefix}
                          {(mode > 5 && column.id === "currentBPI") && bp(row.missCount)}
                          <span className={i % 2 ? "plusOverlayScore isOddOverLayed" : "plusOverlayScore isEvenOverLayed"}>
                            {(j === 3) &&
                              <span>
                                {lastVer && <LastVerComparison row={row} scoresDB={this.scoresDB} lastVer={lastVer} last={last} mode={mode}/>}
                                {(last && row.lastScore > -1 && mode === 0) &&
                                  <span>
                                    {row.exScore - row.lastScore >= 0 && <span>+</span>}
                                    {Number(row.exScore - row.lastScore)}
                                  </span>
                                }
                                {(mode > 0 && mode < 6) &&
                                  <span>-{behindScore(row,this.props.allSongsData,mode)}</span>
                                }
                              </span>
                            }
                          </span>
                          {(j === 3) &&
                            <span className={i % 2 ? "plusOverlayScoreBottom isOddOverLayed" : "plusOverlayScoreBottom isEvenOverLayed"}>
                              {estRank &&
                                <span>
                                  {bpiCalc.rank(row.currentBPI)}位
                                </span>
                              }
                              {(estRank && djLevel) &&
                                <span>
                                  &nbsp;/&nbsp;
                                </span>
                              }
                              {djLevel &&
                                <span>
                                  {_djRank(false,false,max,row.exScore)}
                                  {_djRank(false,true,max,row.exScore)}&nbsp;/&nbsp;
                                  {_djRank(true,false,max,row.exScore)}
                                  {_djRank(true,true,max,row.exScore)}
                                </span>
                              }
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
        {isOpen &&
          <DetailedSongInformation isOpen={isOpen} song={currentSongData} score={currentScoreData} handleOpen={this.handleOpen}/>
        }
      </Paper>
    );
  }
}

class LastVerComparison extends React.Component<{row:any,scoresDB:any,last:boolean,lastVer:boolean,mode:number},{diff:number}>{

  private _isMounted = false;

  constructor(props:{row:any,scoresDB:any,last:boolean,lastVer:boolean,mode:number}){
    super(props);
    this.state = {
      diff:NaN,
    }
  }

  async componentDidMount(){
    this._isMounted = true;
    const {row} = this.props;
    const t = await this.props.scoresDB.getItem(row.title,row.difficulty,String(Number((row.storedAt)) - 1),row.isSingle);
    if(!this._isMounted || !t || t.length === 0) return;
    return this.setState({diff: row.exScore - t[0]["exScore"]});
  }

  componentWillUnmount(){
    this._isMounted = false;
  }

  render(){
    const {last,lastVer,mode} = this.props;
    const {diff} = this.state;
    if(Number.isNaN(diff) || !lastVer){
      return (null);
    }
    return (
      <span style={{color:"#909090"}}>
        <span>前作{diff >= 0 ? "+" + diff : diff}</span>
        {(last && mode < 6) &&
          <span>
            &nbsp;/&nbsp;
          </span>
        }
      </span>
    );
  }
}
