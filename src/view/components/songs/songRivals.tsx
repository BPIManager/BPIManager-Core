import React from "react";

import { scoreData, songData } from "../../../types/data";
import Container from "@material-ui/core/Container";
import CircularProgress from "@material-ui/core/CircularProgress";
import {rivalListsDB} from "../../../components/indexedDB";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import Table from "@material-ui/core/Table";
import TableRow from "@material-ui/core/TableRow";
import {difficultyDiscriminator} from "../../../components/songs/filter";
import bpiCalcuator from "../../../components/bpi";
import fbActions from "../../../components/firebase/actions";
import { alternativeImg } from "../../../components/common";
import Loader from "../common/loader";

interface P{
  song:songData|null,
  score:scoreData|null,
}

interface S{
  isLoading:boolean,
  dataset:datasets[],
  yourEx:number,
}

interface datasets{
  rivalName:string,
  icon:string,
  exScore:number,
  BPI:number,
}

class SongRivals extends React.Component<P,S> {

  constructor(props:P){
    super(props);
    this.state = {
      isLoading:true,
      dataset:[],
      yourEx:0,
    }
  }

  componentDidMount(){
    this.updateScoreData();
  }

  async updateScoreData(){
    const {song,score} = this.props;
    if(!song || !score){
      return;
    }
    const bpi = new bpiCalcuator();
    if(!song){return};
    const s = new rivalListsDB();
    const rivals = await s.getAllScoresWithTitle(song.title,difficultyDiscriminator(song.difficulty));
    let list:datasets[] = [];
    for(let i=0;i < rivals.length; ++i){
      const item = rivals[i];
      const data = await s.getDisplayData(item.rivalName);
      list.push({
        rivalName:data.name,
        icon:data.icon,
        exScore:item.exScore,
        BPI:bpi.setPropData(song,item.exScore,item.isSingle)
      });
    }
    list.push({
      rivalName:"あなた",
      icon:new fbActions().currentIcon(),
      exScore:score.exScore,
      BPI:score.currentBPI
    })
    return this.setState({
      dataset:list.sort((a,b)=>b.exScore - a.exScore),
      isLoading:false,
      yourEx:score.exScore,
    })
  }

  render(){
    const {isLoading,dataset,yourEx} = this.state;
    const {song,score} = this.props;
    if(!song || !score){
      return (null);
    }
    return (
      <div>
        <Container>
          {
            isLoading && <Loader/>
          }
          {
            !isLoading && <DiffsTable scoreTable={dataset} yourEx={yourEx}/>
          }
        </Container>
      </div>
    );
  }
}

export default SongRivals;

class DiffsTable extends React.Component<{scoreTable:datasets[],yourEx:number},{}>{

  render(){

    const columns:{id:"rivalName"|"exScore"|"BPI"|"icon",label:string}[] = [
      { id: "icon", label: ""},
      { id: "rivalName", label: "ライバル"},
      { id: "exScore", label: "EX" },
      { id: "BPI", label: "BPI" },
    ];

    return (
      <Table className="rivalTable forceWith">
        <TableHead>
          <TableRow>
            {columns.map((column,_i) => (
              <TableCell
                key={column.id}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {this.props.scoreTable.map((row:datasets,i:number) => {
            return (
              <TableRow
                hover role="checkbox" tabIndex={-1} key={i} className={ i % 2 ? "isOdd" : "isEven"}>
                {columns.map((column,_j) => {
                  return (
                    <TableCell key={column.id} style={{width:column.id === "icon" ? "40px" : "auto",textAlign:"center",position:"relative"}}>
                      {column.id === "icon" &&
                        <img src={row.icon ? row.icon : "noimage"} style={{width:"40px",height:"40px",borderRadius:"100%"}}
                          alt={row.rivalName}
                          onError={(e)=>(e.target as HTMLImageElement).src = alternativeImg(row.rivalName)}/>
                      }
                      {column.id !== "icon"  && row[column.id]}
                      {column.id === "exScore" &&
                        <span className={"plusOverlayScore"}>
                        {(row["exScore"] - this.props.yourEx > 0 && "+")}
                        {row["exScore"] - this.props.yourEx !== 0 && row["exScore"] - this.props.yourEx}
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
    );
  }
}
