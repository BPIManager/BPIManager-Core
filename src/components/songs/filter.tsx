export const lampArray:string[] = [
  "FAILED","ASSIST","EASY","CLEAR","HARD","EX-HARD","FULLCOMBO"
];
export const lampCSVArray:string[] = [
  "FAILED","ASSIST CLEAR","EASY CLEAR","CLEAR","HARD CLEAR","EX HARD CLEAR","FULLCOMBO CLEAR"
];

export const convertClearState = (original:string|number,direction:number):string|number=>{
  if(direction === 0){
    // csv to num
    if(typeof original !== "string"){return 0;}
    return lampCSVArray.indexOf(original);
  }else{
    if(typeof original !== "number"){return 1;}
    return lampArray[original];
  }
}

export const _prefix = (diff:string):string=> diff === "hyper" ? "(H)" : diff === "leggendaria" ? "(†)" : "";

export const _prefixFromNum = (difficulty:string):string=>{
  let prefix:string = "";
  if(difficulty === "3" || difficulty === "8"){
    prefix = "(H)";
  }
  if(difficulty === "10" || difficulty === "11"){
    prefix = "(†)";
  }
  return prefix;
}
