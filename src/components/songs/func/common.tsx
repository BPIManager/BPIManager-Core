
export class songFuncCommon{

  evaluateVersion = (song:string,v:number[]):boolean=>{
    const songVer = song.split("/")[0];
    if(songVer === "s"){
      return v.indexOf(1.5) > -1;
    }
    return v.indexOf(Number(songVer)) > -1;
  }

  evaluateClearType = (clearType:number,c:number[]):boolean=>{
    return c.indexOf(clearType) > -1;
  }

}
