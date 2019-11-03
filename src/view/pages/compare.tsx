import * as React from 'react';
import { scoresDB, songsDB } from '../../components/indexedDB';
import {_isSingle, _currentStore} from "../../components/settings";
import { scoreData, songData } from '../../types/data';
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
}

export default class Compare extends React.Component<{},S> {

  constructor(props:Object){
    super(props);
    this.state ={
      isLoading:true,
      full:[],
      filtered:[],
      sort:3,
      isDesc:true,
      options:{
        level:["11","12"],
        difficulty:["0","1","2"],
      },
      filterByName:"",
      compareFrom:"27",
      compareTo:"26",
      page:1,
      rowsPerPage:10,
    }
  }

  async componentDidMount(){
    this.dataHandler();
  }

  handleLevelChange = (name:string) => (e:React.ChangeEvent<HTMLInputElement>) =>{
    this.handleExec(name,e.target.checked,"level");
  }

  handleDiffChange = (name:string) => (e:React.ChangeEvent<HTMLInputElement>) =>{
    this.handleExec(name,e.target.checked,"difficulty");
  }

  handleExec = (name:string,checked:boolean,target:string)=>{
    let newState:S = this.state;
    if(checked){
      newState["options"][target].push(name);
    }else{
      newState["options"][target] = newState["options"][target].filter((t:string)=> t !== name);
    }
    this.setState({options:newState["options"]});
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
    this.setState({compareFrom:event.target.value,isLoading:true});
    return this.dataHandler(newState);
  }

  handleCompareToChange = async (event:React.ChangeEvent<{name?:string|undefined; value:unknown;}>):Promise<void> =>{
    if (typeof event.target.value !== "string") { return; }
    let newState = this.cloneState();
    newState.compareTo = event.target.value;
    this.setState({compareTo:event.target.value,isLoading:true});
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
    const fData = await scores.getSpecificVersionAll();
    for(let i =0; i < fData.length; ++i){
      let tScore = 0;
      const tData = await scores.getItem(fData[i]["title"],fData[i]["difficulty"],t,isSingle);
      const songData = await sdb.getOneItemIsSingle(fData[i]["title"],fData[i]["difficulty"]);
      if(!tData || tData.length === 0){
        tScore = 0;
      }else{
        tScore = tData[0]["exScore"];
      }
      result.push({
        title:fData[i]["title"],
        songData: songData[0],
        scoreData: fData[i],
        difficulty:fData[i]["difficulty"],
        difficultyLevel:fData[i]["difficultyLevel"],
        exScore:fData[i]["exScore"],
        compareData:tScore,
        gap:fData[i]["exScore"] - tScore
      });
    }
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
          return b.exScore - a.exScore;
        case 3:
          return b.gap - a.gap;
      }
    });
    console.log(sortedData);
    return isDesc ? sortedData.reverse() : sortedData;
  }

  cloneState = () => JSON.parse(JSON.stringify(this.state))

  handleChangePage = (newPage:number):void => this.setState({page:newPage});

  handleChangeRowsPerPage = (value:string):void => this.setState({page:0,rowsPerPage:+value});

  render(){
    const {full,compareFrom,compareTo,isLoading,page,rowsPerPage,options,sort,isDesc} = this.state;
    if(!this.state.full){
      return (null);
    }
    return (
      <Container className="commonLayout" fixed>
        <Typography component="h4" variant="h4" color="textPrimary" gutterBottom>
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
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Grid container spacing={1} id="mainFilters" style={{margin:"5px 0"}}>
          <Grid item xs={6}>
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
          <Grid item xs={6}>
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
        </Grid>
        <CompareTable full={this.sortedData()} isLoading={isLoading} page={page} rowsPerPage={rowsPerPage} sort={sort} isDesc={isDesc}
        changeSort={this.changeSort}
        handleChangeRowsPerPage={this.handleChangeRowsPerPage} handleChangePage={this.handleChangePage}/>
      </Container>
    );
  }
}
