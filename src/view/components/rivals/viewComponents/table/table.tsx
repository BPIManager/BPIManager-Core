import React from "react";
import Paper from "@mui/material/Paper";
import { diffColor } from "@/view/components/songs/common";
import { _currentViewComponents, _isSingle, _traditionalMode } from "@/components/settings";
import Details from "./modal";
import { withRivalData } from "@/components/stats/radar";
import { difficultyDiscriminator, _prefix } from "@/components/songs/filter";
import Grid from "@mui/material/Grid";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { Divider, Pagination, SelectChangeEvent  } from "@mui/material";
import ViewRowsSelector from "@/view/components/common/viewSelector";
import { songData } from "@/types/data";
import { songsDB } from "@/components/indexedDB";
import Loader from "@/view/components/common/loader";
import bpiCalcuator from "@/components/bpi";

interface P{
  data:withRivalData[],
  page:number,
  mode:number,
  handleChangePage:(_e:React.MouseEvent<HTMLButtonElement, MouseEvent> | null, newPage:number)=>void
}

interface S{
  rowsPerPage:number,
  isOpen:boolean,
  currentScoreData:withRivalData | null,
  components:string[],
  currentDisplaySongs:{[key:string]:songData},
  isLoading:boolean,
  currentSong:songData|null,
}

export default class ScoreTable extends React.Component<Readonly<P>,S>{

  constructor(props:Readonly<P>){
    super(props);
    this.state = {
      rowsPerPage : 10,
      isOpen:false,
      currentScoreData:null,
      components:_currentViewComponents().split(","),
      currentDisplaySongs:{},
      currentSong:null,
      isLoading:true,
    }
  }

  async componentDidMount(){
    const s = this.props.data;
    const result:any = {};
    for(let i = 0; i < s.length; ++i){
      const m = s[i];
      if(!m) continue;
      const song = await new songsDB().getOneItemIsSingle(m.title,m.difficulty);
      if(song && song.length > 0){
        result[song[0]["title"] + difficultyDiscriminator(song[0]["difficulty"])] = song[0];
      }
    }
    return this.setState({currentDisplaySongs:result,isLoading:false});
  }

  handleChangeRowsPerPage = (event:SelectChangeEvent<number>,_m:any):void => {
    this.props.handleChangePage(null,0);
    const newRows = Number(event.target.value);
    this.setState({rowsPerPage:newRows});
  }

  change = async(_e:any,page:number)=>{
    if(this.props.page + 1 === page || !page) return;
    this.props.handleChangePage(_e,page-1)
  }

  willBeRendered =(component:string):boolean=>{
    return this.state.components.indexOf(component) > -1;
  }

  bpiCalc = (song:songData,input:number)=>{
    try{
      const bpi = new bpiCalcuator();
      if(!song){
        return -15;
      }
      const res = bpi.setPropData(song,input,_isSingle());
      if(res === Infinity) return "-";
      return res;
    }catch(e:any){
      console.log(e);
      return -15;
    }
  }

  showDetails = (row:withRivalData|null,song?:songData|null)=>this.setState({currentScoreData:row,currentSong:song || null,isOpen:!this.state.isOpen});

  render(){
    const {isLoading,rowsPerPage,currentScoreData,isOpen,currentDisplaySongs,currentSong} = this.state;
    const {page,data} = this.props;
    if(isLoading){
      return <Loader/>
    }
    return (
      <Paper style={{width:"100%"}} className={_traditionalMode() === 1 ? "traditionalMode" : ""}>
        <Pagination count={Math.ceil(data.length / rowsPerPage)} page={page+1} color="secondary" onChange={this.change}/>
        <Grid container spacing={2} style={{margin:"15px 0"}}>
          {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row:withRivalData) => {
            const prefix = _prefix(row.difficulty);
            const song = currentDisplaySongs[row.title + row.difficulty];
            if(!song) return (null);
            return (
            <Grid item xs={12} sm={12} md={12} lg={6} className="gridWithPad" key={row.title + row.difficulty}>
              <CardContent style={{padding:0,cursor:"pointer"}} onClick={()=>this.showDetails(row,song)}>
                <Typography component="div" className="spaceBetween" sx={{ fontSize: 14, alignItems:"center"}} color="text.secondary" gutterBottom>
                  <p className="withClearLamp" style={{padding:"4px 0 4px 0",margin:0,borderLeft:"0px",wordBreak:"break-all"}}>
                    <span>☆{row.difficultyLevel}</span>&nbsp;
                    <span className="listHighlighted">{row.title}{prefix}</span>
                  </p>
                </Typography>
                <Grid container justifyContent="space-between" style={{margin:"5px 0"}}>
                {([0,1]).map(((item:number)=>{
                  const name = ["You","Rival"];
                  const clear = [row.myClearState,row.rivalClearState];
                  const ex = [row.myEx,row.rivalEx];
                  const ex2 = [row.rivalEx,row.myEx];
                  const bpi = [this.bpiCalc(song,row.myEx),this.bpiCalc(song,row.rivalEx)];
                  return (
                  <Grid item xs={6} key={item} style={{display:"flex",justifyContent:"space-between"}}>
                    <p className="withClearLamp" style={{padding:"4px 0 4px 5px",margin:0,borderLeft:`4px solid ${diffColor(2,clear[item],2)}`,wordBreak:"break-all"}}>
                      <span style={{fontSize:"12px"}}>{name[item]}</span><br/>
                      <span className="listHighlighted">
                        {ex[item]}
                        {ex[item] > ex2[item] && <span className="winnerPoint">&nbsp;(+{ex[item] - ex2[item]})</span>}
                      </span>
                    </p>
                    <p style={{padding:"4px 5px 4px 0",margin:0,wordBreak:"break-all",textAlign:"right"}}>
                      <span style={{fontSize:"12px"}}>BPI</span><br/>
                      <span>{bpi[item]}</span>
                    </p>
                  </Grid>);
                  })
                )}
                </Grid>
              </CardContent>
              <Divider style={{margin:"5px 0"}}/>
            </Grid>
            );
          })}
        </Grid>
        {isOpen && <Details song={currentSong} showDetails={this.showDetails} currentScoreData={currentScoreData} />}
        <Pagination count={Math.ceil(data.length / rowsPerPage)} page={page+1} color="secondary" onChange={this.change}/>
        <ViewRowsSelector rowsPerPage={rowsPerPage} handleChangeRowsPerPage={this.handleChangeRowsPerPage}/>
      </Paper>
    );
  }
}
