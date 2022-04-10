import React from 'react';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import { alternativeImg } from "@/components/common";
import { getAltTwitterIcon } from "@/components/rivals";
import Avatar from "@mui/material/Avatar";
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import fbArenaMatch from "@/components/firebase/arenaMatch";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import { Link as RefLink } from 'react-router-dom';
import ModalUser from '@/view/components/rivals/modal';
import LinearProgress from '@mui/material/LinearProgress';
import Divider from "@mui/material/Divider";
import ReactTimeAgo from 'react-time-ago';
import { ShareList } from "@/view/components/common/shareButtons";
import Badge from "@mui/material/Badge";

import {
  QuerySnapshot, DocumentData, Unsubscribe
} from "firebase/firestore";

interface P {
  id: string,
  detail: any,
  user: any,
}

class Chat extends React.Component<P, {
    messages: any[],
    isModalOpen: boolean,
    currentUserName: string,
    initialState: boolean,
    commentBoxHeight: string,
    viewBoxHeight: string,
  }>{

  boxRef = React.createRef<HTMLDivElement>();
  unsubscribe: Unsubscribe | null = null;

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  state = {
    messages: [] as any[],
    isModalOpen: false,
    currentUserName: "",
    initialState: true,
    commentBoxHeight: "360px",
    viewBoxHeight: "400px",
  }

  async componentDidMount() {
    const f = new fbArenaMatch();
    this.unsubscribe = f.realtime(f.getMessages(this.props.id), this.watch);
  }

  watch = (snapshot: QuerySnapshot<DocumentData>) => {
    snapshot.docChanges().forEach((change) => {
      const messages = ([] as any).concat(this.state.messages);
      if (change.type === "added") {
        const data = change.doc.data({ serverTimestamps: "estimate" });
        messages.push(data);
      }
      this.setState({ messages: messages, initialState: false });
      this.boxRef ?.current ?.scrollIntoView(false);
      this.setHeight();
      return;
    });
  }

  setHeight = () => {
    const d = (mx: string) => document.getElementById(mx) ?.clientHeight || 0;
    const header = d("mxHeaderBox");
    const tab = d("mxTabBox");
    const comment = d("mxCommentBox");
    const gHeader = 56;
    return this.setState({
      commentBoxHeight: `calc( 100vh - ${header + tab + comment + gHeader + 75}px )`,
      viewBoxHeight: `calc( 100vh - ${header + tab + gHeader + 75}px )`
    });
  }

  handleModalOpen = (flag: boolean) => this.setState({ isModalOpen: flag });
  open = (uid: string) => {
    if (uid === "サーバーからのメッセージ") return;
    this.setState({ isModalOpen: true, currentUserName: uid })
  }

  render() {
    const { messages, isModalOpen, currentUserName, initialState, commentBoxHeight, viewBoxHeight } = this.state;
    if (initialState) {
      return (
        <React.Fragment>
          <LinearProgress color="secondary" style={{ margin: "8px 0" }} />
          <p style={{ textAlign: "center" }}>ルームに接続しています</p>
        </React.Fragment>
      )
    }
    return (
      <Container style={{ height: viewBoxHeight }}>
        <List sx={{ width: "100%", maxHeight: commentBoxHeight, overflowY: "scroll", marginBottom: "8px" }}>
          {messages.sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis()).map((item) => {
            const avatar = () => (
              <ListItemAvatar onClick={() => this.open(item.displayName)}>
                <Badge
                  color="primary"
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }} badgeContent={item.arenaRank}>
                  <Avatar>
                    <img src={item.photoURL ? item.photoURL.replace("_normal", "") : "noimg"} style={{ width: "100%", height: "100%" }}
                      alt={item.displayName}
                      onError={(e) => (e.target as HTMLImageElement).src = getAltTwitterIcon(item, false, "normal") || alternativeImg(item.displayName)} />
                  </Avatar>
                </Badge>
              </ListItemAvatar>
            );
            const millis = item.createdAt.toMillis();
            const date = () => <ReactTimeAgo date={item.createdAt.toDate()} locale="en-US" timeStyle="twitter" />;
            const thisIsMyText = this.props.user ? item.uid === this.props.user.uid : false;
            return (
              <React.Fragment key={millis}>
                <ListItem alignItems="flex-start">
                  {!thisIsMyText && avatar()}
                  <ListItemText
                    style={{ textAlign: thisIsMyText ? "right" : "left", marginRight: thisIsMyText ? "16px" : "0" }}
                    primary={(
                      <Typography variant="caption">
                        {thisIsMyText && <span style={{ opacity: .5 }}>{date()}&nbsp;</span>}
                        {item.displayName}
                        {!thisIsMyText && <span style={{ opacity: .5 }}>&nbsp;{date()}</span>}
                      </Typography>)}
                    secondary={
                      <React.Fragment>
                        <Typography
                          sx={{ display: 'inline' }}
                          style={{ whiteSpace: 'pre-line' }}
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {item.body}
                        </Typography>
                      </React.Fragment>
                    }
                  />
                  {thisIsMyText && avatar()}
                </ListItem>
                {item.displayName === "サーバーからのメッセージ" && (
                  <React.Fragment>
                    <div style={{ marginTop: "5px" }}>
                      <ShareList withTitle={true} disableSubHeader text={`アリーナモードで対戦相手を待っています(アリーナランク:${this.props.detail.arenaRank}) `} />
                    </div>
                    <Divider style={{ margin: "8px 0" }} />
                  </React.Fragment>
                )}
              </React.Fragment>
            )
          })}
          <div ref={this.boxRef} />
        </List>
        {isModalOpen && <ModalUser isOpen={isModalOpen} currentUserName={currentUserName} handleOpen={(flag: boolean) => this.handleModalOpen(flag)} />}
        <TxtForm detail={this.props.detail} id={this.props.id} user={this.props.user} />
      </Container>
    );
  }
}


class TxtForm extends React.Component<{
  id: string,
  user: any,
  detail: any
}, {
    txt: string
  }>{

  state = { txt: "" }

  change = (e: any) => {
    this.setState({ txt: e.target.value.substr(0, 1000) });
  }

  send = async () => {
    const { txt } = this.state;
    const { id, user } = this.props;
    if (!txt) return;
    const fb = new fbArenaMatch();
    if (txt.indexOf("/timer set") > -1) {
      const p = txt.match(/[0-9]+/g);
      if (!p) {
        await fb.enterChat(id, "無効なコマンドです: " + txt, user);
      } else {
        if (this.props.detail.uid !== user.uid) {
          await fb.enterChat(id, "/timer: タイマーの操作権限がありません", user);
        } else {
          await fb.setTimer(p[0], id);
          await fb.enterChat(id, "/timer: タイマーを" + p[0] + "秒にセットしました", user);
        }
      }
      return this.setState({ txt: "" });
    }
    if (txt.indexOf("/rand") > -1) {
      await fb.randChat(id, user);
      return this.setState({ txt: "" });
    }
    await fb.enterChat(id, txt, user);
    return this.setState({ txt: "" });
  }

  render() {
    const { txt } = this.state;
    const { user } = this.props;
    if (!user) return (
      <Typography variant="body1" id="mxCommentBox">
        <RefLink to="/sync/settings"><Link color="secondary">チャットに参加するにはログインしてください。</Link></RefLink>
      </Typography>
    );
    return (
      <FormControl variant="standard" fullWidth id="mxCommentBox">
        <InputLabel>
          {user.displayName ? user.displayName + " / Enterで送信" : ""}
        </InputLabel>
        <Input
          value={txt}
          onChange={this.change}
          onKeyDown={e => {
            if (e.key === "Enter") {
              this.send()
            }
          }}
          startAdornment={
            <InputAdornment position="start">
              <Avatar style={{ width: 24, height: 24 }}>
                <img src={user.photoURL ? user.photoURL : "noimg"} style={{ width: "100%", height: "100%" }}
                  alt={user.displayName}
                  onError={(e) => (e.target as HTMLImageElement).src = getAltTwitterIcon(user, false, "normal") || alternativeImg(user.displayName)} />
              </Avatar>
            </InputAdornment>
          }
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                edge="end"
                onClick={this.send}
              >
                <SendIcon />
              </IconButton>
            </InputAdornment>
          }
        />
      </FormControl>
    );
  }
}

export default Chat;
