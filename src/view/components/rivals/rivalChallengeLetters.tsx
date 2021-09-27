import * as React from 'react';
import { loader } from '@/components/rivals/letters';
import FilterByLevelAndDiff from '../common/selector';
import LettersTable from './viewComponents/letters/table';
import SongsFilter, {  B } from '../songs/common/filter';
import { verArr, bpmFilter, clearArr } from '../songs/common';
import FilterListIcon from '@mui/icons-material/FilterList';
import BackspaceIcon from "@mui/icons-material/Backspace";
import { difficultyDiscriminator } from '@/components/songs/filter';
import { songsDB } from '@/components/indexedDB';
import { commonFunc } from '@/components/common';
import { songData } from '@/types/data';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import { FormattedMessage } from 'react-intl';
import InputLabel from '@mui/material/InputLabel';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { _isSingle } from '@/components/settings';
import OrderControl from "../songs/common/orders";
import Container from '@mui/material/Container/Container';
import { timeCompare } from '@/components/common/timeFormatter';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Loader from '../common/loader';
import ListItem from '@mui/material/ListItem';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import SearchIcon from '@mui/icons-material/Search';
import { avatarBgColor, avatarFontColor } from '@/components/common';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import List from '@mui/material/List';
import { SelectChangeEvent } from '@mui/material';

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
  versions:number[],
  userData:any,
  clearType:number[]
}

class RivalChallengeLetters extends React.Component<P&RouteComponentProps,stateInt> {

  constructor(props:P&RouteComponentProps){
    super(props);
    this.state = {
      isLoading:true,
      filterByName:"",
      scoreData:[],
      allSongsData:[],
      full:[],
      orderTitle:5,
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
      versions:verArr(),
      userData:null,
      clearType:clearArr(),
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
        case 5:
          return timeCompare(a.updatedAt,b.updatedAt);
      }
    });
    if(orderTitle === 0){
      sortedData = scoreData.sort((a:any,b:any)=>{
        return Number(a.rate) - Number(b.rate);
      })
    }
    return orderMode === 0 ? sortedData : sortedData.reverse();
  }

  handleOrderTitleChange = (event:SelectChangeEvent<number>):void =>{
    const val = event.target.value;
    if (typeof val !== "number") { return; }
    return this.setState({orderTitle:val,page:0});
  }

  handleOrderModeChange = (event:SelectChangeEvent<number>):void =>{
    const val = event.target.value;
    if (typeof val !== "number") { return; }
    return this.setState({orderMode:val,page:0});
  }

  render(){
    const {isLoading,scoreData,options,page,full,filterOpen,versions,filterByName,orderMode,orderTitle,clearType} = this.state;
    const orders = [
      "勝率",
      "勝利数",
      "敗北数",
      "曲名",
      "レベル",
      "最終更新日時",
    ];
    if(isLoading){
      return (<Loader/>)
    }
    if(!isLoading && (!scoreData || scoreData.length === 0)){
      return (
        <Container fixed className="commonLayout">
          <div style={{display:"flex",alignItems:"center",flexDirection:"column"}}>
            <PersonAddIcon style={{fontSize:80,marginBottom:"8px"}}/>
            <Typography variant="h4">
              ライバルを追加
            </Typography>
          </div>
          <Divider style={{margin:"10px 0"}}/>
          <p>
            このページでは、各楽曲ごとにライバルとの勝敗比較を行うことができます。<br/>
            まずは実力の近いユーザーを探して、ライバルとして追加しましょう！<br/>
          </p>
          <List>
            {[
              {name:"おすすめユーザー",func:()=>this.props.history.push("/rivals?tab=1"),desc:"総合BPIが近いユーザーを表示します",icon:<ThumbUpIcon/>},
              {name:"探す",func:()=>this.props.history.push("/rivals?tab=3"),desc:"様々な条件からユーザーを検索します",icon:<SearchIcon/>}
            ].map((item,i)=>{
              return (
              <ListItem key={i} button onClick={item.func}>
                <ListItemAvatar>
                  <Avatar style={{background:avatarBgColor,color:avatarFontColor}}>
                    {item.icon}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={item.name} secondary={item.desc} />
                <ListItemSecondaryAction onClick={item.func}>
                  <IconButton edge="end">
                    <ArrowForwardIosIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              )
            })
          }
          </List>
        </Container>
      );
    }
    return (
      <Container fixed className="commonLayout">
        <Grid container style={{margin:"5px 0"}}>
          <Grid item xs={10}>
            <FormControl component="fieldset" style={{width:"100%"}} variant="standard">
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
        {filterOpen && <SongsFilter versions={versions} clearType={clearType} handleToggle={this.handleToggleFilterScreen} applyFilter={this.applyFilter} bpm={this.state.bpm}/>}
      </Container>
    );
  }
}

export default withRouter(RivalChallengeLetters);
