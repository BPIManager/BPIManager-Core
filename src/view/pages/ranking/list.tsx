import * as React from 'react';
import Container from '@material-ui/core/Container';
import { injectIntl } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import { _currentTheme, _currentStore } from '@/components/settings';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import Loader from '@/view/components/common/loader';
import { httpsCallable } from '@/components/firebase';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import timeFormatter, { _isBetween } from '@/components/common/timeFormatter';
import { _prefixFullNum } from '@/components/songs/filter';
import { versionString } from '@/components/common';
import Button from '@material-ui/core/Button';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Alert from '@material-ui/lab/Alert/Alert';

interface S {
  isLoading:boolean,
  list:any,
}

class WeeklyList extends React.Component<{intl:any,viewInUser?:boolean,backToMainPage?:()=>void,uid?:string,name?:string}&RouteComponentProps,S> {

  constructor(props:{intl:any,viewInUser?:boolean,backToMainPage?:()=>void,uid?:string,name?:string}&RouteComponentProps){
    super(props);
    this.state ={
      isLoading:true,
      list:null
    }
  }

  async componentDidMount(){
    let data = {
      includeRank:true,
      currentUser:true,
      version:_currentStore(),
      uId:"",
      onlyJoined:false,
    };
    if(this.props.viewInUser && this.props.uid){
      data["currentUser"] = false;
      data["uId"] = this.props.uid || "";
      data["onlyJoined"] = true;
    }
    const res = await httpsCallable(`ranking`,`rankList`,data);
    this.setState({isLoading:false,list:res.data});
  }

  render(){
    const {isLoading,list} = this.state;
    const {viewInUser,backToMainPage,name} = this.props;
    return (
      <div>
        <Container fixed className="commonLayout">
          {!viewInUser && <DefaultHead/>}
          {(viewInUser && backToMainPage) && (
            <Typography component="h5" variant="h5" color="textPrimary" gutterBottom>
              <Button onClick={backToMainPage} style={{minWidth:"auto",padding:"6px 0px"}}><ArrowBackIcon/></Button>
              &nbsp;{name}さんのランキング参加履歴
            </Typography>
          )}
          {isLoading && <Loader text="ランキング一覧を取得中"/>}
          {!isLoading && (
            <div>
              {list.error && (
                <p>
                  エラーが発生しました。再読込してください。<br/>
                  ErrorMessage:{list.errorMessage || "Undefined error"}<br/>
                  Current Storage:{versionString(_currentStore())}
                </p>
              )}
              {list.info.length === 0 && (
                <Alert severity="warning">
                  {viewInUser && <span>このユーザーはまだランキングに一度も参加していません。</span>}
                  {!viewInUser && <span>表示するランキングが見つかりませんでした。</span>}
                </Alert>
              )}
              {!list.error && (
                <div>
                  {list.info.map((item:any)=>{
                    const isBetween = _isBetween(new Date().toString(),timeFormatter(4,item.since._seconds * 1000),timeFormatter(4,item.until._seconds * 1000));
                    return (
                      <List key={item.cid} subheader={<ListSubheader>{isBetween ? "(開催中)" : "(期間外)"} {timeFormatter(4,item.since._seconds * 1000)}~{timeFormatter(4,item.until._seconds * 1000)}</ListSubheader>}>
                        <ListItem button onClick={()=>this.props.history.push("/ranking/id/" + item.cid)}>
                          <ListItemText primary={`${item.title}(${_prefixFullNum(item.difficulty)})`} secondary={
                            <span>
                                {(!item.rank || item.rank === -1) ? "未参加" : "参加済(" + item.rank + "位) "} 参加人数:{item.sum}人&nbsp;
                                {item.detail && (
                                  <span>EXSCORE:{item.detail.exScore}</span>
                                )}
                            </span>
                          } />
                        </ListItem>
                      </List>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </Container>
      </div>
    );
  }
}

class DefaultHead extends React.Component<{},{}>{
  render(){
    const themeColor = _currentTheme();
    return (
      <div style={{background:`url("/images/background/${themeColor}.svg")`,backgroundSize:"cover"}}>
        <div style={{background:themeColor === "light" ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.4)",display:"flex",padding:"5vh 0",alignItems:"center",justifyContent:"center",flexDirection:"column",textAlign:"center"}}>
          <Typography component="h4" variant="h4" color="textPrimary" gutterBottom>
            過去のランキング一覧
          </Typography>
          <Typography component="p" variant="body1" color="textPrimary" gutterBottom>
            {versionString(_currentStore())}のWR
          </Typography>
        </div>
      </div>);
  }
}



export default withRouter(injectIntl(WeeklyList));
