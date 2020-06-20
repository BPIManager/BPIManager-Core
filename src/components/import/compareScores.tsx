import { scoreData } from "../../types/data";

export default class compareScores {

  oldData:{[key:string]:scoreData} = {};
  newData:{[key:string]:scoreData} = {};

  constructor(oldData:scoreData[],newData:scoreData[]){
    this.oldData = this.dataFormatter(oldData);
    this.newData = this.dataFormatter(newData);
  }

  dataFormatter(data:scoreData[]){
    return data.reduce((result:{[key:string]:scoreData}, current:scoreData) => {
      result[current.title + current.difficulty] = current;
      return result;
    }, {});
  }

  exec(){
    let updated = 0;
    Object.keys(this.newData).map((key)=>{
      const n = this.newData[key];
      const o = this.oldData[n.title + n.difficulty];
      if(n.exScore > o.exScore || n.clearState > o.clearState || (n.missCount || 0) < (o.missCount || -1)){
        updated++
      }
    });
    return updated;
  }


}
// const updatedNumbers = new compareScores(this.state.scoreData.scores,await new scoresDB().getAll()).exec();
