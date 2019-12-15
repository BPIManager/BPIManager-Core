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
import BackspaceIcon from '@material-ui/icons/Backspace';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';

import SongsTable from "./tablePlayed";
import Input from '@material-ui/core/Input';

import {scoreData} from "../../../../types/data";
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { _prefix, _prefixFromNum } from '../../../../components/songs/filter';
import TuneIcon from '@material-ui/icons/Tune';
import equal from 'fast-deep-equal'
import CircularProgress from '@material-ui/core/CircularProgress';
import { _isSingle } from '../../../../components/settings';
import moment from 'moment';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';

interface stateInt {
  isLoading:boolean,
  filterByName:string,
  scoreData:scoreData[],
  allSongsData:{[key:string]:any},
  options:{[key:string]:string[]},
  sort:number,
  isDesc:boolean,
  mode:number,
  range:number,
  page:number,
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
      },
      range:0,
      page:0,
    }
    this.updateScoreData = this.updateScoreData.bind(this);
  }

  handleChangePage = (_e:React.MouseEvent<HTMLButtonElement, MouseEvent> | null, newPage:number):void => this.setState({page:newPage});

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
    return this.setState({scoreData:this.songFilter(newState),options:newState["options"],page:0});
  }

  handleInputChange = (e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>|null)=>{
    let newState = this.cloneState();
    newState.filterByName = e ? e.target.value : "";
    return this.setState({scoreData:this.songFilter(newState),filterByName:newState.filterByName,page:0});
  }

  songFilter = (newState:{[s:string]:any} = this.state) =>{
    const diffs:string[] = ["hyper","another","leggendaria"];
    const m = newState.mode;
    const r = newState.range;
    const f = this.state.allSongsData;

    const evaluateRange = (data:scoreData):boolean=>{
      const format = (t:string|Date|moment.Moment)=>moment(t).format("YYYYMMDD");
      return r === 0 ? true :
      r === 1 ? format(data.updatedAt) === format(new Date()) :
      r === 2 ? format(data.updatedAt) === format(moment().subtract(1, 'day')) :
      r === 3 ? moment(data.updatedAt).week() === moment(new Date()).week() :
      moment(data.updatedAt).isBefore(moment().subtract(1, 'month'))
    }

    const evaluateMode = (data:scoreData,max:number):boolean=>{
      return m === 0 ? true :
      m === 1 ? data.exScore / max < 2 / 3 :
      m === 2 ? data.exScore / max < 7 / 9 && 2/3 < data.exScore / max :
      m === 3 ? data.exScore / max < 8 / 9 && 7/9 < data.exScore / max :
      m === 4 ? data.exScore / max < 17 / 18 && 8/9 < data.exScore / max :
      m === 5 ? true :
      m === 6 ? data.clearState <= 3 :
      m === 7 ? data.clearState <= 4 :
      m === 8 ? data.clearState <= 5 : true
    }

    if(Object.keys(this.state.allSongsData).length === 0) return [];
    return this.props.full.filter((data)=>{
      if(!f[data.title + _prefix(data["difficulty"])]){return false;}
      const max = f[data.title + _prefix(data["difficulty"])]["notes"] * 2;
      return (
        evaluateRange(data) &&
        evaluateMode(data,max) &&
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
    const {scoreData,sort,isDesc,mode,allSongsData} = this.state;
    const res = scoreData.sort((a,b)=> {
      switch(sort){
        case 0:
        return Number(b.difficultyLevel) - Number(a.difficultyLevel);
        case 1:
        return b.title.localeCompare(a.title, "ja", {numeric:true});
        default:
        case 2:
        if(mode > 5){
          const am = !a.missCount ? Infinity : Number.isNaN(a.missCount) ? Infinity : a.missCount,
          bm = !b.missCount ? Infinity : Number.isNaN(b.missCount) ? Infinity : b.missCount;
          return  am-bm;
        }
        return b.currentBPI - a.currentBPI;
        case 3:
        if(mode > 0 && mode < 6){
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
    return this.setState({scoreData:this.songFilter(newState),mode:event.target.value,page:0});
  }

  handleRangeCange = (event:React.ChangeEvent<{name?:string|undefined; value:unknown;}>):void =>{
    if (typeof event.target.value !== "number") { return; }
    let newState = this.cloneState();
    newState.range = event.target.value;
    return this.setState({scoreData:this.songFilter(newState),range:event.target.value,page:0});
  }

  // readonly修飾子が付いているデータに一時的な書き込みをするための措置
  // (曲目フィルタのためにのみ使用し、stateには反映しない)
  // アンチパターンなのでなんとかする
  cloneState = () => JSON.parse(JSON.stringify(this.state))

  render(){
    const {isLoading,filterByName,options,sort,isDesc,mode,range,page} = this.state;
    if(isLoading){
      return (
        <Container className="loaderCentered">
          <CircularProgress />
        </Container>);
    }
    return (
      <Container className="commonLayout" fixed id="songsVil">
        <Typography component="h5" variant="h5" color="textPrimary" gutterBottom
          style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <FormattedMessage id={this.props.title}/>
          <FormControl>
            <Select value={range} displayEmpty onChange={this.handleRangeCange}>
              <MenuItem value={0}>全期間</MenuItem>
              <MenuItem value={1}>本日更新分</MenuItem>
              <MenuItem value={2}>前日更新分</MenuItem>
              <MenuItem value={3}>今週更新分</MenuItem>
              <MenuItem value={4}>1ヶ月以上未更新</MenuItem>
            </Select>
          </FormControl>
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
                <MenuItem value={8}><FormattedMessage id="Songs.mode8"/></MenuItem>
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

        <SongsTable
          page={page} handleChangePage={this.handleChangePage}
          data={this.sortedData()} sort={sort} isDesc={isDesc} mode={mode}
          changeSort={this.changeSort} allSongsData={this.state.allSongsData}
          updateScoreData={this.updateScoreData}/>
      </Container>
    );
  }
}
