export const lampArray:string[] = [
  "FAILED","ASSIST","EASY","CLEAR","HARD","EX-HARD","FULLCOMBO","UNKNOWN"
];
export const lampCSVArray:string[] = [
  "FAILED","ASSIST CLEAR","EASY CLEAR","CLEAR","HARD CLEAR","EX HARD CLEAR","FULLCOMBO CLEAR"
];
export const simpleLampArray:string[] = [
  "F","AC","EC","CL","HC","EXH","FC","NONE"
];

export const djRankArray:string[] = [
  "F","E","D","C","B","A","AA","AAA"
]

export const convertClearState = (original:string|number,direction:number,simple:boolean = false):string|number=>{
  if(direction === 0){
    // csv to num
    if(typeof original !== "string"){return 0;}
    return lampCSVArray.indexOf(original);
  }else{
    if(typeof original !== "number"){return 1;}
    return simple ? simpleLampArray[original] : lampCSVArray[original];
  }
}

export const _prefix = (diff:string):string=> diff === "hyper" ? "(H)" : diff === "leggendaria" ? "(†)" : "";
export const _prefixFull = (diff:string):string=> diff === "hyper" ? "H" : diff === "leggendaria" ? "L" : "A";

export const _prefixFromNum = (difficulty:string,showAnother:boolean = false):string=>{
  let prefix:string = showAnother ? "(A)" : "";
  if(difficulty === "3" || difficulty === "8"){
    prefix = "(H)";
  }
  if(difficulty === "10" || difficulty === "11"){
    prefix = "(†)";
  }
  return prefix;
}

//difficulty number to string
export const difficultyDiscriminator = (difficulty:string):string=>{
  let diff:string = "another";
  if(difficulty === "3" || difficulty === "8"){
    diff = "hyper";
  }
  if(difficulty === "10" || difficulty === "11"){
    diff = "leggendaria";
  }
  return diff;
}

//difficulty String to number
export const difficultyParser = (difficulty: string,isSingle: number):string=>{
  if(difficulty === "another"){
    if(isSingle === 1){
      return "4";
    }else{
      return "9";
    }
  }else if(difficulty === "hyper"){
    if(isSingle === 1){
      return "3";
    }else{
      return "8";
    }
  }else if(difficulty === "leggendaria"){
    if(isSingle === 1){
      return "10";
    }else{
      return "11";
    }
  }
  return "4";
}

//IIDXinfoリンク用
export const getSongSuffixForIIDXInfo = (name:string,difficulty:string):string=>{
  if(difficulty === "3" || difficulty === "8"){
    return "[H]";
  }
  if(difficulty === "4" || difficulty === "9"){
    return "[A]";
  }
  if(difficulty === "10" || difficulty === "11"){
    switch(name){
      default:
        return "†[A]";
      case "Ancient Scapes":
      case "Close the World feat.a☆ru":
      case "Feel The Beat":
      case "invoker":
      case "Sigmund":
      case "Verflucht":
      case "疾風迅雷":
        return "†LEGGENDARIA[A]";
    }
  }
  return "";
}

// Rootage規格→HV規格への変換
export const convertLeggendariaStates = (name:string,difficulty:string):{name:string,difficulty:string}=>{
  const leggendariaSongs:string[] = [
    "ABSOLUTE†",
    "Clione†",
    "RED ZONE†",
    "spiral galaxy†",
    "Little Little Princess†",
    "CONTRACT†",
    "waxing and wanding†",
    "KAMAITACHI†",
    "VANESSA†",
    "Blue Rain†",
    "ICARUS†",
    "THE DEEP STRIKER†",
    "Übertreffen†",
    "Kung-fu Empire†",
    "naughty girl@Queen's Palace†",
    "THANK YOU FOR PLAYING†",
    "凛として咲く花の如く†",
    "SOLID STATE SQUAD†",
    "Golden Palms†",
    "QUANTUM TELEPORTATION†",
    "Howling†",
    "LUV CAN SAVE U†",
    "朧†",
    "仮想空間の旅人たち†",
    "龍と少女とデコヒーレンス†",
    "Ancient Scapes†LEGGENDARIA",
    "Close the World feat.a☆ru†LEGGENDARIA",
    "Feel The Beat†LEGGENDARIA",
    "invoker†LEGGENDARIA",
    "Sigmund†LEGGENDARIA",
    "Verflucht†LEGGENDARIA",
    "疾風迅雷†LEGGENDARIA",
    "廿†",
    "Beat Radiance†",
    "CHRONO DIVER -NORNIR-†",
    "Cosmic Cat†",
    "EBORY & IVORY†",
    "恋は白帯、サンシロー†",
    "超青少年ノ為ノ超多幸ナ超古典的超舞曲†",
    "Damage Per Second†",
    "STARLIGHT DANCEHALL†",
    "Amazing Mirage†",
    "冬椿 ft. Kanae Asaba†",
    "Wanna Party?†",
    "AIR RAID FROM THA UNDAGROUND†",
    "Twelfth Style†",
    "B4U(BEMANI FOR YOU MIX)†",
    "Welcome†",
    "GRID KNIGHT†",
    "RUGGED ASH†",
    "Ubertreffen†",
    "EBONY & IVORY†",
    "KAISER PHOENIX†",
  ]
  let newName = name,newDifficulty = difficulty;
  if(difficulty === "another" && leggendariaSongs.indexOf(name) > -1){
    newName = name.replace("†LEGGENDARIA","").replace("†","");
    newDifficulty = "leggendaria";
  }
  return {
    name:newName,
    difficulty:newDifficulty
  }
}
