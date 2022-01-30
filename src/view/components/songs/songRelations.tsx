import React from "react";

import { scoreData, songData } from "@/types/data";
import Container from "@mui/material/Container";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import Table from "@mui/material/Table";
import TableRow from "@mui/material/TableRow";
import Loader from "../common/loader";
import { difficultyDiscriminator, _prefix } from "@/components/songs/filter";
import TableContainer from "@mui/material/TableContainer";
import { scoresDB, songsDB } from "@/components/indexedDB";
import { _currentStore, _isSingle } from "@/components/settings";
import bpiCalculator from "@/components/bpi";
import statMain from "@/components/stats/main";
import { Alert, AlertTitle } from "@mui/material";

interface P{
  song:songData|null,
  score:scoreData|null,
}

interface S{
  isLoading:boolean,
  dataset:data[],
  totalBPI:number
}

interface data{
  title:string,
  difficulty:string,
  correlation:string
}

class SongRelations extends React.Component<P,S> {

  constructor(props:P){
    super(props);
    this.state = {
      isLoading:true,
      dataset:[],
      totalBPI:-15,
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

    let exec = await (await new statMain(12).load()).setLastData(String(Number(_currentStore()) - 1));
    const totalBPI = new bpiCalculator().setSongs(exec.at(),exec.at().length) || -15;
    console.log(totalBPI);
    return this.setState({
      dataset:await this.getSuggest(song),
      isLoading:false,
      totalBPI:totalBPI
    })
  }

  getSuggest = async(song:songData)=>{
    const params = new URLSearchParams();
    const param:{[key:string]:any} = {
      title:song.title,
      difficulty:difficultyDiscriminator(song.difficulty),
      limit:10,
    };
    Object.keys(param).map((item:string)=>{
      params.append(item,param[item]);
      return 0;
    })
    const t = await fetch("https://proxy.poyashi.me/bpim/api/v1/stats/correlations/getRelations?" + params);
    const p = await t.json();
    return p.body;
  }

  render(){
    const {isLoading,dataset,totalBPI} = this.state;
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
            !isLoading && <React.Fragment>{dataset.map((item)=><DiffsTable scoreTable={item} bpi={totalBPI}/>)}</React.Fragment>
          }
          {
            (!isLoading && dataset.length === 0) && (
            <Alert severity="error" style={{marginTop:10}}>
              <AlertTitle>データなし</AlertTitle>
              <p>
              表示できるデータが見つかりませんでした。<br/>
              プレイ人数が少なすぎるか、データが登録されていません。<br/>
              また今度試して下さい。
              </p>
            </Alert>
            )
          }
        </Container>
        <Alert severity="info" style={{marginTop:10}}>
          <AlertTitle>このタブについて</AlertTitle>
          <p>
          「{song.title}」で高いスコアを出している人が、高いスコアを出しがちな楽曲を一覧表示します。<br/>
          「理論スコア」は、あなたの総合BPIに相当するEXスコアを示します。<br/>
          ※2曲間のスコアに相関があることを示しており、譜面傾向が似ているとは限りません。
          </p>
        </Alert>
      </div>
    );
  }
}

export default SongRelations;

export class DiffsTable extends React.Component<{scoreTable:data,bpi:number},{
  score:scoreData|null,
  song:songData|null,
  loading:boolean
}>{

  state = {
    score:null,
    song:null,
    loading:true,
  }

  async componentDidMount(){
    const {scoreTable} = this.props;
    const score = await new scoresDB().getItem(scoreTable.title,scoreTable.difficulty,_currentStore(),_isSingle());
    const song = await new songsDB().getOneItemIsSingle(scoreTable.title,scoreTable.difficulty);
    this.setState({
      score:score.length > 0 ? score[0] : null,
      song:song.length > 0 ? song[0] : null,
      loading:false
    })
  }

  getFromBPI = ():number=>{
    const {song} = this.state;
    const b = new bpiCalculator();
    if(!song) return 0;
    const s = song as songData;
    b.setData(s.notes * 2,s.avg,s.wr);
    b.setCoef(s.coef);

    return Math.ceil(b.calcFromBPI(this.props.bpi));
  }

  isHigher = ():boolean=>{
    const {score} = this.state;
    const target = this.getFromBPI();
    if(!score) return false;
    return (score as scoreData).exScore - target > 0;
  }

  scoreDiff = ()=> Math.abs(this.state.score ? (this.state.score as scoreData).exScore - this.getFromBPI() : this.getFromBPI());

  render(){
    const {scoreTable} = this.props;
    const {score,loading} = this.state;
    return (
      <React.Fragment>
      <TableContainer style={{marginBottom:"8px"}}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="titleForceLeft">
              {scoreTable.title}{_prefix(scoreTable.difficulty,true)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell component="th" scope="row" className="dense tableTopDiff" style={{opacity:.6}}>
              MYスコア
              </TableCell>
              <TableCell className="denseCont" style={{position:"relative"}}>
              <span className="plusOverlayScore">
              {(this.isHigher() && score) && (
                <span>
                  +{this.scoreDiff()}
                </span>
              )}
              </span>
              {score ? (score as scoreData).exScore : "-"}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell component="th" scope="row" className="dense tableTopDiff" style={{opacity:.6}}>
              理論スコア
              </TableCell>
              <TableCell className="denseCont" style={{position:"relative"}}>
              <span className="plusOverlayScore">
              {(!this.isHigher() && score) && (
                <span>
                  +{this.scoreDiff()}
                </span>
              )}
              </span>
              {loading ? "-" : this.getFromBPI()}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      </React.Fragment>
    );
  }
}
