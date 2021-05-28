import * as React from 'react';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import {Link as RefLink, Dialog, DialogTitle, DialogContent, Divider, Typography, ButtonGroup, Chip, Avatar, Fab} from '@material-ui/core/';
import { _currentVersion, _currentTheme } from '@/components/settings';
import MenuIcon from '@material-ui/icons/Menu';
import UpdateIcon from '@material-ui/icons/Update';
import Loader from '../components/common/loader';
import { updateDefFile } from '@/components/settings/updateDef';
import CheckIcon from '@material-ui/icons/Check';
import WarningIcon from '@material-ui/icons/Warning';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import { getAltTwitterIcon } from '@/components/rivals';
import { alternativeImg, borderColor } from '@/components/common';
import { Helmet } from 'react-helmet';
import CameraAltIcon from '@material-ui/icons/CameraAlt';

class Index extends React.Component<{toggleNav:()=>void}&RouteComponentProps,{
  user:any
}>{

  constructor(props:{toggleNav:()=>void}&RouteComponentProps){
    super(props);
    this.state = {
      user:localStorage.getItem("social") ? JSON.parse(localStorage.getItem("social") || "[]") : null
    }
  }

  render(){
    const themeColor = _currentTheme();
    const {user} = this.state;
    return (
      <div>
        <Helmet>
          <meta name="description"
            content="beatmania IIDXのスコアをBPIという指標を用いて管理したり、ライバルとスコアを競ったりできるツールです。"
          />
        </Helmet>
        <div style={{position:"absolute",top:"3vh",display:"flex",justifyContent:"space-around",width:"100%",alignItems:"center"}}>
          {user && (
            <Chip
              avatar={(
                <Avatar style={{width:"32px",height:"32px"}}>
                  <img src={user.photoURL ? user.photoURL.replace("_normal","") : "noimage"} style={{width:"100%",height:"100%"}}
                  alt={user.displayName || "Unpublished User"}
                  onError={(e)=>(e.target as HTMLImageElement).src = getAltTwitterIcon(user) || alternativeImg(user.displayName)}/>
                </Avatar>
              )}
              onClick={()=>this.props.history.push("/sync/settings")}
              label={user.displayName || "-"}
              clickable
              color="secondary"
            />
          )}
          {!user && <div style={{width:"150px"}}></div>}
          <div>
            <Button startIcon={<MenuIcon />} onClick={this.props.toggleNav} color="secondary" size="large" style={{position:"relative",bottom:"2px",borderRadius:"0",borderBottom:"2px solid " + borderColor()}}>
              MENU
            </Button>
          </div>

        </div>
        <div style={{background:`url("/images/background/${themeColor}.svg")`,backgroundSize:"cover",height:"100vh"}}>
          <div style={{background:themeColor === "light" ? "transparent" : "rgba(0,0,0,.5)",display:"flex",padding:"1vh 0",width:"100%",height:"100vh"}} className="topFlexContent">
            <Container style={{display:"flex",justifyContent:"center",flexDirection:"column",textAlign:"center"}}>
              <Typography variant="h3" component="h1" style={{textAlign:"center"}}>
                BPIManager
              </Typography>
              <Typography variant="subtitle1" component="h2" gutterBottom style={{textAlign:"center"}}>
                The score management tool for IIDX
              </Typography>
              <ButtonGroup fullWidth style={{marginBottom:"5px"}}>
                <Button startIcon={<ArrowRightIcon />} onClick={()=>this.props.history.push("/data")} size="large" variant="text">
                  IMPORT
                </Button>
                <Button startIcon={<ArrowRightIcon />} onClick={()=>this.props.history.push("/songs")} size="large" variant="text">
                  SONGS
                </Button>
              </ButtonGroup>
              <Link to="/help/start"><RefLink component="span" color="secondary">How to Use / はじめての方</RefLink></Link>
            </Container>
          </div>
        </div>
        <Fab variant="extended" style={{position:"fixed",bottom:"3%",right:"3%"}} color="secondary" onClick={()=>this.props.history.push("/camera")}>
          <CameraAltIcon style={{marginRight:"5px"}}/>
          BPI CAMERA
        </Fab>
        <UpdateDef/>
      </div>
    )
  }
}

export default withRouter(Index);

class UpdateDef extends React.Component<{},{
  showUpdate:boolean,
  latestVersion:string,
  updateInfo:string,
  progress:number,
  res:string,
}>{

  constructor(props:{}){
    super(props);
    this.state = {
      showUpdate:false,
      latestVersion:"",
      updateInfo:"",
      progress:0,
      res:""
    }
  }

  async componentDidMount(){
    try{
      const versions = await fetch("https://proxy.poyashi.me/?type=bpiVersion");
      const data = await versions.json();
      const currentVersion = _currentVersion();
      if(data.version !== currentVersion){
        this.setState({
          showUpdate:true,
          latestVersion:data.version,
          updateInfo:data.updateInfo,
        });
      }
    }catch(e){
      console.log(e);
    }
  }

  updateButton = async()=>{
    this.setState({progress:1});
    const p = await updateDefFile();
    console.log(p);
    this.setState({progress:2,res:p.message});
  }

  handleToggle = ()=> this.setState({showUpdate:false});

  render(){
    const {showUpdate,latestVersion,updateInfo,progress,res} = this.state;
    if(!showUpdate){
      return (null);
    }
    return (
      <Dialog open={true}>
        <DialogTitle>定義データを更新</DialogTitle>
        <DialogContent>
          {progress === 0 && <div>
            最新の楽曲データ(ver{latestVersion})が利用可能です。<br/>
            「更新」ボタンをクリックして更新するか、「閉じる」ボタンをクリックして後で更新できます。<br/>
            <RefLink href={updateInfo} target="_blank" color="secondary">ここをクリック</RefLink>して、最新の楽曲データにおける変更点を確認できます。
            <Divider style={{margin:"8px 0"}}/>
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              size="large"
              onClick={this.updateButton}
              startIcon={<UpdateIcon/>}>
              今すぐ更新
            </Button>
            <Button onClick={this.handleToggle} color="secondary" fullWidth style={{marginTop:"8px"}}>
              閉じる
            </Button>
          </div>}
          {progress === 1 && <div>
            <Loader text={"更新しています"}/>
          </div>}
          {progress === 2 && <div>
            <div style={{display:"flex",alignItems:"center",margin:"20px 0",flexDirection:"column"}}>
              {(res === "定義データはすでに最新です" || res === "更新完了") && <CheckIcon style={{ fontSize: 60 }}/>}
              {(res !== "定義データはすでに最新です" && res !== "更新完了") && <WarningIcon style={{ fontSize: 60 }}/>}
              <span>{res}</span>
              {(res !== "定義データはすでに最新です" && res !== "更新完了") && <span><RefLink href="https://gist.github.com/potakusan/11b5322c732bfca4d41fc378dab9b992" color="secondary" target="_blank">トラブルシューティングを表示</RefLink></span>}
            </div>
            <Button onClick={this.handleToggle} color="secondary" fullWidth style={{marginTop:"8px"}}>
              閉じる
            </Button>
          </div>}
        </DialogContent>
      </Dialog>
    );
  }
}

/*



<Container fixed className="heroTitle">
  {((!hideVerBR && !localStorage.getItem("hideTopBISTROVER")) && (_currentStore() !== "28" && _currentStore() !== "INF")) &&
    <Alert variant="outlined" severity="info" style={{margin:"10px 0"}}>
      <AlertTitle>新バージョンへの切り替え</AlertTitle>
      <p>
        設定画面からスコアの保存先を「28 BISTROVER」に変更してください。
      </p>
      <ButtonGroup color="secondary" style={{margin:"8px 0"}} variant="outlined">
      <Button startIcon={<FavoriteIcon />}><Link to="/settings" style={{textDecoration:"none",color:"inherit"}}>設定</Link></Button>
      <Button startIcon={<VisibilityOffIcon />} onClick={()=>{
        localStorage.setItem("hideTopBISTROVER","true");
        this.setState({hide:true});
      }}>非表示</Button>
      </ButtonGroup>
    </Alert>
  }
  {(!hide1106 && !localStorage.getItem("hideTop20201106")) &&
    <Alert variant="outlined" severity="info" style={{margin:"10px 0"}}>
      <AlertTitle>新機能のご紹介</AlertTitle>
      <p>
        新曲のスコアをすぐにBPIManagerに登録できるようになりました。
      </p>
      <ButtonGroup color="secondary" style={{margin:"8px 0"}} variant="outlined">
      <Button startIcon={<FavoriteIcon />}><RefLink href="https://gist.github.com/potakusan/b5768f3ec6c50556beec50dd14ebaf23" style={{textDecoration:"none",color:"inherit"}} target="_blank">詳細</RefLink></Button>
      <Button startIcon={<VisibilityOffIcon />} onClick={()=>{
        localStorage.setItem("hideTop20201106","true");
        this.setState({hide:true});
      }}>非表示</Button>
      </ButtonGroup>
    </Alert>
  }
</Container>

 */
