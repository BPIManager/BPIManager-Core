import * as React from 'react';
import Container from '@material-ui/core/Container';
import { FormattedMessage } from "react-intl";
import {songsDB, scoresDB, rivalListsDB} from "../../../../../components/indexedDB";

import Grid from '@material-ui/core/Grid';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import BackspaceIcon from '@material-ui/icons/Backspace';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';

import Table from "../table";
import Input from '@material-ui/core/Input';

import {scoreData} from "../../../../../types/data";
import InputLabel from '@material-ui/core/InputLabel';
import { _prefix, _prefixFromNum } from '../../../../../components/songs/filter';
import CircularProgress from '@material-ui/core/CircularProgress';
import { _isSingle } from '../../../../../components/settings';
import moment from 'moment';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

interface stateInt {
  isLoading:boolean,
  filterByName:string,
  scoreData:any[],
  options:{[key:string]:string[]},
  sort:number,
  isDesc:boolean,
  page:number,
  mode:number,
}

interface P{
  type:number,
  rivalData:any,
  full:any[]
}

export default class SongsUI extends React.Component<P,stateInt> {

  constructor(props:P){
    super(props);
    this.state = {
      isLoading:true,
      filterByName:"",
      mode:0,
      sort:2,
      scoreData:[],
      isDesc:true,
      options:{
        level:["11","12"],
        difficulty:["0","1","2"],
      },
      page:0,
    }
  }

  handleChangePage = (_e:React.MouseEvent<HTMLButtonElement, MouseEvent> | null, newPage:number):void => this.setState({page:newPage});

  async componentDidMount(){
    this.setState({
      isLoading:false,
      scoreData:this.props.full,
    });
  }

  handleLevelChange = (name:string) => (e:React.ChangeEvent<HTMLInputElement>) =>{
    this.handleExec(name,e.target.checked,"level");
  }

  handleDiffChange = (name:string) => (e:React.ChangeEvent<HTMLInputElement>) =>{
    this.handleExec(name,e.target.checked,"difficulty");
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

  handleInputChange = (e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>|null)=>{
    let newState = this.cloneState();
    newState.filterByName = e ? e.target.value : "";
    return this.setState({scoreData:this.songFilter(newState),filterByName:newState.filterByName,page:0});
  }

  songFilter = (newState:{[s:string]:any} = this.state) =>{
    const diffs:string[] = ["hyper","another","leggendaria"];

    return this.props.full.filter((data)=>{
      return (
        newState["options"]["level"].some((item:string)=>{
          return item === data.difficultyLevel }) &&
        newState["options"]["difficulty"].some((item:number)=>{
          return diffs[Number(item)] === data.difficulty} ) &&
        data.title.toLowerCase().indexOf(newState["filterByName"].toLowerCase()) > -1
      )
    })
  }

  changeSort = (newNum:number):void=>{
    const {sort,isDesc} = this.state;
    if(sort === newNum){
      return this.setState({isDesc:!isDesc});
    }
    return this.setState({sort:newNum,isDesc:true})
  }

  sortedData = ():scoreData[]=>{
    const {scoreData,sort,isDesc,mode} = this.state;

    const res = scoreData.sort((a,b)=> {
      switch(sort){
        case 0:
        return Number(b.difficultyLevel) - Number(a.difficultyLevel);
        case 1:
        return b.title.localeCompare(a.title, "ja", {numeric:true});
        default:
        case 2:
        return (
          mode === 0 ? b.myEx - a.myEx :
          b.myClearState - a.myClearState
        );
        case 3:
        return (
          mode === 0 ? b.rivalEx - a.rivalEx :
          b.rivalClearState - a.rivalClearState
        );
        case 4:
        return (
          mode === 0 ? (b.myEx - b.rivalEx) - (a.myEx - a.rivalEx) :
          (b.myClearState - b.rivalClearState) - (a.myClearState - a.rivalClearState)
        )
      }
    });
    return isDesc ? res : res.reverse();
  }

  // readonly修飾子が付いているデータに一時的な書き込みをするための措置
  // (曲目フィルタのためにのみ使用し、stateには反映しない)
  // アンチパターンなのでなんとかする
  cloneState = () => JSON.parse(JSON.stringify(this.state))

  handleModeChange = (event:React.ChangeEvent<{name?:string|undefined; value:unknown;}>):void =>{
    if (typeof event.target.value !== "number") { return; }
    let newState = this.cloneState();
    newState.mode = event.target.value;
    return this.setState({scoreData:this.songFilter(newState),mode:event.target.value,page:0});
  }

  render(){
    const {isLoading,filterByName,options,sort,isDesc,page,mode} = this.state;
    if(isLoading){
      return (
        <Container className="loaderCentered">
          <CircularProgress />
        </Container>);
    }
    return (
      <div>
        <Grid container spacing={1} style={{margin:"5px 0"}}>
          <Grid item xs={6}>
            <FormControl style={{width:"100%"}}>
              <InputLabel><FormattedMessage id="Songs.mode"/></InputLabel>
              <Select value={mode} onChange={this.handleModeChange}>
                <MenuItem value={0}>スコア</MenuItem>
                <MenuItem value={1}>クリアランプ</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
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

        <Table
          page={page} handleChangePage={this.handleChangePage}
          data={this.sortedData()} sort={sort} isDesc={isDesc} mode={mode}
          changeSort={this.changeSort}/>
      </div>
    );
  }
}
