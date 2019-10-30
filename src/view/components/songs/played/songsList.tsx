import * as React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from "react-intl";
import {songsDB} from "../../../../components/indexedDB";

import Grid from '@material-ui/core/Grid';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

import SongsTable from "./tablePlayed";
import TextField from '@material-ui/core/TextField';

import {scoreData} from "../../../../types/data";
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { _prefix, _prefixFromNum } from '../../../../components/songs/filter';

import equal from 'fast-deep-equal'
import CircularProgress from '@material-ui/core/CircularProgress';
import { _isSingle } from '../../../../components/settings';

interface stateInt {
  isLoading:boolean,
  filterByName:string,
  scoreData:scoreData[],
  allSongsData:{[key:string]:any},
  options:{[key:string]:string[]},
  sort:number,
  isDesc:boolean,
  mode:number,
}

interface P{
  title:string,
  full:scoreData[],
  updateScoreData:()=>Promise<void>,
}

export default class SongsList extends React.Component<P,stateInt> {

  constructor(props:P){
    super(props);
    this.state = {
      isLoading:true,
      filterByName:"",
      scoreData:[],
      allSongsData:{},
      mode:0,
      sort:2,
      isDesc:true,
      options:{
        level:["11","12"],
        difficulty:["0","1","2"],
      }
    }
    this.updateScoreData = this.updateScoreData.bind(this);
  }

  async componentDidMount(){
    let allSongs:{[key:string]:string|number} = {};
    const allSongsRawData = await new songsDB().getAll(_isSingle());
    for(let i =0; i < allSongsRawData.length; ++i){
      const prefix:string = _prefixFromNum(allSongsRawData[i]["difficulty"]);
      allSongs[allSongsRawData[i]["title"] + prefix] = allSongsRawData[i];
    }
    this.setState({
      scoreData:this.props.full,
      allSongsData:allSongs,
      isLoading:false,
    });
  }

  componentDidUpdate(prevProps:P){
    if(!equal(prevProps.full,this.props.full)){
      return this.setState({scoreData:this.songFilter()});
    }
  }

  updateScoreData():Promise<void>{
    return this.props.updateScoreData();
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
    return this.setState({scoreData:this.songFilter(newState),options:newState["options"]});
  }

  handleInputChange = (e:React.ChangeEvent<HTMLInputElement>)=>{
    let newState = this.cloneState();
    newState.filterByName = e.target.value;

    return this.setState({scoreData:this.songFilter(newState),filterByName:e.target.value});
  }

  songFilter = (newState:{[s:string]:any} = this.state) =>{
    const diffs:string[] = ["hyper","another","leggendaria"];
    if(Object.keys(this.state.allSongsData).length === 0){return [];}
    console.log(this.props.full);
    return this.props.full.filter((data)=>{
      const m = newState.mode;
      const f = this.state.allSongsData;
      const max = f[data.title + _prefix(data["difficulty"])]["notes"] * 2;
      const evaluateMode = ():boolean=>{
        return m === 0 ? true :
        m === 1 ? data.exScore / max < 2 / 3 :
        m === 2 ? data.exScore / max < 7 / 9 && 2/3 < data.exScore / max :
        m === 3 ? data.exScore / max < 8 / 9 && 7/9 < data.exScore / max :
        m === 4 ? true :
        m === 5 ? data.clearState <= 3 :
        m === 6 ? data.clearState <= 4 :
        m === 7 ? data.clearState <= 5 : true
      }
      return (
        evaluateMode() &&
        newState["options"]["level"].some((item:string)=>{
          return item === data.difficultyLevel }) &&
        newState["options"]["difficulty"].some((item:number)=>{
          return diffs[Number(item)] === data.difficulty} ) &&
        data.title.indexOf(newState["filterByName"]) > -1
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
    const {scoreData,sort,isDesc,mode,allSongsData} = this.state;
    const res = scoreData.sort((a,b)=> {
      switch(sort){
        case 0:
        return Number(b.difficultyLevel) - Number(a.difficultyLevel);
        case 1:
        return b.title.localeCompare(a.title, "ja", {numeric:true});
        default:
        case 2:
        if(mode > 4){
          if(!a.missCount || !b.missCount){
            return -1;
          }
          return  a.missCount-b.missCount || (a.missCount||Infinity)-(b.missCount||Infinity) || 0
        }
        return b.currentBPI - a.currentBPI;
        case 3:
        if(mode > 0 && mode < 5){
          const aMax = allSongsData[a.title + _prefix(a.difficulty)]["notes"] * 2;
          const bMax = allSongsData[b.title + _prefix(b.difficulty)]["notes"] * 2;
          return b.exScore / bMax - a.exScore / aMax;
        }
        return b.exScore - a.exScore;
      }
    });
    return isDesc ? res : res.reverse();
  }

  handleModeChange = (event:React.ChangeEvent<{name?:string|undefined; value:unknown;}>):void =>{
    if (typeof event.target.value !== "number") { return; }
    let newState = this.cloneState();
    newState.mode = event.target.value;
    return this.setState({scoreData:this.songFilter(newState),mode:event.target.value});
  }

  // readonly修飾子が付いているデータに一時的な書き込みをするための措置
  // (曲目フィルタのためにのみ使用し、stateには反映しない)
  // アンチパターンなのでなんとかする
  cloneState = () => JSON.parse(JSON.stringify(this.state))

  render(){
    const {isLoading,filterByName,options,sort,isDesc,mode} = this.state;
    if(isLoading){
      return (
        <Container className="loaderCentered">
          <CircularProgress />
        </Container>);
    }
    return (
      <Container className="commonLayout" fixed id="songsVil">
        <Typography component="h4" variant="h4" color="textPrimary" gutterBottom
          style={{display:"flex",justifyContent:"space-between"}}>
          <FormattedMessage id={this.props.title}/>
        </Typography>
        <Grid container spacing={1} style={{margin:"5px 0"}}>
          <Grid item xs={6}>
            <FormControl style={{width:"100%"}}>
              <InputLabel><FormattedMessage id="Songs.mode"/></InputLabel>
              <Select value={mode} onChange={this.handleModeChange}>
                <MenuItem value={0}><FormattedMessage id="Songs.mode0"/></MenuItem>
                <MenuItem value={1}><FormattedMessage id="Songs.mode1"/></MenuItem>
                <MenuItem value={2}><FormattedMessage id="Songs.mode2"/></MenuItem>
                <MenuItem value={3}><FormattedMessage id="Songs.mode3"/></MenuItem>
                <MenuItem value={4}><FormattedMessage id="Songs.mode4"/></MenuItem>
                <MenuItem value={5}><FormattedMessage id="Songs.mode5"/></MenuItem>
                <MenuItem value={6}><FormattedMessage id="Songs.mode6"/></MenuItem>
                <MenuItem value={7}><FormattedMessage id="Songs.mode7"/></MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <form noValidate autoComplete="off">
              <TextField
                style={{width:"100%"}}
                label={<FormattedMessage id="Songs.filterByName"/>}
                placeholder={"(ex.)255"}
                value={filterByName}
                onChange={this.handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </form>
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

        <SongsTable
          data={this.sortedData()} sort={sort} isDesc={isDesc} mode={mode}
          changeSort={this.changeSort} allSongsData={this.state.allSongsData}
          updateScoreData={this.updateScoreData}/>
      </Container>
    );
  }
}
