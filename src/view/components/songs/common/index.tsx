import { _prefix } from "../../../../components/songs/filter";

export const diffColor = (i:number,row: any):string=>{
  if(i !== 0){return "transparent";}
  switch (row.clearState){
    case 0 : return "#e0dede";
    case 1 : return "#ea63ff";
    case 2 : return "#acffab";
    case 3 : return "#ff707a";
    case 4 : return "#ff4545";
    case 5 : return "#fff373";
    case 6 : return "#ff793b";
    default: return "#ffffff";
  }
}

export const behindScore = (row:any,allSongsData:{[key:string]:any},mode:number)=>{
  try{
    const ghost = [1,2/3,7/9,8/9,1];
    const max = allSongsData[row.title + _prefix(row.difficulty)]["notes"] * 2;
    return Math.ceil(max * ghost[mode] - row.exScore)
  }catch(e){
    return;
  }
}

export const bp = (bp:number):string=>{
  if(Number.isNaN(bp)){
    return "-";
  }
  return String(bp);
}
