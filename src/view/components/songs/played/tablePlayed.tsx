  import React from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";

import {scoreData, songData} from "@/types/data";
import { _prefix, genTitle } from "@/components/songs/filter";
import DetailedSongInformation from "../detailsScreen";
import { diffColor, behindScore, bp } from "../common";
import _djRank from "@/components/common/djRank";
import { _currentViewComponents, _traditionalMode } from "@/components/settings";
import bpiCalcuator from "@/components/bpi";
import { scoresDB } from "@/components/indexedDB";

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
  mode:number,
  allSongsData:Map<String,songData>
  updateScoreData:(row:songData)=>void,
  page:number,
  handleChangePage:(_e:React.MouseEvent<HTMLButtonElement, MouseEvent> | null, newPage:number)=>void
}

interface S{
  rowsPerPage:number,
  isOpen:boolean,
  FV:number,
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
      FV:0,
      currentSongData:null,
      currentScoreData:null,
      components:_currentViewComponents().split(","),
    }
  }

  handleOpen = (updateFlag:boolean,row:songData|scoreData):void=> {
    if(updateFlag){this.props.updateScoreData(row as songData);}
    return this.setState({
      isOpen:!this.state.isOpen,
      FV:0,
      currentSongData:(row ? this.props.allSongsData.get(genTitle(row.title,row.difficulty)) : null) as songData,
      currentScoreData:(row ? row : null) as scoreData
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
    estRank = this.willBeRendered("estRank"), djLevel = this.willBeRendered("djLevel"), percentage = this.willBeRendered("percentage");
    const {rowsPerPage,isOpen,currentSongData,currentScoreData,FV} = this.state;
    const {page,data,mode} = this.props;
    return (
      <Paper style={{width:"100%",overflowX:"auto"}} id="screenCaptureTarget" className={_traditionalMode() === 1 ? "traditionalMode" : ""}>
        <React.Fragment>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((column,i) => (
                  <TableCell
                    key={column.id}
                  >
                    {(mode < 5 || i !== 2 ) && column.label}
                    {(mode > 4 && i === 2) && "BP"}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row:scoreData,i:number) => {
                const prefix = _prefix(row.difficulty);
                const f = this.props.allSongsData.get(row.title + prefix);
                if(!f){return (null);}
                const max  = f["notes"] * 2;
                return (
                  <TableRow
                    onClick={()=>this.handleOpen(false,row)}
                    hover role="checkbox" tabIndex={-1} key={row.title + row.prefix + i} className={ i % 2 ? "songCell isOdd" : "songCell isEven"}>
                    {columns.map((column,j) => {
                      if(Number.isNaN(row.currentBPI)) return (null);
                      const fontSize = ()=>{
                        if(column.id !== "title") return "";
                        if(row.title.length < 20) return "";
                        if(window.innerWidth < 500) return " smallFont";
                      };
                      const left = column.id === "difficultyLevel" ? "9px solid " + diffColor(j,row.clearState) : "1px solid rgb(245 245 245 / 8%)";
                      return (
                        <TableCell className={row.currentBPI === Infinity ? "isInfiniteBPI" : ""} key={column.id + row.title + row.prefix + prefix} style={{boxSizing:"border-box",borderLeft:left ,position:"relative"}} >
                          {(mode < 6 && column.id === "currentBPI") && <span className={j >= 2 ? "bodyNumber" : ""}>{Number(row[column.id]) === Infinity ? "-" : Number(row[column.id]).toFixed(2)}</span>}
                          {(column.id !== "currentBPI" && column.id !== "title") && <span className={j >= 2 ? "bodyNumber" : ""}>{row[column.id]}</span>}
                          {column.id === "title" && <span className={(j >= 2 ? "bodyNumber" : "") + fontSize()}>{row[column.id]}</span>}
                          {column.id === "title" && <span>{prefix}</span>}
                          {(mode > 5 && column.id === "currentBPI") && bp(row.missCount || NaN)}
                          <span className={i % 2 ? "plusOverlayScore isOddOverLayed" : "plusOverlayScore isEvenOverLayed"}>
                            {(j === 3) &&
                              <span>
                                {lastVer && <LastVerComparison row={row} lastVer={lastVer} last={last} mode={mode}/>}
                                {(last && row.lastScore > -1 && mode === 0) &&
                                  <span>
                                    {row.exScore - row.lastScore >= 0 && <span>+</span>}
                                    {Number(row.exScore - row.lastScore)}
                                  </span>
                                }
                                {(mode > 0 && mode < 6) &&
                                  <span>-{behindScore(row,f,mode)}</span>
                                }
                              </span>
                            }
                          </span>
                          {(j === 3) &&
                            <span className={i % 2 ? "plusOverlayScoreBottom isOddOverLayed" : "plusOverlayScoreBottom isEvenOverLayed"}>
                              {percentage &&
                                <span>{Math.round((row.exScore / (f.notes * 2)) * 10000) / 100}%</span>
                              }
                              {(percentage && (estRank || djLevel)) &&
                                <span>
                                  &nbsp;/&nbsp;
                                </span>
                              }
                              {estRank &&
                                <span>
                                  {row.currentBPI === Infinity && <span>-</span> }
                                  {row.currentBPI !== Infinity && <span>{bpiCalc.rank(row.currentBPI)}位</span> }
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
        </React.Fragment>
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
          onPageChange={this.props.handleChangePage}
          onRowsPerPageChange={this.handleChangeRowsPerPage}
        />
        {isOpen &&
          <DetailedSongInformation isOpen={isOpen} song={currentSongData} score={currentScoreData} handleOpen={this.handleOpen} firstView={FV}/>
        }
      </Paper>
    );
  }
}

interface LP{row:scoreData,last:boolean,lastVer:boolean,mode:number};

class LastVerComparison extends React.Component<LP,{diff:number}>{

  private _isMounted = false;
  private scoresDB = new scoresDB();

  constructor(props:LP){
    super(props);
    this.state = {
      diff:NaN,
    }
  }

  async componentDidMount(){
    this._isMounted = true;
    const {row} = this.props;
    const t = await this.scoresDB.getItem(row.title,row.difficulty,String(Number((row.storedAt)) - 1),row.isSingle);
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
