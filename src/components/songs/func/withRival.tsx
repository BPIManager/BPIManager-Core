import { withRivalData } from "@/components/stats/radar";
import { toMoment } from "@/components/common/timeFormatter";
import { songFuncCommon } from "./common";

export class songFuncWithRival extends songFuncCommon{

  private data:withRivalData = {
    title:"",
    difficulty:"",
    difficultyLevel:"",
    myEx:0,
    rivalEx:0,
    myMissCount:undefined,
    rivalMissCount:undefined,
    myClearState:0,
    rivalClearState:0,
    myLastUpdate:"",
    rivalLastUpdate:"",
  };

  setData(data:withRivalData){
    this.data = data;
  }

  evaluateGap = (pm:string[])=>{
    const plus = pm.indexOf("+") > -1;
    const minus = pm.indexOf("-") > -1;
    if(!plus && minus) return this.data.myEx - this.data.rivalEx <= 0;
    if(plus && !minus) return this.data.myEx - this.data.rivalEx > 0;
    return plus && minus ? true : false;
  }

  isTodayOnly = (todayOnly:string)=>{
    if(!todayOnly){
      return true;
    }else{
      return toMoment(this.data.rivalLastUpdate) === toMoment(todayOnly === "1" ? new Date() : todayOnly);
    }
  }

}
