
const _djRank = (showBody:boolean,isBody:boolean,max:number,s:number):string =>{
  const percentage:number =  s  / max;
  if(percentage < 2/9){
    if(showBody) return !isBody ? "F+" : `${Math.ceil(s - max * 1/9)}`;
    return !isBody ? "E-" : `${Math.ceil(max * 2/9) - s}`;
  }
  if(percentage >= 2/9 && percentage < 1/3){
    if(showBody) return !isBody ? "E+" : `${Math.ceil(s - max * 2/9)}`;
    return !isBody ? "D-" : `${Math.ceil(max * 1/3) - s}`;
  }
  if(percentage >= 1/3 && percentage < 4/9){
    if(showBody) return !isBody ? "D+" : `${Math.ceil(s - max * 1/3)}`;
    return !isBody ? "C-" : `${Math.ceil(max * 4/9) - s}`;
  }
  if(percentage >= 4/9 && percentage < 5/9){
    if(showBody) return !isBody ? "C+" : `${Math.ceil(s - max * 4/9)}`;
    return !isBody ? "B-" : `${Math.ceil(max * 5/9) - s}`;
  }
  if(percentage >= 5/9 && percentage < 2/3){
    if(showBody) return !isBody ? "B+" : `${Math.ceil(s - max * 5/9)}`;
    return !isBody ? "A-" : `${Math.ceil(max * 2/3) - s}`;
  }
  if(percentage >= 2/3 && percentage < 7/9){
    if(showBody) return !isBody ? "A+" : `${Math.ceil(s - max * 2/3)}`;
    return !isBody ? "AA-" : `${Math.ceil(max * 7/9) - s}`;
  }
  if(percentage >= 7/9 && percentage < 8/9){
    if(showBody) return !isBody ? "AA+" : `${Math.ceil(s - max * 7/9)}`;
    return !isBody ? "AAA-" : `${Math.ceil(max * 8/9) - s}`;
  }
  if(percentage >= 8/9 && percentage < 17/18){
    if(showBody) return !isBody ? "MAX-" : `${max - s}`;
    return !isBody ? "AAA+" : `${s - Math.ceil(max * 8/9)}`;
  }
  if(percentage >= 17/18){
    if(showBody) return !isBody ? "AAA+" : `${s - Math.ceil(max * 8/9)}`;
    return !isBody ? "MAX-" : `${max - s}`;
  }
  return "";
}

export const _DiscriminateRanksByNumber = (percentage:number):number =>{
  return (
    (percentage < 2/9) ? 0 :
    (percentage >= 2/9 && percentage < 1/3) ? 1 :
    (percentage >= 1/3 && percentage < 4/9) ? 2 :
    (percentage >= 4/9 && percentage < 5/9) ? 3 :
    (percentage >= 5/9 && percentage < 2/3) ? 4 :
    (percentage >= 2/3 && percentage < 7/9) ? 5 :
    (percentage >= 7/9 && percentage < 8/9) ? 6 :
    (percentage >= 8/9) ? 7 : 0
  )
}

export default _djRank;
