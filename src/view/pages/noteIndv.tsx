import * as React from 'react';
import { _currentStore, _currentTheme } from '@/components/settings';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import SongNotes from '../components/songs/songNotes';
import { songsDB, scoresDB } from '@/components/indexedDB';
import { scoreData, songData } from '@/types/data';
import Loader from '../components/common/loader';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import Button from '@material-ui/core/Button';
import Alert from '@material-ui/lab/Alert/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import timeFormatter from '@/components/common/timeFormatter';
import { _prefixWithPS } from '@/components/songs/filter';

class NoteIndv extends React.Component<RouteComponentProps,{
  song:songData|null,
  score:scoreData|null,
  isLoading:boolean,
}> {
  private songsDB = new songsDB();
  private scoresDB = new scoresDB();

  constructor(props:RouteComponentProps){
    super(props);
    this.state = {
      song:null,
      score:null,
      isLoading:true,
    }
  }

  async componentDidMount(){
    const params:any = this.props.match.params;
    const songName = params.title || "";
    const songDiff = params.diff || "";
    const isSingle = params.single === "sp";
    const score = await this.scoreFinder(songName,songDiff,isSingle);
    document.title = `${songName}${_prefixWithPS(params.diff,params.single === "sp")} - BPIManager Notes`
    return this.setState({song:{
      title:songName,
      difficulty:songDiff,
      difficultyLevel:"-1",
      wr:0,
      avg:0,
      notes:0,
      dpLevel:isSingle ? "0" : "12",
      bpm:"0",
      textage:"0",
      isFavorited:false,
      isCreated:false,
      updatedAt:timeFormatter()
    },score:score,isLoading:false});
  }

  scoreFinder = async (title:string,difficulty:string,isSingle:boolean):Promise<scoreData|null>=>{
    const items = await this.scoresDB.getItem(title,difficulty,_currentStore(),isSingle ? 1 : 0);
    if(items.length > 0){
      return items[0];
    }
    return null;
  }

  componentWillUnmount(){
    document.title = "BPI Manager";
  }


  render(){
    const themeColor = _currentTheme();
    const {match} = this.props;
    const {song,score,isLoading} = this.state;
    const params:any = match.params;
    return (
      <div>
        <div style={{background:`url("/images/background/${themeColor}.svg")`,backgroundSize:"cover"}}>
          <div style={{background:themeColor === "light" ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.4)",display:"flex",padding:"5vh 0",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
            <Typography variant="h5" gutterBottom>{params.title}{_prefixWithPS(params.diff,params.single === "sp")}</Typography>
            <Button startIcon={<ArrowBackIosIcon/>} style={{margin:"8px 0"}} variant="outlined" onClick={()=>this.props.history.push("/notes")}>Notes</Button>
          </div>
        </div>
        {isLoading && <Loader/>}
        {!isLoading && <SongNotes song={song} score={score} isIndv/>}
        {(!isLoading && !song) && (
          <Alert severity="warning">
            <AlertTitle>読み込みに失敗しました</AlertTitle>
            <p>楽曲データの読み込みに失敗しました。<br/>ページを再読込してください。</p>
          </Alert>
        )}
      </div>
    );
  }
}

export default withRouter(NoteIndv);
