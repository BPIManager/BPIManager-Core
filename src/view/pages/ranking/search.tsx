import * as React from 'react';
import Container from '@material-ui/core/Container';
import { injectIntl } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import { _currentStore } from '@/components/settings';
import timeFormatter, { toDate, _isBetween, isBeforeSpecificDate } from '@/components/common/timeFormatter';
import { functions } from '@/components/firebase';
import Loader from '@/view/components/common/loader';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import Divider from '@material-ui/core/Divider';
import fbActions from '@/components/firebase/actions';
import { getAltTwitterIcon } from '@/components/rivals';
import AddIcon from '@material-ui/icons/Add';
import InfiniteScroll from 'react-infinite-scroller';
import WeeklyModal from "./modal";
import { timeDiff } from '@/components/common';
import CreateModal from './crud/create';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import PersonIcon from '@material-ui/icons/Person';
import SpeedDial from '@material-ui/lab/SpeedDial';
import SpeedDialIcon from '@material-ui/lab/SpeedDialIcon';
import SpeedDialAction from '@material-ui/lab/SpeedDialAction';
import MenuIcon from '@material-ui/icons/Menu';
import CloseIcon from '@material-ui/icons/Close';
import ModalUser from '@/view/components/rivals/modal';
import HelpIcon from '@material-ui/icons/Help';
import Alert from '@material-ui/lab/Alert/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle/AlertTitle';
import Link from '@material-ui/core/Link';
import {Link as RLink} from "react-router-dom";
import { config } from '@/config';

interface S {
  isLoading:boolean,
  rankingList:any[],
  auth:any,
  isLast:boolean,
  offset:number,
  isOpenRanking:boolean,
  currentRankingId:string,
  isOpenCreateModal:boolean,
  showFinished:boolean,
  dialOpen:boolean,
  isOpenUserPage:boolean
}

class RankingSearch extends React.Component<{intl:any}&RouteComponentProps,S> {
  private fbA:fbActions = new fbActions();

  constructor(props:{intl:any}&RouteComponentProps){
    super(props);
    this.state ={
      isLoading:true,
      rankingList:[],
      auth:null,
      isLast:false,
      offset:0,
      isOpenRanking:false,
      isOpenCreateModal:false,
      currentRankingId:"",
      showFinished:false,
      dialOpen:false,
      isOpenUserPage:false,
    }
  }

  async componentDidMount(){
    this.next();
  }

  next = async(showFinished:boolean = this.state.showFinished,oldList:any = [],force:boolean = false)=>{
    if(this.state.isLast && !force) return;
    this.setState({isLoading:true});
    let data = {
      includeRank:false,
      currentUser:true,
      version:_currentStore(),
      uId:"",
      onlyJoined:false,
      offset:oldList.length,
      split:10,
      order:showFinished ? "desc" : "asc",
      endDate:toDate(new Date()),
      showFinished:showFinished,
    };
    const res = await functions.httpsCallable("rankSearch")(data);
    if(res.data.error || res.data.info.length === 0){
      return this.setState({isLast:true,isLoading:false,auth:res.data.auth});
    }
    const list = oldList.concat(await this.expandData(res.data.info));
    return this.setState({
      isLoading:false,
      rankingList:list,
      auth:res.data.auth,
      offset:list.length
    })
  }

  handleOpenRanking = (rankId:string = "")=>{
    this.setState({
      isOpenRanking:!this.state.isOpenRanking,
      currentRankingId:rankId
    })
  }

  handleOpenCreateModal = (isCreating:boolean = false)=>{
    if(isCreating) return;
    this.setState({
      isOpenCreateModal:!this.state.isOpenCreateModal,
    })
  }

  expandData = async(data:any)=>{
    let newData = [];
    for(let i = 0; i < data.length; ++i){
      const item = data[i];
      const user = await this.fbA.searchByExactId(item.authorId);
      item.authorRef = user;
      newData.push(item);
    }
    return newData;
  }

  toggleFinished = ()=>{
    const p = !this.state.showFinished;
    this.setState({
      showFinished:p,
      isLast:false,
      offset:0,
      rankingList:[],
    })
    this.next(p,[],true);
  }

  toggleDial = ()=> this.setState({dialOpen:!this.state.dialOpen});

  handleModalOpen = (flag:boolean)=> this.setState({isOpenUserPage:flag});

  render(){
    const {isLoading,rankingList,auth,isLast,isOpenRanking,currentRankingId,isOpenCreateModal,showFinished,dialOpen,isOpenUserPage} = this.state;
    const actions = [
      { icon:  <AddIcon/>, name: 'ランキングを作成', onClick: ()=>this.handleOpenCreateModal(false)},
      { icon: <PersonIcon />, name: '参加したランキング', onClick: ()=>this.handleModalOpen(true)},
      { icon: <HelpIcon />, name: 'この機能について', onClick: ()=>this.props.history.push("/help/ranking")},
    ];
    return (
      <Container className="commonLayout">
        {(_currentStore() !== config.latestStore ) && (
          <Alert severity="error" style={{margin:"10px 0"}}>
            <AlertTitle>スコア保存先をご確認ください</AlertTitle>
            <p>
              スコアデータの保存先が最新のアーケード版IIDXバージョンではありません。<br/>
              最新の開催中ランキングが表示されない場合があります。<br/>
              <RLink to="/settings" style={{textDecoration:"none"}}><Link color="secondary" component="span">設定画面からスコアの保存先を変更する</Link></RLink>。
            </p>
          </Alert>
        )}
        <ButtonGroup disableElevation variant="contained" color="secondary" fullWidth>
          <Button disabled={!showFinished} onClick={this.toggleFinished}>開催中/開催予定</Button>
          <Button disabled={showFinished} onClick={this.toggleFinished}>終了済み</Button>
        </ButtonGroup>
        <InfiniteScroll
          pageStart={0}
          loadMore={()=>this.next()}
          hasMore={!isLast}
          initialLoad={false}
        >
        <List>
          {rankingList.map((item,i)=>{
            const isBetween = _isBetween(new Date().toString(),timeFormatter(0,item.since._seconds * 1000),timeFormatter(0,item.until._seconds * 1000));
            const isBefore = isBeforeSpecificDate(new Date(),item.since._seconds * 1000);
            const period = ()=>{
              if(isBetween) return "(開催中)";
              if(!isBetween && isBefore) return "(開催予定)";
              if(!isBetween && !isBefore) return "";
            }
            return (
              <div key={i}>
                <ListItem button alignItems="flex-start" onClick={()=>this.handleOpenRanking(item.cid)}>
                  <ListItemAvatar>
                    <Avatar alt={item.authorRef ? item.authorRef.displayName : ""} src={getAltTwitterIcon(item.authorRef ? item.authorRef : "")} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={(item.rankName || "無題のランキング") + " " + period()}
                    secondary={
                      <React.Fragment>
                        <Typography
                          component="span"
                          variant="body2"
                          color="textPrimary"
                        >
                          {item.title}
                        </Typography>
                        &nbsp;{item.sum + "人が参加中("+timeDiff(item.until._seconds * 1000)+")"}
                      </React.Fragment>
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </div>
            )
          })}
          </List>
          {isLoading && <Loader text="読み込んでいます"/>}
          {isLast && (
            <div style={{display:"flex",alignItems:"center",flexDirection:"column"}}>
              <ArrowDropUpIcon/>
              <small style={{color:"#ccc"}}>これで全部です!</small>
            </div>
          )}
          </InfiniteScroll>
          {auth &&
            <Button startIcon={<AddIcon/>} onClick={()=>this.handleOpenCreateModal(false)} fullWidth>ランキングを作成</Button>
          }
          {auth &&
            <SpeedDial
              ariaLabel="menu"
              style={{position:"fixed",bottom:"8%",right:"8%"}}
              icon={<SpeedDialIcon icon={<MenuIcon/>} openIcon={<CloseIcon/>} />}
              onClose={this.toggleDial}
              onOpen={this.toggleDial}
              open={dialOpen}
              direction={"up"}
            >
              {actions.map((action) => (
                <SpeedDialAction
                  key={action.name}
                  icon={action.icon}
                  tooltipTitle={action.name}
                  tooltipOpen
                  onClick={action.onClick}
                />
              ))}
            </SpeedDial>
          }
          {isOpenRanking &&
            <WeeklyModal isOpen={isOpenRanking} rankingId={currentRankingId} handleOpen={this.handleOpenRanking}/>
          }
          {isOpenCreateModal &&
            <CreateModal isOpen={isOpenCreateModal} handleOpen={this.handleOpenCreateModal}/>
          }
          {isOpenUserPage && <ModalUser initialView={5} isOpen={isOpenUserPage} exact currentUserName={auth.uid} handleOpen={(flag:boolean)=>this.handleModalOpen(flag)}/>}
      </Container>
    );
  }
}



export default withRouter(injectIntl(RankingSearch));
