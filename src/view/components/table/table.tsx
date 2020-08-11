import * as React from 'react';

import { rivalScoreData,scoreData } from '@/types/data';
import { AAADifficulty, CLInt, CLBody } from '@/components/aaaDiff/data';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormLabel from '@material-ui/core/FormLabel';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button'
import Loader from '@/view/components/common/loader';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import AdsCard from '@/components/ad';

interface S {
  [key:string]:any,
  result:any,
  checks:number[],
  pm:number[],
  showChecks:boolean,
}

interface P{
  data:rivalScoreData[]|scoreData[]
}

const bgColor = (gap:number)=>{
  if(gap < -20){
    return "rgb(255, 49, 49)";
  }
  if(-15 > gap && gap >= -20){
    return "rgb(255, 78, 78)";
  }
  if(-10 > gap && gap >= -15){
    return "rgb(255, 140, 140)";
  }
  if(-5 > gap && gap >= -10){
    return "rgb(255, 180, 180)";
  }
  if(0 > gap && gap >= -5){
    return "rgb(255, 233, 153)";
  }
  if(0 <= gap && gap <= 5){
    return "#EAEFF9";
  }
  if(5 < gap && gap <= 10){
    return "#6C9BD2";
  }
  if(10 < gap && gap <= 15){
    return "#187FC4";
  }
  if(15 < gap && gap <= 20){
    return "#0068B7";
  }
  if(20 < gap && gap <= 30){
    return "#0062AC";
  }
  if(30 < gap && gap <= 40){
    return "#005293";
  }
  if(40 < gap && gap <= 50){
    return "#004077";
  }
  if(gap > 50){
    return "#003567";
  }
  return "rgb(255,255,255)";
}

class AAATable extends React.Component<P,S> {

  private default:number[] = [50,40,30,20,10,0,-10,-20];
  private defaultPM:number[] = [0,1,2]; //0:+ 1:-, 2:noplay

  constructor(props:P){
    super(props);
    this.state = {
      result:{},
      checks:this.default,
      pm:this.defaultPM,
      showChecks:false,
    }
  }

  async componentDidMount(){
    this.setState({result:await this.getTable()});
  }

  getTable = async()=>{
    const table = await AAADifficulty();
    const named = this.named();
    let result:CLInt = {};
    Object.keys(table).map((diffs:string)=>{
      result[diffs] = [];
      for(let i=0; i <table[diffs].length; ++i){
        const p = table[diffs][i];
        const diff = p["difficulty"];
        named[p["title"] + diff] && result[diffs].push({
          bpi:p["bpi"],
          title:p["title"],
          difficulty:diff,
          currentBPI:named[p["title"] + diff]["currentBPI"],
          exScore:named[p["title"] + diff]["exScore"]
        });
        !named[p["title"] + diff] && result[diffs].push({
          title:p["title"],
          difficulty:diff,
          bpi:p["bpi"],
          currentBPI:NaN,
          exScore:NaN
        });
      }
      return 0;
    });
    return result;
  }

  named = ()=>(this.props.data as any).filter((item:rivalScoreData|scoreData)=>item.difficultyLevel === "12").reduce((groups:{[key:string]:any},item:any)=>{
    groups[item.title + item.difficulty] = item;
    return groups;
  },{})

  isChecked = (input:number,target:number):boolean=>{
    const {checks,pm} = this.state;
    return (target === 0 ? checks : pm).indexOf(input) > -1;
  }

  handleChange = (input:number,target:number):void=>{
    const inputTarget = target === 0 ? "checks" : "pm";
    let newValue = this.state[inputTarget];
    if(this.isChecked(input,target)){
      newValue = newValue.filter(val=>val !== input);
    }else{
      newValue.push(input);
    }
    this.setState({[inputTarget]:newValue});
  }

  toggle = ():void=>{
    const {checks} = this.state;
    this.setState({checks:this.default.filter(item=>checks.indexOf(item) === -1)});
  }

  toggleChecks = ()=> this.setState({showChecks:!this.state.showChecks});

  render(){
    if(this.props.data.length === 0){
      return (<Loader/>);
    }
    const {result,checks,pm,showChecks} = this.state;
    return (
      <div>
        <Button variant="outlined" color="secondary" onClick={this.toggleChecks} style={{marginBottom:"15px"}}>
          フィルタ項目を{!showChecks ? "表示" : "非表示"}
        </Button>
        {showChecks && <div>
        <FormControl>
          <FormLabel component="legend" onClick={this.toggle} style={{cursor:"pointer"}}>難易度選択
            (<span style={{textDecoration:"underline"}}>ここをクリックで状態反転</span>)
          </FormLabel>
          <FormGroup row>
            {this.default.map((item:number)=><FormControlLabel key={item}
              control={
                <Checkbox checked={this.isChecked(item,0)} onChange={()=>this.handleChange(item,0)} value={item} />
              }
              label={item}/>
            )}
          </FormGroup>
        </FormControl>
        <FormControl>
          <FormLabel component="legend">正負選択
          </FormLabel>
          <FormGroup row>
            {this.defaultPM.map((item:number)=><FormControlLabel key={item}
              control={
                <Checkbox checked={this.isChecked(item,1)} onChange={()=>this.handleChange(item,1)} value={item} />
              }
              label={(item === 0 ? "+" : item === 1 ? "-" : "NOPLAY")}/>
            )}
          </FormGroup>
        </FormControl>
        </div>}
        <AdsCard/>
        {checks.sort((a,b)=>b-a).map((key:number)=>{
          if(!result[key]){
            return (null);
          }
          return (
            <div key={key}>
              <div style={{width:"100%",textAlign:"center",background:"#eaeaea",color:"#000",padding:"5px 0",border:"1px solid #ccc",margin:"15px 0 5px 0"}}>{key}</div>
              <Grid container>
                {result[key].map((item:CLBody)=><GridItem key={item.title + item.difficulty} data={item} pm={pm}/>)}
              </Grid>
            </div>
          )
        })}
        <Divider style={{margin:"15px 0"}}/>
        <Alert severity="info">
          <AlertTitle>色分けについて</AlertTitle>
          <p>AAA-BPIとユーザーのBPIの差を基準に色付けしています</p>
          <p>
            -20未満:<span style={{color:bgColor(-31)}}>濃い赤</span><br/>
            -20以上:<span style={{color:bgColor(-19)}}>更に濃いオレンジ</span><br/>
            -15以上:<span style={{color:bgColor(-14)}}>濃いオレンジ</span><br/>
            -10以上:<span style={{color:bgColor(-9)}}>薄いピンク</span><br/>
            -5以上0未満:<span style={{color:bgColor(-1)}}>黄色</span><br/>
            0以上+5以下:<span style={{color:bgColor(1)}}>薄い緑</span><br/>
            +10以下:<span style={{color:bgColor(6)}}>濃い緑</span><br/>
            +15以下:<span style={{color:bgColor(14)}}>濃い緑</span><br/>
            +20以下:<span style={{color:bgColor(15)}}>薄水色</span><br/>
            +30以下:<span style={{color:bgColor(25)}}>濃い薄水色</span><br/>
            +40以下:<span style={{color:bgColor(35)}}>更に濃い薄水色</span><br/>
            +50以下:<span style={{color:bgColor(45)}}>薄い青</span><br/>
            +50より上:<span style={{color:bgColor(51)}}>青</span><br/>
          </p>
          <p>*AAA-BPIは改変定義式基準で算出されています</p>
        </Alert>
      </div>
    );
  }
}

export default AAATable;

class GridItem extends React.Component<{data:CLBody,pm:number[]},{}>{

  render(){
    const {data,pm} = this.props;
    const current = Number.isNaN(data.currentBPI) ? -15 : data.currentBPI;
    const gap = current - data.bpi;
    if(pm.indexOf(2) === -1 && Number.isNaN(data.currentBPI)){
      return (null);
    }
    if((pm.indexOf(0) === -1 && gap >= 0) || (pm.indexOf(1) === -1 && (gap < 0 && !Number.isNaN(data.currentBPI)))){
      return (null);
    }
    return(
      <Grid item xs={12} sm={4} md={4} lg={4} style={{textAlign:"center",padding:"15px 0",background:!Number.isNaN(data.currentBPI) ? bgColor(gap) : "#fff",textShadow:current >= 100 ? "0px 0px 4px #fff" :"0px 0px 0px",color:current >= 100 ? "#fff" :"#000"}}>
        <Grid item xs={12} sm={12} md={12} lg={12}>
        {data.title}{data.difficulty === "leggendaria" && "(†)"}{data.difficulty === "hyper" && "(H)"}
        </Grid>
        <Grid container>
          <Grid item xs={6} sm={6} md={6} lg={6}>
            {data.bpi}
          </Grid>
          <Grid item xs={6} sm={6} md={6} lg={6}>
            {current}
          </Grid>
        </Grid>
      </Grid>
    )
  }
}
