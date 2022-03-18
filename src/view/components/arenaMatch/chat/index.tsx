import React from 'react';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import fbActions from "@/components/firebase/actions";
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
import ReactTimeAgo from 'react-time-ago';

import {
  QuerySnapshot, DocumentData, Unsubscribe
} from "firebase/firestore";

interface P {
  id: string
}

class Chat extends React.Component<P, {
  user: any,
  isLoading: boolean,
}> {

  state = { user: null as any, isLoading: true }

  async componentDidMount() {
    const fbA = new fbActions();
    const user = fbA.authInfo();
    if (!user) return this.setState({ isLoading: false });

    const userData = await fbA.setDocName(user.uid).getSelfUserData()
    if (!userData.exists()) return this.setState({ isLoading: false });

    this.setState({
      user: userData.data(),
      isLoading: false
    })
  }

  render() {
    if (this.state.isLoading) {
      return (
        <React.Fragment>
          <LinearProgress color="secondary" style={{ margin: "8px 0" }} />
          <p style={{ textAlign: "center" }}>ルームに接続しています</p>
        </React.Fragment>
      )
    }
    return (
      <React.Fragment>
        <Container>
          <View id={this.props.id} user={this.state.user} />
          <TxtForm id={this.props.id} user={this.state.user} />
        </Container>
      </React.Fragment>
    );
  }
}

export default Chat;

class View extends React.Component<{
  id: string,
  user: any
}, {
    messages: any[],
    isModalOpen: boolean,
    currentUserName: string,
    initialState: boolean,
  }>{

  boxRef = React.createRef<HTMLDivElement>();
  unsubscribe: Unsubscribe | null = null;

  state = {
    messages: [] as any[],
    isModalOpen: false,
    currentUserName: "",
    initialState: true
  }

  async componentDidMount() {
    const f = new fbArenaMatch();
    this.unsubscribe = f.realtime(f.getMessages(this.props.id), this.watch);
  }

  watch = (snapshot: QuerySnapshot<DocumentData>) => {
    snapshot.docChanges().forEach((change) => {
      const messages = new Array().concat(this.state.messages);
      if (change.type === "added") {
        const data = change.doc.data({ serverTimestamps: "estimate" });
        messages.push(data);
      }
      this.setState({ messages: messages, initialState: false });
      this.boxRef ?.current ?.scrollIntoView(false);
      return;
    });
  }

  handleModalOpen = (flag: boolean) => this.setState({ isModalOpen: flag });
  open = (uid: string) => this.setState({ isModalOpen: true, currentUserName: uid })

  render() {
    const { messages, isModalOpen, currentUserName, initialState } = this.state;
    if (initialState) {
      return (
        <React.Fragment>
          <LinearProgress color="secondary" style={{ margin: "8px 0" }} />
          <p style={{ textAlign: "center" }}>ルームに接続しています</p>
        </React.Fragment>
      )
    }
    return (
      <React.Fragment>
        <List sx={{ width: "100%", maxHeight: "360px", overflowY: "scroll", marginBottom: "8px" }}>
          {messages.sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis()).map((item) => {
            const avatar = () => (
              <ListItemAvatar>
                <Avatar onClick={() => this.open(item.displayName)}>
                  <img src={item.photoURL ? item.photoURL : "noimg"} style={{ width: "100%", height: "100%" }}
                    alt={item.displayName}
                    onError={(e) => (e.target as HTMLImageElement).src = getAltTwitterIcon(item, false, "normal") || alternativeImg(item.displayName)} />
                </Avatar>
              </ListItemAvatar>
            );
            const date = () => <ReactTimeAgo date={item.createdAt.toDate()} locale="en-US" timeStyle="twitter" />;
            const thisIsMyText = this.props.user ? item.uid === this.props.user.uid : false;
            return (
              <ListItem alignItems="flex-start" key={item.createdAt}>
                {!thisIsMyText && avatar()}
                <ListItemText
                  style={{ textAlign: thisIsMyText ? "right" : "left", marginRight: thisIsMyText ? "16px" : "0" }}
                  primary={(
                    <Typography variant="caption">
                      {thisIsMyText && date()}
                      &nbsp;{item.displayName}&nbsp;
                      {!thisIsMyText && date()}
                    </Typography>)}
                  secondary={
                    <React.Fragment>
                      <Typography
                        sx={{ display: 'inline' }}
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
            )
          })}
          <div ref={this.boxRef} />
        </List>
        {isModalOpen && <ModalUser isOpen={isModalOpen} currentUserName={currentUserName} handleOpen={(flag: boolean) => this.handleModalOpen(flag)} />}
      </React.Fragment>
    );
  }
}


class TxtForm extends React.Component<{
  id: string,
  user: any
}, {
    txt: string
  }>{

  state = { txt: "" }

  change = (e: any) => {
    this.setState({ txt: e.target.value });
  }

  send = async () => {
    const { txt } = this.state;
    const { id, user } = this.props;
    if (!txt) return;
    const fb = new fbArenaMatch();
    await fb.enterChat(id, txt, user);
    return this.setState({ txt: "" });
  }

  render() {
    const { txt } = this.state;
    const { user } = this.props;
    if (!user) return (
      <Typography variant="body1">
        <RefLink to="/sync/settings"><Link color="secondary">チャットに参加するにはログインしてください。</Link></RefLink>
      </Typography>
    );
    return (
      <FormControl variant="standard" fullWidth>
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
