import * as React from 'react';
import { loader } from '../../../components/rivals/letters';
import FilterByLevelAndDiff from '../common/selector';
import LettersTable from './viewComponents/letters/table';
import SongsFilter, {  B } from '../songs/common/filter';
import { verArr, bpmFilter } from '../songs/common';
import FilterListIcon from '@material-ui/icons/FilterList';
import BackspaceIcon from "@material-ui/icons/Backspace";
import { difficultyDiscriminator } from '../../../components/songs/filter';
import { songsDB } from '../../../components/indexedDB';
import { commonFunc } from '../../../components/common';
import { songData } from '../../../types/data';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import { FormattedMessage } from 'react-intl';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import { _isSingle } from '../../../components/settings';
import Container from '@material-ui/core/Container';
import OrderControl from "../songs/common/orders";

interface P{

}

interface stateInt {
  isLoading:boolean,
  filterByName:string,
  allSongsData:any,
  scoreData:any,
  full:any,
  options:{[key:string]:string[]},
  page:number,
  filterOpen:boolean,
  bpm:B,
  orderTitle:number,
  orderMode:number,
  versions:number[]
}

class RivalChallengeLetters extends React.Component<P,stateInt> {

  constructor(props:P){
    super(props);
    this.state = {
      isLoading:true,
      filterByName:"",
      scoreData:[],
      allSongsData:[],
      full:[],
      orderTitle:0,
      orderMode:1,
      options:{
        level:["11","12"],
        difficulty:["0","1","2"],
      },
      bpm:{
        noSoflan:true,
        min:"",
        max:"",
        soflan:true,
      },
      page:0,
      filterOpen:false,
      versions:verArr()
    }
  }

  async componentDidMount(){
    let allSongs:{[key:string]:songData} = {};
    const l = await loader();
    const allSongsRawData = await new songsDB().getAll(_isSingle());
    for(let i =0; i < allSongsRawData.length; ++i){
      const prefix:string = difficultyDiscriminator(allSongsRawData[i]["difficulty"]);
      allSongs[allSongsRawData[i]["title"] + prefix] = allSongsRawData[i];
    }
    this.setState({
      allSongsData:l,
      scoreData:l,
      full:allSongs,
      isLoading:false,
    });
  }

  handleChange = (name:string,target:string) => (e:React.ChangeEvent<HTMLInputElement>) =>{
    this.handleExec(name,e.target.checked,target);
  }

  handleExec = (name:string,checked:boolean,target:string)=>{
    let newState = this.state;
    if(checked){
      newState["options"][target].push(name);
    }else{
      newState["options"][target] = newState["options"][target].filter((t:string)=> t !== name);
    }
    return this.setState({scoreData:this.songFilter(newState),options:newState["options"],page:0});
  }

  songFilter = (newState:stateInt = this.state) =>{
    const diffs:string[] = ["hyper","another","leggendaria"];
    const b = newState.bpm;
    const v = newState.versions;
    const f = this.state.full;

    const evaluateVersion = (song:string):boolean=>{
      const songVer = song.split("/")[0];
      if(songVer === "s"){
        return v.indexOf(1.5) > -1;
      }
      return v.indexOf(Number(songVer)) > -1;
    }

    if(Object.keys(this.state.allSongsData).length === 0) return [];
    return this.state.allSongsData.filter((data:any)=>{
      const _f = f[data.title + data.difficulty];
      if(!_f){return false;}
      return (
        bpmFilter(_f.bpm,b) &&
        evaluateVersion(_f.textage) &&
        newState["options"]["level"].some((item:string)=>{
          return item === data.difficultyLevel }) &&
        newState["options"]["difficulty"].some((item:string)=>{
          return diffs[Number(item)] === data.difficulty} ) &&
        data.title.toLowerCase().indexOf(newState["filterByName"].toLowerCase()) > -1
      )
    })
  }

  handleToggleFilterScreen = ()=> this.setState({filterOpen:!this.state.filterOpen});

  handleChangePage = (newPage:number):void => this.setState({page:newPage});

  applyFilter = (state:{bpm:B,versions:number[]}):void=>{
    let newState = this.clone();
    newState.bpm = state.bpm;
    newState.versions = state.versions;
    return this.setState({scoreData:this.songFilter(newState),bpm:state.bpm,versions:state.versions,page:0});
  }

  clone = ()=>{
    return new commonFunc().set(this.state).clone();
  }

  handleInputChange = (e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>|null)=>{
    let newState = this.clone();
    newState.filterByName = e ? e.target.value : "";
    return this.setState({scoreData:this.songFilter(newState),filterByName:newState.filterByName,page:0});
  }

  sortedData = ():any[]=>{
    const {orderMode,orderTitle,scoreData} = this.state;
    let sortedData:any[] = scoreData.sort((a:any,b:any)=>{
      switch(orderTitle){
        case 4:
        return Number(a.difficultyLevel) - Number(b.difficultyLevel);
        case 3:
        return a.title.localeCompare(b.title, "ja", {numeric:true});
        case 1:
          return a.win - b.win;
        case 2:
          return a.lose - b.lose;
        case 0:
        default:
          return a.win - b.win;
      }
    });
    if(orderTitle === 0){
      sortedData = scoreData.sort((a:any,b:any)=>{
        return Number(a.rate) - Number(b.rate);
      })
    }
    return orderMode === 0 ? sortedData : sortedData.reverse();
  }

  handleOrderTitleChange = (event:React.ChangeEvent<{name?:string|undefined; value:unknown;}>):void =>{
    const val = event.target.value;
    if (typeof val !== "number") { return; }
    return this.setState({orderTitle:val,page:0});
  }

  handleOrderModeChange = (event:React.ChangeEvent<{name?:string|undefined; value:unknown;}>):void =>{
    const val = event.target.value;
    if (typeof val !== "number") { return; }
    return this.setState({orderMode:val,page:0});
  }

  render(){
    const {isLoading,options,page,full,filterOpen,versions,filterByName,orderMode,orderTitle} = this.state;
    const orders = [
      "勝率",
      "勝利数",
      "敗北数",
      "曲名",
      "レベル",
    ];
    return (
      <Container fixed className="innerContainer">
        <Grid container spacing={1} style={{margin:"5px 0"}}>
          <Grid item xs={10}>
            <FormControl component="fieldset" style={{width:"100%"}}>
            <InputLabel><FormattedMessage id="Songs.filterByName"/></InputLabel>
              <Input
                style={{width:"100%"}}
                placeholder={"(ex.)255"}
                value={filterByName}
                onChange={this.handleInputChange}
                endAdornment={
                  filterByName &&
                  <InputAdornment position="end">
                    <IconButton onClick={()=>this.handleInputChange(null)}>
                      <BackspaceIcon/>
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>
          </Grid>
          <Grid item xs={2}>
            <Button
              className="filterButton"
              fullWidth
              onClick={this.handleToggleFilterScreen} variant="outlined" color="primary"
              style={{marginRight:"10px",padding:"5px 6px",height:"100%",minWidth:"auto"}}>
              <FilterListIcon/>
            </Button>
          </Grid>
        </Grid>
        <OrderControl
          orderTitles={orders}
          orderMode={orderMode} orderTitle={orderTitle} handleOrderModeChange={this.handleOrderModeChange} handleOrderTitleChange={this.handleOrderTitleChange}/>
        <FilterByLevelAndDiff options={options} handleChange={this.handleChange}/>

        <LettersTable full={full}
          page={page} handleChangePage={this.handleChangePage}
          data={this.sortedData()} isLoading={isLoading}/>
        {filterOpen && <SongsFilter versions={versions} handleToggle={this.handleToggleFilterScreen} applyFilter={this.applyFilter} bpm={this.state.bpm}/>}
      </Container>
    );
  }
}

export default RivalChallengeLetters;
