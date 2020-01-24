import * as React from 'react';

import { rivalScoreData } from '../../../types/data';
import { AAADifficulty, CLInt, CLBody } from '../../../components/aaaDiff/data';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';

interface S {
  result:any,
}

interface P{
  data:rivalScoreData[]
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

  constructor(props:P){
    super(props);
    this.state = {
      result:{},
    }
  }

  componentDidMount(){
    this.setState({result:this.getTable()});
  }

  private ObjectKey = ["50+","45","40","35","30","25","20","15","10","5","0","-5","-10"]

  getTable = ()=>{
    const table = AAADifficulty;
    const named = this.named();
    let result:CLInt = {};
    Object.keys(table).map((diffs:string)=>{
      result[diffs] = [];
      for(let i=0; i <table[diffs].length; ++i){
        const p = table[diffs][i];
        const diff = p["difficulty"];
        named[p["title"] + diff] && result[diffs].push(Object.assign(named[p["title"] + diff],{
          objectiveBPI:p["bpi"],
        }));
        !named[p["title"] + diff] && result[diffs].push({
          title:p["title"],
          difficulty:diff,
          objectiveBPI:p["bpi"],
          bpi:0,
        });
      }
    });
    return result;
  }

  named = ()=>this.props.data.filter((item:rivalScoreData)=>item.difficultyLevel === "12").reduce((groups:{[key:string]:any},item:any)=>{
    groups[item.title + item.difficulty] = item;
    return groups;
  },{})

  render(){
    if(this.props.data.length === 0){
      return (
        <Container className="loaderCentered">
          <CircularProgress />
        </Container>);
    }
    const {result} = this.state;
    return (
      <div>
        {this.ObjectKey.map((key:string)=>{
          if(!result[key]){
            return (null);
          }
          return (
            <div key={key}>
              <div style={{width:"100%",textAlign:"center",background:"#eaeaea",color:"#000",padding:"5px 0",border:"1px solid #ccc",margin:"15px 0 5px 0"}}>{key}</div>
              <Grid container>
                {result[key].map((item:CLBody)=><GridItem key={item.title + item.difficulty} data={item}/>)}
              </Grid>
            </div>
          )
        })}
        <Divider style={{margin:"15px 0"}}/>
        <p>色分けについて</p>
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
      </div>
    );
  }
}

export default AAATable;

class GridItem extends React.Component<{data:any},{}>{

  render(){
    const {data} = this.props;
    const gap = data.currentBPI - data.objectiveBPI;
    const current = data.currentBPI || -15;
    return(
      <Grid item xs={12} sm={4} md={4} lg={4} style={{textAlign:"center",padding:"15px 0",background:bgColor(gap),textShadow:current >= 100 ? "0px 0px 4px #fff" :"0px 0px 0px",color:current >= 100 ? "#fff" :"#000"}}>
        <Grid item xs={12} sm={12} md={12} lg={12}>
        {data.title}{data.difficulty === "leggendaria" && "(†)"}{data.difficulty === "hyper" && "(H)"}
        </Grid>
        <Grid container xs={12} sm={12} md={12} lg={12}>
          <Grid item xs={6}>
            {data.objectiveBPI}
          </Grid>
          <Grid item xs={6}>
            {current}
          </Grid>
        </Grid>
      </Grid>
    )
  }
}
