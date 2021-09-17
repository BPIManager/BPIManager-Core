import React from "react";
import { Dialog, DialogTitle, DialogContent, Table, TableHead, TableRow, TableCell, TableBody} from "@material-ui/core";
import { songData } from "@/types/data";
import { songsDB } from "@/components/indexedDB";
import bpiCalcuator from "@/components/bpi";
import { _isSingle } from "@/components/settings";
import { convertClearState, _prefix } from "@/components/songs/filter";
import { withRivalData } from "@/components/stats/radar";
import Loader from "@/view/components/common/loader";

interface P {
  showDetails:(key:withRivalData|null)=>void,
  currentScoreData:withRivalData|null,
}
export default class Details extends React.Component<P,{
  songData: songData|null
}> {

  constructor(props:P){
    super(props);
    this.state = {
      songData: null
    }
  }

  async componentDidMount(){
    const {currentScoreData} = this.props;
    if(!currentScoreData){
      return;
    }
    const song = await new songsDB().getOneItemIsSingle(currentScoreData.title,currentScoreData.difficulty);
    if(song && song.length === 1){
      return this.setState({songData:song[0]});
    }
  }

  bpiCalc = (input:number)=>{
    try{
      const {songData} = this.state;
      const bpi = new bpiCalcuator();
      if(!songData){
        return -15;
      }
      const res = bpi.setPropData(songData,input,_isSingle());
      return res;
    }catch(e){
      console.log(e);
      return -15;
    }
  }

  percentage = (input:number)=>{
    const {songData} = this.state;
    if(!songData){
      return 0;
    }
    return Math.round(input / (songData["notes"] * 2) * 10000) / 100;
  }

  render(){
    const {showDetails,currentScoreData} = this.props;
    const {songData} = this.state;
    const setInf = (item:number):number|"-"=>{
      return item === Infinity ? "-" : item;
    }
    if(!currentScoreData){
      return (null);
    }
    const items = [
      {title:"スコア",my:currentScoreData.myEx,rival:currentScoreData.rivalEx,isWin:currentScoreData.myEx - currentScoreData.rivalEx},
      {title:"BPI",my:setInf(this.bpiCalc(currentScoreData.myEx)),rival:setInf(this.bpiCalc(currentScoreData.rivalEx)),isWin:currentScoreData.myEx - currentScoreData.rivalEx},
      {title:"％",my:this.percentage(currentScoreData.myEx),rival:this.percentage(currentScoreData.rivalEx),isWin:currentScoreData.myEx - currentScoreData.rivalEx},
      {title:"BP",
      my:isNaN(currentScoreData.myMissCount || NaN) ? "-" :currentScoreData.myMissCount,
      rival:isNaN(currentScoreData.rivalMissCount || NaN) ? "-" :currentScoreData.rivalMissCount,
      isWin: (currentScoreData.rivalMissCount || 0) - (currentScoreData.myMissCount || 0)},
      {title:"ランプ",my:convertClearState(currentScoreData.myClearState,1,true),rival:convertClearState(currentScoreData.rivalClearState,1,true),isWin:currentScoreData.myClearState - currentScoreData.rivalClearState},
      {title:"最終更新",my:currentScoreData.myLastUpdate,rival:currentScoreData.rivalLastUpdate},
    ]
    const prefix = _prefix(currentScoreData.difficulty);
    return (
      <Dialog open={true} onClose={()=>showDetails(null)} onClick={()=>showDetails(null)}>
        <DialogTitle className="narrowDialogTitle">{currentScoreData.title}{prefix}</DialogTitle>
        <DialogContent className="narrowDialogContent">
          {songData &&
          <Table size="small">
            <TableHead>
              <TableRow className="rivalDetailModalTableRow">
                <TableCell className="rivalDetailModalTableBodyDesc" align="center">項目</TableCell>
                <TableCell align="center">あなた</TableCell>
                <TableCell align="center">ライバル</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item)=>(
                <TableRow className="rivalDetailModalTableRow" key={item.title}>
                  <TableCell className="rivalDetailModalTableBodyDesc" align="center">{item.title}</TableCell>
                  <TableCell align="center" style={item.title !== "最終更新" ? (item.isWin && item.isWin > 0) ? {color:"rgb(0, 177, 14)"} : {color:"#ff0000"} : {}}>
                    <span className="bodyNumber" >{item.my}</span>
                  </TableCell>
                  <TableCell align="center" style={item.title !== "最終更新" ? (item.isWin && item.isWin <= 0) ? {color:"rgb(0, 177, 14)"} : {color:"#ff0000"} : {}}>
                    <span className="bodyNumber" >{item.rival}</span>
                  </TableCell>
                </TableRow>
                ))
              }
            </TableBody>
          </Table>
        }
        {!songData && <Loader/>}
        </DialogContent>
      </Dialog>
    );
  }
}
