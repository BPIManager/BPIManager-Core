import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';
import Divider from '@material-ui/core/Divider';
import fbActions from '../../../components/firebase/actions';
import Typography from '@material-ui/core/Typography';
import { _currentStore, _isSingle } from '../../../components/settings';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import timeFormatter from '../../../components/common/timeFormatter';
import { scoresDB, scoreHistoryDB } from '../../../components/indexedDB';

class SyncControlScreen extends React.Component<{userData:any},{
  isLoading:boolean,
  scoreData:any
}> {

  private fbA:fbActions = new fbActions();

  constructor(props:{userData:any}){
    super(props);
    this.fbA.setColName(`${_currentStore()}_${_isSingle()}`).setUid(props.userData.uid);
    this.state = {
      isLoading:true,
      scoreData:null,
    }
  }

  async componentDidMount(){
    this.setState({
      isLoading:false,
      scoreData: await this.fbA.load()
    })
  }

  upload = async()=>{
    this.setState({isLoading:true});
    const res = await this.fbA.save();
    if(res.error){
      alert("エラーが発生しました");
      return this.setState({isLoading:false});;
    }
    this.setState({isLoading:false,scoreData:{timeStamp:timeFormatter(3),type:this.fbA.type()}});
  }

  download = async()=>{
    this.setState({isLoading:true});
    const res = await this.fbA.load();
    if(res === null || res === undefined){
      alert("エラーが発生しました");
      return this.setState({isLoading:false});;
    }
    await new scoresDB().setDataWithTransaction(res.scores);
    await new scoreHistoryDB().setDataWithTransaction(res.scoresHistory);
    this.setState({isLoading:false});
  }

  render(){
    const {isLoading,scoreData} = this.state;
    return (
      <div>
        <FormattedMessage id="Sync.Control.message1"/><br/>
        <FormattedMessage id="Sync.Control.message2"/>
        <Divider style={{margin:"10px 0"}}/>
        {isLoading && <p><FormattedMessage id="Sync.Control.processing"/></p>}
        {(!isLoading && scoreData === null) && <p><FormattedMessage id="Sync.Control.nodata"/></p>}
        {(!isLoading && scoreData !== null) && <p><FormattedMessage id="Sync.Control.lastupdate"/>:{scoreData.timeStamp} {scoreData.type ? scoreData.type : "undefined"}から</p>}
        <ButtonGroup fullWidth color="secondary">
          <Button
            onClick={this.upload}
            disabled={isLoading}
          >Upload</Button>
          <Button
            onClick={this.download}
            disabled={isLoading}
            >Download</Button>
        </ButtonGroup>
        <Divider style={{margin:"10px 0"}}/>
        <Button
          variant="outlined"
          color="secondary"
          disabled={isLoading}
          onClick={()=>this.fbA.logout()}
          startIcon={<MeetingRoomIcon />}>
          Log out
        </Button>
        <Typography component="p" variant="caption" style={{textAlign:"right"}}>
          current configures:[version:{_currentStore()}] [mode:{_isSingle() === 1 ? "Single Play" : "Double Play"}]
        </Typography>
      </div>
    );
  }
}

export default SyncControlScreen;
