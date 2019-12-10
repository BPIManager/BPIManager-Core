import * as React from 'react';
import { scoresDB, songsDB } from '../../components/indexedDB';
import {_isSingle, _goalBPI, _goalPercentage} from "../../components/settings";
import Container from "@material-ui/core/Container";
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import Typography from "@material-ui/core/Typography";
import { FormattedMessage } from "react-intl";
import CompareTable from "../components/compare/table";
import bpiCalcuator from '../../components/bpi';

interface S {
  isLoading:boolean,
  full:any[],
  filtered:any[],
  sort:number,
  isDesc:boolean,
  options:{[key:string]:string[]},
  filterByName:string,
  compareFrom:string,
  compareTo:string,
  page:number,
  rowsPerPage:number,
  displayMode:string,
}

export default class Compare extends React.Component<{},S> {
  _mounted: boolean = false;

  constructor(props:Object){
    super(props);
    this.state ={
      isLoading:true,
      full:[],
      filtered:[],
      sort:4,
      isDesc:false,
      options:{
        level:["11","12"],
        difficulty:["0","1","2"],
        pm:["+","-"],
      },
      filterByName:"",
      compareFrom:"27",
      compareTo:"26",
      page:0,
      rowsPerPage:10,
      displayMode:"exScore",
    }
  }

  async componentDidMount(){
    this._mounted = true;
    this.dataHandler();
  }

  componentWillUnmount(){
    this._mounted = false;
  }

  handleLevelChange = (name:string) => (e:React.ChangeEvent<HTMLInputElement>) =>{
    this.handleExec(name,e.target.checked,"level");
  }

  handleDiffChange = (name:string) => (e:React.ChangeEvent<HTMLInputElement>) =>{
    this.handleExec(name,e.target.checked,"difficulty");
  }

  handlePMChange = (name:string) => (e:React.ChangeEvent<HTMLInputElement>) =>{
    this.handleExec(name,e.target.checked,"pm");
  }

  handleExec = (name:string,checked:boolean,target:string)=>{
    let newState:S = this.state;
    if(checked){
      newState["options"][target].push(name);
    }else{
      newState["options"][target] = newState["options"][target].filter((t:string)=> t !== name);
    }
    this.setState({options:newState["options"],page:0});
    return this.filter();
  }

  changeSort = (newNum:number):void=>{
    const {sort,isDesc} = this.state;
    if(sort === newNum){
      return this.setState({isDesc:!isDesc});
    }
    this.setState({sort:newNum,isDesc:true});
  }

  handleCompareFromChange = async (event:React.ChangeEvent<{name?:string|undefined; value:unknown;}>):Promise<void> =>{
    if (typeof event.target.value !== "string") { return; }
    let newState = this.cloneState();
    newState.compareFrom = event.target.value;
    this.setState({compareFrom:event.target.value,isLoading:true,page:0});
    return this.dataHandler(newState);
  }

  handleCompareToChange = async (event:React.ChangeEvent<{name?:string|undefined; value:unknown;}>):Promise<void> =>{
    if (typeof event.target.value !== "string") { return; }
    let newState = this.cloneState();
    newState.compareTo = event.target.value;
    this.setState({compareTo:event.target.value,isLoading:true,page:0});
    return this.dataHandler(newState);
  }

  handleDisplayModeChange = (event:React.ChangeEvent<{name?:string|undefined; value:unknown;}>):Promise<void> =>{
    let newState = this.cloneState();
    newState.displayMode = event.target.value;
    this.setState({displayMode:event.target.value as string,isLoading:true,page:0});
    return this.dataHandler(newState);
  }

  filter = ():any[]=>{
    const {options,full} = this.state;
    const diffs:string[] = ["hyper","another","leggendaria"];
    return full.filter((data)=>
        options["level"].some((item:string)=>item === data.difficultyLevel) &&
        options["difficulty"].some((item:string)=>diffs[Number(item)] === data.difficulty )
    )
  }

  async dataHandler(newState:any = this.state):Promise<void>{
    let result:any[] = [];
    const f = newState.compareFrom;
    const t = newState.compareTo;
    const isSingle = _isSingle();
    const scores = new scoresDB(isSingle,f);
    const sdb = new songsDB();
    const calc = new bpiCalcuator();
    const fData = await scores.getSpecificVersionAll();
    const goalBPI = _goalBPI(), goalPerc = _goalPercentage();
    const displayMode = this.state.displayMode;
    for(let i =0; i < fData.length; ++i){
      let tScore = 0;
      const tData = await scores.getItem(fData[i]["title"],fData[i]["difficulty"],t,isSingle);
      const songData = isSingle ?
      await sdb.getOneItemIsSingle(fData[i]["title"],fData[i]["difficulty"]) :
      await sdb.getOneItemIsDouble(fData[i]["title"],fData[i]["difficulty"]);
      const max = songData[0]["notes"] * 2;
      calc.setData(songData[0]["notes"] * 2,songData[0]["avg"],songData[0]["wr"]);
      calc.setCoef(songData[0]["coef"] || -1);
      const percentager = (exScore:number):number =>{
        return Math.ceil(exScore / max * 10000) / 100;
      }
      if(!tData || tData.length === 0){
        if (t !== "BPI" && t !== "PERCENTAGE" && t !== "WR" && t !== "AVERAGE") continue;
        tScore = 0;
      }else{
        tScore = displayMode === "exScore" ? tData[0]["exScore"] :
        displayMode === "bpi" ? calc.setPropData(songData[0],tData[0]["exScore"],isSingle) :
        displayMode === "percentage" ? percentager(tData[0]["exScore"]) : 0;
      }
      if(t === "WR"){
        tScore = displayMode === "exScore" ? songData[0]["wr"] :
        displayMode === "bpi" ? 100 :
        displayMode === "percentage" ? percentager(songData[0]["wr"]) : 0;
      }
      if(t === "AVERAGE"){
        tScore = displayMode === "exScore" ? songData[0]["avg"] :
        displayMode === "bpi" ? 0 :
        displayMode === "percentage" ? percentager(songData[0]["avg"]) : 0;
      }
      if(t === "BPI"){
        tScore = displayMode === "exScore" ? calc.calcFromBPI(goalBPI,true) :
        displayMode === "bpi" ? goalBPI :
        displayMode === "percentage" ? percentager(calc.calcFromBPI(goalBPI,true)) : 0;
      }
      if(t === "PERCENTAGE"){
        tScore = displayMode === "exScore" ? Math.ceil(songData[0]["notes"] * 2 * goalPerc / 100) :
        displayMode === "bpi" ? calc.setPropData(songData[0],Math.ceil(songData[0]["notes"] * 2 * goalPerc / 100),isSingle) :
        displayMode === "percentage" ? goalPerc : 0;
      }
      const percentage = percentager(fData[i]["exScore"]);
      const gap = (Math.ceil(
        displayMode === "exScore" ? (fData[i]["exScore"] - tScore) * 10000 :
        displayMode === "bpi" ? (fData[i]["currentBPI"] - tScore) * 10000 :
        displayMode === "percentage" ? (percentage - tScore)  * 10000 : 0
      ) / 10000)
      result.push({
        title:fData[i]["title"],
        songData: songData[0],
        scoreData: fData[i],
        difficulty:fData[i]["difficulty"],
        difficultyLevel:fData[i]["difficultyLevel"],
        exScore:displayMode === "exScore" ? fData[i]["exScore"] : percentage,
        compareData:tScore,
        gap: (displayMode === "bpi" || displayMode === "percentage") ? gap.toFixed(2) : gap
      });
    }
    if(!this._mounted){return;}
    return this.setState({full:result,isLoading:false});
  }

  sortedData = ():any[]=>{
    const {isDesc,sort} = this.state;
    const sortedData:any[] = this.filter().sort((a,b)=>{
      switch(sort){
        case 0:
        return Number(b.difficultyLevel) - Number(a.difficultyLevel);
        case 1:
        return b.title.localeCompare(a.title, "ja", {numeric:true});
        default:
        case 2:
          return this.state.displayMode !== "bpi" ? b.exScore - a.exScore : b.scoreData.currentBPI - a.scoreData.currentBPI;
        case 3:
          return b.compareData - a.compareData;
        case 4:
          return b.gap - a.gap;
      }
    }).filter((t:any)=>{
      const pm:string[] = this.state.options.pm;
      if(pm.indexOf("+") === -1 && pm.indexOf("-") > -1){
        return t.gap <= 0;
      }
      if(pm.indexOf("+") > -1 && pm.indexOf("-") === -1){
        return t.gap > 0;
      }
      return pm.indexOf("+") > -1 && pm.indexOf("-") > -1 ? true : false;
    });
    return isDesc ? sortedData.reverse() : sortedData;
  }

  cloneState = () => JSON.parse(JSON.stringify(this.state))

  handleChangePage = (newPage:number):void => this.setState({page:newPage});

  handleChangeRowsPerPage = (value:string):void => this.setState({page:0,rowsPerPage:+value});

  render(){
    const {compareFrom,compareTo,displayMode,isLoading,page,rowsPerPage,options,sort,isDesc} = this.state;
    if(!this.state.full){
      return (null);
    }
    return (
      <Container className="commonLayout" fixed  id="songsVil">
        <Typography component="h5" variant="h5" color="textPrimary" gutterBottom>
          <FormattedMessage id="Compare.Title"/>
        </Typography>
        <Grid container spacing={1} style={{margin:"5px 0"}}>
          <Grid item xs={6}>
            <FormControl style={{width:"100%"}}>
              <InputLabel><FormattedMessage id="Compare.From"/></InputLabel>
              <Select value={compareFrom} onChange={this.handleCompareFromChange}>
                <MenuItem value={"26"}>26 Rootage</MenuItem>
                <MenuItem value={"27"}>27 HEROIC VERSE</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl style={{width:"100%"}}>
              <InputLabel><FormattedMessage id="Compare.To"/></InputLabel>
              <Select value={compareTo} onChange={this.handleCompareToChange}>
                <MenuItem value={"26"}>26 Rootage</MenuItem>
                <MenuItem value={"27"}>27 HEROIC VERSE</MenuItem>
                <MenuItem value={"WR"}>WORLD RECORD</MenuItem>
                <MenuItem value={"AVERAGE"}>KAIDEN AVERAGE</MenuItem>
                <MenuItem value={"BPI"}>TARGET BPI</MenuItem>
                <MenuItem value={"PERCENTAGE"}>TARGET PERCENTAGE</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Grid container spacing={1} style={{margin:"5px 0"}}>
          <Grid item xs={12}>
            <FormControl style={{width:"100%"}}>
              <InputLabel><FormattedMessage id="Compare.Display"/></InputLabel>
              <Select value={displayMode} onChange={this.handleDisplayModeChange}>
                <MenuItem value={"exScore"}>EXスコア</MenuItem>
                <MenuItem value={"bpi"}>BPI</MenuItem>
                <MenuItem value={"percentage"}>パーセンテージ</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Grid container spacing={1} id="mainFilters" style={{margin:"5px 0"}}>
          <Grid item xs={4}>
            <FormControl component="fieldset">
              <FormLabel component="legend"><FormattedMessage id="Songs.filterByLevel"/></FormLabel>
              <FormGroup row>
                <FormControlLabel
                  control={<Checkbox checked={options.level.some(t=> t === "11")} onChange={this.handleLevelChange("11")} value="11" />}
                  label="☆11"
                />
                <FormControlLabel
                  control={<Checkbox checked={options.level.some(t=> t === "12")} onChange={this.handleLevelChange("12")} value="12" />}
                  label="☆12"
                />
              </FormGroup>
            </FormControl>
          </Grid>
          <Grid item xs={5}>
            <FormControl component="fieldset">
              <FormLabel component="legend"><FormattedMessage id="Songs.filterByDifficulty"/></FormLabel>
              <FormGroup row>
                <FormControlLabel
                  control={<Checkbox checked={options.difficulty.some(t=> t === "0")} onChange={this.handleDiffChange("0")} value="hyper" />}
                  label="H"
                />
                <FormControlLabel
                  control={<Checkbox checked={options.difficulty.some(t=> t === "1")} onChange={this.handleDiffChange("1")} value="another" />}
                  label="A"
                />
                <FormControlLabel
                  control={<Checkbox checked={options.difficulty.some(t=> t === "2")} onChange={this.handleDiffChange("2")} value="leggendaria" />}
                  label="†"
                />
              </FormGroup>
            </FormControl>
          </Grid>
          <Grid item xs={3}>
            <FormControl component="fieldset">
              <FormLabel component="legend"><FormattedMessage id="Compare.filterByPlusMinus"/></FormLabel>
              <FormGroup row>
                <FormControlLabel
                  control={<Checkbox checked={options.pm.some(t=> t === "+")} onChange={this.handlePMChange("+")} value="+" />}
                  label="+"
                />
                <FormControlLabel
                  control={<Checkbox checked={options.pm.some(t=> t === "-")} onChange={this.handlePMChange("-")} value="-" />}
                  label="-"
                />
              </FormGroup>
            </FormControl>
          </Grid>
        </Grid>
        <CompareTable full={this.sortedData()} isLoading={isLoading} page={page} rowsPerPage={rowsPerPage} sort={sort} isDesc={isDesc}
        changeSort={this.changeSort} displayMode={displayMode}
        handleChangeRowsPerPage={this.handleChangeRowsPerPage} handleChangePage={this.handleChangePage}/>
      </Container>
    );
  }
}
