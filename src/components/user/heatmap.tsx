import timeFormatter, { untilDate } from "../common/timeFormatter";

export const makeHeatmap = (scores:any)=>{
  const p = scores.reduce((group:any,item:any)=>{
    const date = timeFormatter(7,item.updatedAt);
    if(untilDate(item.updatedAt,false) > 180) return group;
    if(!group) group = {};
    if(!group[date]) group[date] = 0;
    group[date]++;
    return group;
  },{});
  const q = Object.keys(p).reduce((group:{date:string,count:number}[],item:any)=>{
    if(!group) group = [];
    group.push({date:item,count:p[item]})
    return group;
  },[])
  return q.sort((a:any,b:any)=>{
    return new Date(timeFormatter(3,a.date)).getTime() - new Date(timeFormatter(3,b.date)).getTime()
  });
}

export const colorClassifier = (input:any):string=>{
  if(!input || !input.count) return "color-empty";
  const c = input.count;
  if(c <= 0) return "color-empty";
  if(c < 5) return "color-scale-1";
  if(c < 10) return "color-scale-2";
  if(c < 20) return "color-scale-3";
  if(c >= 20) return "color-scale-4";
  return "color-empty";
}
