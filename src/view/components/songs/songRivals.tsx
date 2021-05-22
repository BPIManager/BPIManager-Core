import React from "react";

import { scoreData, songData } from "@/types/data";
import Container from "@material-ui/core/Container";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import Table from "@material-ui/core/Table";
import TableRow from "@material-ui/core/TableRow";
import { alternativeImg } from "@/components/common";
import Loader from "../common/loader";
import { datasets, rivalShow } from "@/components/rivals/letters";
import Alert from "@material-ui/lab/Alert/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";
import {Link as RLink} from "react-router-dom";
import Button from "@material-ui/core/Button";

interface P{
  song:songData|null,
  score:scoreData|null,
}

interface S{
  isLoading:boolean,
  dataset:datasets[],
  yourEx:number,
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
    return this.setState({
      dataset:await rivalShow(song,score),
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
        <Container fixed>
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

export class DiffsTable extends React.Component<{scoreTable:datasets[],yourEx:number},{}>{

  render(){

    const columns:{id:"rivalName"|"exScore"|"BPI"|"icon",label:string}[] = [
      { id: "icon", label: ""},
      { id: "rivalName", label: "ライバル"},
      { id: "exScore", label: "EX" },
      { id: "BPI", label: "BPI" },
    ];
    if(this.props.scoreTable.length === 1){ //自分以外いない場合
        return (
        <React.Fragment>
          <Alert severity="warning" variant="outlined" style={{marginTop:"10px"}}>
            <AlertTitle>ライバルがいません!</AlertTitle>
            <p>総合BPIやアリーナランクなどの条件から、あなたと実力が拮抗しているライバルを探しましょう。</p>
          </Alert>
          <RLink to="/rivals" style={{textDecoration:"none"}}>
            <Button variant="outlined" color="secondary" fullWidth style={{margin:"10px 0"}}>ライバルを探す</Button>
          </RLink>
        </React.Fragment>
      );
    }
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
                      {column.id !== "icon"  && <span>{row[column.id] === Infinity ? "-" : row[column.id]}</span>}
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
