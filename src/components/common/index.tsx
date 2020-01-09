export const commonFunc = class{

  private s:any;

  set = (s:any):this=>{
    this.s = s;
    return this;
  }

  clone = () => JSON.parse(JSON.stringify(this.s));
}
