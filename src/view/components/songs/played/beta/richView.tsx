  import React from "react";

import {scoreData, songData} from "@/types/data";
import { _prefix, genTitle } from "@/components/songs/filter";
import DetailedSongInformation from "../../detailsScreen";
import { diffColor } from "../../common";
import _djRank from "@/components/common/djRank";
import { _currentStore, _currentTheme, _currentViewComponents } from "@/components/settings";
import bpiCalcuator from "@/components/bpi";
import { scoresDB } from "@/components/indexedDB";
import Grid from "@mui/material/Grid";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { Box, Divider, LinearProgress, LinearProgressProps, Pagination, Paper } from "@mui/material";
import timeFormatter, { updatedTime } from "@/components/common/timeFormatter";

interface P{
  data:scoreData[],
  mode:number,
  allSongsData:Map<String,songData>
  updateScoreData:(row:songData)=>void,
  page:number,
  handleChangePage:(_e:any, newPage:number)=>void
}

interface S{
  rowsPerPage:number,
  isOpen:boolean,
  FV:number,
  currentSongData:songData | null,
  currentScoreData:scoreData | null,
  components:string[]
}

export default class SongsRichTable extends React.Component<Readonly<P>,S>{

  constructor(props:Readonly<P>){
    super(props);
    this.state = {
      rowsPerPage : 10,
      isOpen:false,
      FV:0,
      currentSongData:null,
      currentScoreData:null,
      components:_currentViewComponents().split(","),
    }
  }

  handleOpen = (updateFlag:boolean,row:songData|scoreData):void=> {
    if(updateFlag){this.props.updateScoreData(row as songData);}
    return this.setState({
      isOpen:!this.state.isOpen,
      FV:0,
      currentSongData:(row ? this.props.allSongsData.get(genTitle(row.title,row.difficulty)) : null) as songData,
      currentScoreData:(row ? row : null) as scoreData
    });
  }

  handleChangeRowsPerPage = (event:React.ChangeEvent<HTMLInputElement>):void => {
    this.props.handleChangePage(null,0);
    this.setState({rowsPerPage:+event.target.value});
  }

  render(){
    const {rowsPerPage,isOpen,currentSongData,currentScoreData,FV} = this.state;
    const {page,data} = this.props;
    const c = _currentTheme();
    const bgColor = c === "dark" ? "#0a0a0a" : c === "deepsea" ? "#000d19" : "#fff"
    return (
      <React.Fragment>
        <Pagination count={Math.ceil(data.length / 10)} page={page+1} color="secondary" onChange={(_e,page)=>{
          if(this.props.page + 1 === page) return;
          this.props.handleChangePage(_e,page-1)
        }}/>
        <div id="screenCaptureTarget" style={{backgroundColor:bgColor}}>
          <Grid container spacing={2} style={{marginTop:"15px"}}>
            {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row:scoreData,i:number) => {
              const prefix = _prefix(row.difficulty);
              const f = this.props.allSongsData.get(row.title + prefix);
              if(!f) return (null);
              return (<Item row={row} song={f} key={i} handleOpen={this.handleOpen}/>)
            })}
          </Grid>
          {isOpen &&
            <DetailedSongInformation isOpen={isOpen} song={currentSongData} score={currentScoreData} handleOpen={this.handleOpen} firstView={FV}/>
          }
        </div>
        <Pagination count={Math.ceil(data.length / 10)} page={page+1} color="secondary" onChange={(_e,page)=>{
          if(this.props.page + 1 === page) return;
          this.props.handleChangePage(_e,page-1)
        }}/>
      </React.Fragment>
    );
  }
}

const fontSize = "10px";

class Item extends React.Component<{
  row:scoreData,
  song:songData,
  handleOpen:(flag:boolean,row:scoreData)=>void
},{}>{

  render(){
    const {row,song} = this.props;
    const max  = song["notes"] * 2;
    const barColor = diffColor(0,row.clearState);
    const per = (row.exScore / max * 100);
    return (
    <Grid item xs={12} style={{padding:0}}>
      <CardContent style={{padding:0,cursor:"pointer"}} onClick={()=>this.props.handleOpen(false,row)}>
        <Typography component="div" className="spaceBetween" sx={{ fontSize: 14, alignItems:"center"}} color="text.secondary" gutterBottom>
          <p style={{padding:"4px 0 4px 5px",margin:0,borderLeft:"3px solid " + barColor}}>
          ☆{song.difficultyLevel}<br/>
          {row.title}
          </p>
          <div style={{textAlign:"right",padding:"0 0 0 3px",margin:0}}>
          BPI&nbsp;{row.currentBPI.toFixed(2)}<br/>
          <span style={{fontSize:"12px"}}>{new bpiCalcuator().rank(row.currentBPI)}位</span>
          </div>
        </Typography>
        <LinearProgressWithLabel per={per}/>
        <Paper style={{fontSize:fontSize,padding:"12px"}} square elevation={0}>
          <Grid container justifyContent="space-between" style={{margin:"5px 0"}}>
            <Grid item xs={5} sm={5}>
              <div className="spaceBetween"><Typography color="text.secondary">EX SCORE</Typography><span>{row.exScore}</span></div>
              <div className="spaceBetween"><Typography color="text.secondary">TARGET</Typography><span>
                {_djRank(false,false,max,row.exScore)}
                {_djRank(false,true,max,row.exScore)}
                </span>
              </div>
              <div className="spaceBetween"><Typography color="text.secondary">MISS COUNT</Typography><span>{row.missCount || 0}</span></div>
            </Grid>
            <Grid item xs={5} sm={5}>
              <ScoreCompares row={row}/>
            </Grid>
          </Grid>
          <Typography style={{textAlign:"right",fontSize:fontSize}} color="text.secondary">最終更新日&nbsp;{timeFormatter(0,row.updatedAt)}&nbsp;({updatedTime(row.updatedAt)})</Typography>
        </Paper>
        <Divider style={{margin:"10px 0"}}/>
      </CardContent>
    </Grid>
    )
  }
}

class LinearProgressWithLabel extends React.Component<LinearProgressProps & { per:number },{}> {
  render(){
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress style={{height:"2px"}} variant="determinate" value={this.props.per} color="secondary" />
        </Box>
        <Box sx={{ minWidth: 35 }}>
          <Typography style={{fontSize:fontSize}} color="text.secondary">{`${
            this.props.per.toFixed(2)
          }%`}</Typography>
        </Box>
      </Box>
    );
  }
}


class ScoreCompares extends React.Component<{row:scoreData},{
  lastVer:number,
  bestData:number,
  show:boolean,
  loading:boolean
}>{

  state = {
    show:true,
    lastVer:0,
    bestData:0,
    loading:true,
  }

  async componentDidMount(){
    const {row} = this.props;
    const sdb = new scoresDB();
    const t = await sdb._getSpecificSong(row.title,row.difficulty,row.isSingle);
    const res = [0,0]; // 0:lastVer,1:bestScore
    if(t){
      const lastVer = t.find(item=>item.storedAt === String(Number(_currentStore()) - 1));
      res[0] = lastVer ? lastVer["exScore"] : 0;
      res[1] = t.reduce((best,item)=>{
        if(item["exScore"] > best){
          best = item["exScore"];
        }
        return best;
      },0);
    }
    return this.setState({
      show:true,
      lastVer:res[0],
      bestData:res[1],
      loading:false,
    })
  }

  render(){
    const {lastVer,bestData,loading} = this.state;
    const {row} = this.props;
    if(loading){
      return (
        <React.Fragment>
          <div className="spaceBetween"><Typography color="text.secondary">前回</Typography>
          <span>
          </span>
          </div>
          <div className="spaceBetween"><Typography color="text.secondary">前作</Typography>
          <span>
          </span>
          </div>
          <div className="spaceBetween"><Typography color="text.secondary">自己歴代</Typography>
            <span>
            </span>
          </div>
        </React.Fragment>
      )
    }
    const bf = (cp:number)=> row.exScore - cp >= 0;
    const compare = (cp:number)=>{
      return (
        <span>
          {cp}&nbsp;
          <span style={{color:bf(cp) ? "#ff0000" : "#4fa6ff"}}>
            ({bf(cp) && <span>+</span>}
            {Number(row.exScore - cp)})
          </span>
        </span>
      )
    }
    return (
      <React.Fragment>
        <div className="spaceBetween"><Typography color="text.secondary">前回</Typography>
          {compare(row.lastScore)}
        </div>
        <div className="spaceBetween"><Typography color="text.secondary">前作</Typography>
          {compare(lastVer)}
        </div>
        <div className="spaceBetween"><Typography color="text.secondary">自己歴代</Typography>
          {compare(bestData)}
        </div>
      </React.Fragment>
    );
  }
}
