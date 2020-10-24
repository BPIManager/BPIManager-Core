import { _goalBPI, _isSingle, _currentStore } from "../settings";
import { scoresDB } from "../indexedDB";
import bpiCalcuator from "../bpi";
import React from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import { _prefix } from "../songs/filter";

export interface withRivalData{
  title:string,
  difficulty:string,
  difficultyLevel:string,
  myEx:number,
  rivalEx:number,
  myMissCount:number|undefined,
  rivalMissCount:number|undefined,
  myClearState:number,
  rivalClearState:number,
  myLastUpdate:string,
  rivalLastUpdate:string,
}

interface D {
  title:string,
  difficulty:string,
  exScore:number,
  currentBPI:number
}

export interface radarData{
  title: string,
  TotalBPI: number,
  rivalTotalBPI: number,
  details:D[],
  rivalDetails:D[],
  ObjectiveBPI: number,
  rank:number
}

export const songs:{[key:string]:[string,string][]} = {
  "NOTES":[
    ["Verflucht","leggendaria"],
    ["Elemental Creation","another"],
    ["perditus†paradisus","another"],
    ["Sigmund","leggendaria"],
    ["B4U(BEMANI FOR YOU MIX)","leggendaria"],
    ["Chrono Diver -PENDULUMs-","another"],
  ],
  "CHARGE":[
    ["TOGAKUSHI","another"],
    ["DIAMOND CROSSING","another"],
    ["ECHIDNA","another"],
    ["Timepiece phase II (CN Ver.)","another"],
    ["Snakey Kung-fu","another"]
  ],
  "PEAK":[
    ["X-DEN","another"],
    ["卑弥呼","another"],
    ["疾風迅雷","leggendaria"],
    ["KAMAITACHI","leggendaria"],
    ["天空の夜明け","another"],
  ],
  "CHORD":[
    ["Rave*it!! Rave*it!! ","another"],
    ["waxing and wanding","leggendaria"],
    ["Little Little Princess","leggendaria"],
    ["mosaic","another"],
    ["Despair of ELFERIA","another"],
    ["Beat Radiance","leggendaria"]
  ],
  "GACHIOSHI":[
    ["255","another"],
    ["BITTER CHOCOLATE STRIKER","another"],
    ["童話回廊","another"],
    ["VANESSA","leggendaria"],
    ["GRID KNIGHT","leggendaria"]
  ],
  "SCRATCH":[
    ["灼熱 Pt.2 Long Train Running","another"],
    ["灼熱Beach Side Bunny","another"],
    ["BLACK.by X-Cross Fade","another"],
    ["Red. by Jack Trance","another"],
    ["Snake Stick","another"],
    ["火影","another"]
  ],
  "SOFLAN":[
    ["冥","another"],
    ["Fascination MAXX","another"],
    ["PARANOiA ～HADES～","another"],
    ["DAY DREAM","another"],
    ["音楽","another"],
    ["ruin of opals","another"],
    ["Concertino in Blue","another"]
  ],
  "DELAY":[
    ["Mare Nectaris","another"],
    ["quell～the seventh slave～","another"],
    ["子供の落書き帳","another"],
    ["DIAVOLO","another"],
    ["Thor's Hammer","another"]
  ],
  "RENDA":[
    ["ピアノ協奏曲第１番”蠍火”","another"],
    ["Scripted Connection⇒ A mix","another"],
    ["Innocent Walls","hyper"],
    ["IMPLANTATION","another"],
    ["Sense 2007","another"],
    ["ワルツ第17番 ト短調”大犬のワルツ”","another"]
  ]
}

export const getRadar = async(withRivalData:withRivalData[]|null = null):Promise<radarData[]>=>{
  const objective = _goalBPI(),isSingle = _isSingle(),currentStore = _currentStore();
  const db = new scoresDB(isSingle, currentStore);
  const fillArray = (p:number[],len:number)=>{
    if(p.length < len){
      const l = len - p.length;
      for(let j = 0; j < l;++j){
        p.push(-15);
      }
    }
    return p;
  }
  return await Object.keys(songs).reduce(async (obj:Promise<radarData[]>,title:string)=>{
    const collection = await obj;
    const len = songs[title].length;
    const bpi = new bpiCalcuator();
    let pusher:number[] = [];
    let details:D[] = [];
    let rivalDetails:D[] = [];
    let rivalPusher:number[] = [];

    for(let i = 0; i < len; ++i){
      const ind = await db.getItem(unescape(songs[title][i][0]),songs[title][i][1],currentStore,isSingle);
      ind.length > 0 && pusher.push(ind[0]["currentBPI"]);
      details.push({
        title:songs[title][i][0],
        difficulty:songs[title][i][1],
        exScore:ind.length > 0 ? ind[0].exScore : 0,
        currentBPI:ind.length > 0 ? ind[0].currentBPI : -15
      });
      if(withRivalData){
        let currentBPI = -15;
        const rivalData = withRivalData.find((item:withRivalData)=>item.title === unescape(songs[title][i][0]) && item.difficulty === songs[title][i][1]);
        if(rivalData){
          const res = await bpi.calc(rivalData.title,rivalData.difficulty,rivalData.rivalEx);
          currentBPI = !res.error ? res.bpi : -15
          rivalPusher.push(currentBPI);
        }
        rivalDetails.push({
          title:songs[title][i][0],
          difficulty:songs[title][i][1],
          exScore:rivalData ? rivalData.rivalEx : 0,
          currentBPI:currentBPI
        });
      }
    }
    fillArray(pusher,len);
    fillArray(rivalPusher,len);

    bpi.allTwelvesBPI = pusher;
    bpi.allTwelvesLength = pusher.length;
    const total = bpi.totalBPI();
    bpi.allTwelvesBPI = rivalPusher;
    bpi.allTwelvesLength = rivalPusher.length;
    const rivalTotal = bpi.totalBPI();
    collection.push({
      title: title,
      TotalBPI: total,
      details:details,
      rivalTotalBPI: rivalTotal,
      rivalDetails:rivalDetails,
      ObjectiveBPI: objective,
      rank:bpi.rank(total,false) / bpi.getTotalKaidens() * 100
    });
    return Promise.resolve(obj);
  },Promise.resolve([]));
}

export class Details extends React.Component<{
  closeModal:(key:string)=>void,
  withRival:boolean,
  data:radarData[],
  title:string,
},{}> {

  render(){
    const {closeModal,withRival,data,title} = this.props;
    const target = data.find((item:radarData)=>item.title === title);
    if(!target){
      return;
    }
    return (
      <Dialog open={true} onClose={()=>closeModal("")}>
        <DialogTitle className="narrowDialogTitle">{title}</DialogTitle>
        <DialogContent className="narrowDialogContent">
          <Table size="small">
            <TableHead>
              <TableRow className="detailModalTableRow">
                <TableCell component="th">
                  楽曲
                </TableCell>
                {withRival && <TableCell align="right">ライバル</TableCell>}
                <TableCell align="right">あなた</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {target.details && target.details.map((item:D)=> {
                const rival = (withRival && target.rivalDetails) ? target.rivalDetails.find((rd:D)=>rd.title === item.title): {exScore:0,currentBPI:0};
                return (
                <TableRow key={item.title}>
                  <TableCell component="th" style={{width:"100%"}}>
                    {item.title}{_prefix(item.difficulty)}
                  </TableCell>
                  {(withRival && rival) && <TableCell align="right">{rival.exScore}<br/>BPI:{rival.currentBPI.toFixed(2)}</TableCell>}
                  <TableCell align="right">{item.exScore}<br/>BPI:{item.currentBPI.toFixed(2)}</TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    );
  }
}
