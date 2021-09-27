import * as React from 'react';
import { _currentTheme } from '@/components/settings';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from "@mui/icons-material/Close";
import Container from '@mui/material/Container';
import Alert from '@mui/lab/Alert/Alert';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DatePicker from '@mui/lab/DatePicker';
import { toMomentHHMM, isBeforeSpecificDate, toDate } from '@/components/common/timeFormatter';
import Button from '@mui/material/Button';
import UpdateIcon from '@mui/icons-material/Update';
import Loader from '@/view/components/common/loader';
import { httpsCallable } from '@/components/firebase';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AlertTitle from '@mui/material/AlertTitle';
import { withRouter, RouteComponentProps } from 'react-router-dom';

class EditModal extends React.Component<{
  isOpen:boolean,
  handleOpen:(isCreating:boolean,reload?:boolean)=>void,
  onGoing:any,
  onGoingId:string,
}&RouteComponentProps,{
  rankingName:string,
  endDate:string,
  firstEndDate:string,
  info:string,

  display:number,
  isCreating:boolean,
  result:any,
  rankingNameDelete:string
}>{

  constructor(props:any){
    super(props);
    const f = toMomentHHMM(props.onGoing.until.toDate());
    this.state = {
      rankingName:props.onGoing.rankName,
      endDate:f,
      firstEndDate:f,
      info:props.onGoing.info || "",
      display:0,
      isCreating:false,
      result:null,
      rankingNameDelete:""
    }
  }

  handleEndDateInput = (date:any) => {
    this.setState({endDate:toMomentHHMM(date || new Date())});
  };

  changeView = (newState:number)=>{
    window.scrollTo(0, 0);
    this.setState({
      display: newState
    })
  }

  changeExec = async()=>{
    const {endDate,rankingName,info} = this.state;
    this.setState({isCreating:true,display:2});
    let data = {
      end:toDate(endDate),
      title:rankingName,
      info:info,
      id:this.props.onGoingId,
    };
    const p = await httpsCallable(`ranking`,`editRanking`,data);
    if(p.data.error){
      alert(p.data.errorMessage);
    }
    this.setState({isCreating:true,display:5,result:p})
  }

  deleteExec = async()=>{
    this.setState({isCreating:true,display:2});
    let data = {
      id:this.props.onGoingId,
    };
    const p = await httpsCallable(`ranking`,`deleteRanking`,data);
    if(p.data.error){
      alert(p.data.errorMessage);
    }
    this.setState({isCreating:false,display:7,result:p})
  }

  back = ()=>{
    this.props.handleOpen(false,true);
  }

  render(){
    const c = _currentTheme();
    const {isOpen,handleOpen,onGoing} = this.props;
    const {endDate,firstEndDate,rankingName,info,display,isCreating} = this.state;
    const isDisabled = ()=>{
      if(!rankingName){
        return true;
      }
      if(isBeforeSpecificDate(endDate,new Date())){
        return true;
      }
      if(isBeforeSpecificDate(endDate,firstEndDate)){
        return true;
      }
      return false;
    }

    const titleError = rankingName.length > 16;
    const errors = ()=>{
      const res = [];
      if(isBeforeSpecificDate(endDate,firstEndDate)){
        res.push("終了日は前回設定時刻と同一か、それより未来である必要があります");
      }
      if(isBeforeSpecificDate(endDate,new Date())){
        res.push("終了日は本日の日付より未来である必要があります");
      }
      return res;
    }

    const form = (readOnly:boolean = false)=>{
      return (
      <form noValidate autoComplete="off">
      <TextField
        required
        error={titleError}
        label="ランキングの名称"
        variant="outlined"
        fullWidth
        value={rankingName}
        onChange={(e)=>readOnly ? ()=>null : this.setState({rankingName:e.target.value})}
        InputLabelProps={{
          shrink: true,
        }}
        InputProps={{
          readOnly: readOnly,
        }}
        disabled={readOnly}
        helperText={titleError ? "タイトルが長すぎます" : ""}
      />
      <div style={{margin:"20px 0"}}/>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="終了日付"
          inputFormat="YYYY/MM/DD HH:mm"
          disablePast
          renderInput={(props) => (
            <TextField {...props} fullWidth variant="outlined"  />
          )}
          value={endDate}
          disabled={readOnly}
          onChange={readOnly ? ()=>null : this.handleEndDateInput}
        />
      </LocalizationProvider>
      <div style={{margin:"20px 0"}}/>
      <TextField
        fullWidth
        multiline
        rows={4}
        label="ランキングの概要(オプション)"
        variant="outlined"
        placeholder=""
        value={info}
        disabled={readOnly}
        onChange={(e)=>readOnly ? ()=>null : this.setState({info:e.target.value})}
        InputLabelProps={{
          shrink: true,
        }}
        InputProps={{
          readOnly: readOnly,
        }}
      />
      </form>
      )
    }

    return (
      <Dialog
        id="detailedScreen"
        className={c === "dark" ? "darkDetailedScreen" : c === "light" ? "lightDetailedScreen" : "deepSeaDetailedScreen"}
        fullScreen open={isOpen} onClose={()=>handleOpen(isCreating)} style={{overflowX:"hidden",width:"100%"}}>
        <AppBar>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={()=>handleOpen(isCreating)}
              aria-label="close"
              size="large">
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className="be-ellipsis" style={{flexGrow:1}}>
              ランキングを編集
            </Typography>
          </Toolbar>
        </AppBar>
        <Toolbar/>
        <Container className="commonLayout">

          {display === 7 && (
            <div>
              <Alert severity="success" icon={<AssignmentTurnedInIcon/>}>
                <AlertTitle>ランキングを削除しました</AlertTitle>
                <p>「完了」ボタンをクリックしてランキング一覧へ戻ります。</p>
              </Alert>
              <Button color="secondary" fullWidth variant="outlined" size="large" onClick={()=>window.location.reload()}
                style={{marginTop:"20px"}}>
                完了
              </Button>
            </div>
          )}

          {display === 5 && (
            <div>
              <Alert severity="success" icon={<AssignmentTurnedInIcon/>}>
                <AlertTitle>ランキングを編集しました</AlertTitle>
                <p>「完了」ボタンをクリックしてランキングページへ戻ります。</p>
              </Alert>
              <Button color="secondary" fullWidth variant="outlined" size="large" onClick={()=>this.back()}
                style={{marginTop:"20px"}}>
                完了
              </Button>
            </div>
          )}

          {display === 3 && (
            <div>
            <Button style={{marginBottom:"15px"}}
              startIcon={<UpdateIcon/>} color="secondary" fullWidth variant="outlined" size="large" onClick={()=>this.changeView(0)}>
              戻る
            </Button>
            <Alert severity="warning">
              ランキング「<b>{onGoing.rankName}</b>」を削除しますか？<br/>
              ランキングに紐付いたスコアデータは同時に削除されます。<br/>
              この操作は取り消すことができません。
            </Alert>
            <TextField
              style={{marginTop:"15px"}}
              required
              label="削除する場合、ランキング名を再入力"
              variant="outlined"
              fullWidth
              value={this.state.rankingNameDelete}
              onChange={(e)=>this.setState({rankingNameDelete:e.target.value})}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <Button color="secondary" fullWidth variant="outlined" size="large" disabled={onGoing.rankName !== this.state.rankingNameDelete} onClick={()=>this.deleteExec()}
              style={{marginTop:"20px"}}>
              削除を実行
            </Button>
            </div>
          )}

          {display === 2 && (
            <Loader text="更新しています"/>
          )}

          {display === 0 && (
          <div>
          <Alert icon={false} severity="success">
            このランキングを編集します。<br/>
            作成済みのランキングを削除する場合は一番下の「削除する」ボタンをクリックしてください。
          </Alert>
          <Divider style={{margin:"20px 0"}}/>
          {form()}
          <Divider style={{margin:"20px 0"}}/>
          <Button color="secondary" fullWidth variant="outlined" size="large" disabled={isDisabled()} onClick={()=>this.changeExec()}>
            ランキングを編集
          </Button>
          <Button fullWidth variant="outlined" size="large" onClick={()=>this.changeView(3)} style={{marginTop:"15px"}}>
            ランキングを削除
          </Button>
          {errors().length > 0 && (
            <Alert icon={false} severity="error" style={{margin:"15px 0"}}>
              {errors().map((item)=><span>{item}<br/></span>)}
            </Alert>
          )}
          </div>
          )}
        </Container>
      </Dialog>
    );
  }

}


export default withRouter(EditModal);
