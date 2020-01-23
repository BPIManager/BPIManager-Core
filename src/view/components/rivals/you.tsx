import * as React from 'react';
import Container from '@material-ui/core/Container';
import { injectIntl } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import { RouteComponentProps, withRouter, Link as RLink } from 'react-router-dom';
import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';
import Avatar from '@material-ui/core/Avatar';
import fbActions from '../../../components/firebase/actions';
import ShareButtons from '../common/shareButtons';
import WarningIcon from '@material-ui/icons/Warning';
import Link from '@material-ui/core/Link';

interface S {
  userName:string,
  processing:boolean,
  res:any,
}

class User extends React.Component<{intl:any}&RouteComponentProps,S> {
  private fbA:fbActions = new fbActions();

  constructor(props:{intl:any}&RouteComponentProps){
    super(props);
    this.fbA.setColName("users");
    this.state ={
      userName:"",
      processing:true,
      res:null,
    }
  }

  async componentDidMount(){
    new fbActions().auth().onAuthStateChanged(async (user: any)=> {
      if(user){
        const t = await this.fbA.setColName("users").setDocName(user.uid).load();
        this.setState({
          res:t || null,
          userName:(t && t.displayName) ? t.displayName : "",
          processing:false,
        });
      }else{
        this.setState({
          processing:false,
        })
      }
    });
  }

  getIIDXId = (input:string)=>{
    const match = input.match(/\d{4}(\-|)\d{4}/);
    return match ? match[0].replace(/[^\d]/g,"") : "";
  }

  getTwitterName = (input:string)=>{
    const match = input.match(/@[a-zA-Z0-9_]+/);
    return match ? match[0].replace(/@/g,"") : "";
  }

  render(){
    const {processing,userName,res} = this.state;
    const url = "https://bpi.poyashi.me/u/" + encodeURI(userName);
    if(processing){
      return (
        <Container fixed style={{padding:0}}>
          <Container className="loaderCentered">
            <CircularProgress />
          </Container>
        </Container>
      )
    }
    if(!userName){
      return (
        <Container className="commonLayout" fixed>
          <Paper>
            <div style={{textAlign:"center",padding:"15px"}}>
              <WarningIcon style={{color:"#555",fontSize:"45px"}}/>
              <Typography variant="h4" gutterBottom>
                Error!
              </Typography>
              <Typography variant="body2" gutterBottom>
                あなたのスコアデータは非公開です。<br/>
                <RLink to="/sync" style={{textDecoration:"none"}}><Link color="secondary" component="span">「Sync」</Link></RLink>から公開設定を行ってください。
              </Typography>
            </div>
          </Paper>
        </Container>
      );
    }
    return (
      <Container className="commonLayout" fixed>
        <p style={{textAlign:"center",margin:"10px 0"}}>
          公開用URL<br/>
          <RLink to={"/u/" + res.displayName} style={{textDecoration:"none"}}><Link color="secondary" component="span">{url}</Link></RLink>
        </p>
        <ShareButtons withTitle={false} url={url}/>
        <Paper style={{marginTop:"10px"}}>
          <div style={{textAlign:"center",padding:"15px"}}>
            <Avatar alt={res.displayName} src={res.photoURL.replace("_normal","")}
              onError={(e)=>(e.target as HTMLImageElement).src = 'https://files.poyashi.me/noimg.png'}
              style={{width:"150px",height:"150px",border:"1px solid #ccc",margin:"15px auto"}} />
            <Typography variant="h4">
              {res.displayName}
            </Typography>
            <Typography variant="caption" component="p" gutterBottom style={{color:"#aaa",marginBottom:"10px"}}>
              アリーナランク:{res.arenaRank}<br/>
              最終更新:{res.timeStamp}
            </Typography>
            <Typography variant="body1" gutterBottom>
              {res.profile}
            </Typography>
          </div>
        </Paper>
        <img src={`https://chart.apis.google.com/chart?cht=qr&chs=150x150&chl=${url}`} style={{margin:"10px auto",display:"block",border:"1px solid #ccc"}}/>
      </Container>
    );
  }
}

export default injectIntl(withRouter(User));
