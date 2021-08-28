import * as React from 'react';

import { rivalScoreData } from '@/types/data';
import { CLBody, named, getTable } from '@/components/aaaDiff/data';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import Loader from '@/view/components/common/loader';
import AdsCard from '@/components/ad';
import SpeedDialIcon from '@material-ui/lab/SpeedDialIcon/SpeedDialIcon';
import SpeedDial from '@material-ui/lab/SpeedDial';
import SpeedDialAction from '@material-ui/lab/SpeedDialAction/SpeedDialAction';
import FilterListIcon from '@material-ui/icons/FilterList';
import HelpIcon from '@material-ui/icons/Help';
import MenuIcon from '@material-ui/icons/Menu';
import CloseIcon from '@material-ui/icons/Close';
import { AAATableExampleModal } from '../AAATable/example';
import { AAATableFilterModal } from '../AAATable/filter';
import { _prefix } from '@/components/songs/filter';
import { _currentTheme } from '@/components/settings';

interface S {
  [key:string]:any,
  result:any,
  checks:number[],
  pm:number[],
  targetLevel:number,
  isLoading:boolean,
  dialOpen:boolean,
  isOpenExampleModal:boolean,
  isOpenFilterModal:boolean
}

interface P{
  data?:rivalScoreData[]
}

export const AAATableBgColor = (gap:number)=>{
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
      targetLevel:12,
      checks:this.default,
      pm:this.defaultPM,
      isLoading:true,
      dialOpen:false,
      isOpenFilterModal:false,
      isOpenExampleModal:false
    }
  }

  async componentDidMount(){
    const _named = await named(12,this.props.data);
    this.setState({result:await getTable(12,_named),isLoading:false});
  }

  changeLevel = async (e:React.ChangeEvent<HTMLInputElement>,)=>{
    if(typeof e.target.value === "string"){
      const targetLevel = Number(e.target.value);
      const _named = await named(targetLevel,this.props.data);
      this.setState({targetLevel:targetLevel,isLoading:true});
      return this.setState({result:await getTable(targetLevel,_named),isLoading:false});
    }
  }

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

  toggleDial = ()=> this.setState({dialOpen:!this.state.dialOpen});

  handleFilterModal = ()=>this.setState({isOpenFilterModal:!this.state.isOpenFilterModal})
  handleExampleModal = ()=>this.setState({isOpenExampleModal:!this.state.isOpenExampleModal})

  render(){
    const {result,checks,pm,targetLevel,isLoading,dialOpen,isOpenFilterModal,isOpenExampleModal} = this.state;
    const actions = [
      { icon:  <FilterListIcon/>, name: 'フィルタ', onClick: ()=>this.handleFilterModal()},
      { icon: <HelpIcon />, name: 'AAA達成表とは?', onClick: ()=>this.handleExampleModal()},
    ];

    return (
      <React.Fragment>
        {isLoading && <Loader/>}
        <AdsCard/>

        {!isLoading && checks.sort((a,b)=>b-a).map((key:number)=>{
          if(!result[key] || result[key].length === 0){
            return (null);
          }
          return (
            <div key={key}>
              <div style={{width:"100%",textAlign:"center",background:"#eaeaea",color:"#000",padding:"5px 0",margin:"15px 0 5px 0"}}>{key}</div>
              <Grid container>
                {result[key].map((item:CLBody)=><GridItem key={item.title + item.difficulty} data={item} pm={pm}/>)}
              </Grid>
            </div>
          )
        })}
        <Divider style={{margin:"15px 0"}}/>
        <SpeedDial
          ariaLabel="menu"
          style={{position:"fixed",bottom:"8%",right:"8%"}}
          icon={<SpeedDialIcon icon={<MenuIcon/>} openIcon={<CloseIcon/>} />}
          onClose={this.toggleDial}
          onOpen={this.toggleDial}
          open={dialOpen}
          direction={"up"}
        >
          {actions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              tooltipOpen
              onClick={action.onClick}
            />
          ))}
        </SpeedDial>
        {isOpenExampleModal && <AAATableExampleModal closeModal={this.handleExampleModal}/>}
        {isOpenFilterModal && <AAATableFilterModal
          closeModal={this.handleFilterModal} isChecked={this.isChecked} targetLevel={targetLevel} changeLevel={this.changeLevel} toggle={this.toggle}
          defaultPM={this.defaultPM} _default={this.default} result={result} handleChange={this.handleChange}
        />}
      </React.Fragment>
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
      <Grid className="AAATableGridItems" item xs={6} sm={4} md={4} lg={4} style={{
        textAlign:"center",padding:"15px 0",
        background:!Number.isNaN(data.currentBPI) ? AAATableBgColor(gap) : "#fff",
        textShadow:current >= 100 ? "0px 0px 4px #fff" :"0px 0px 0px",
        color:current >= 100 ? "#fff" :"#000",
        border:"1px solid " + (_currentTheme() === "light" ? "#fff" : "#222"),
      }}>
        <Grid item xs={12} sm={12} md={12} lg={12}>
        {data.title}{_prefix(data.difficulty)}
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
