import React from 'react';
import Loader from '@/view/components/common/loader';
import List from '@mui/material/List';
import { getRadar, radarData } from '@/components/stats/radar';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import fbArenaMatch from "@/components/firebase/arenaMatch";
import fbActions from "@/components/firebase/actions";
import UserCard from '@/view/components/arenaMatch/card';
import {
  QuerySnapshot, DocumentData, Unsubscribe
} from "firebase/firestore";
import CreateDialog from "@/view/components/arenaMatch/dialogs/create";
import Button from "@mui/material/Button";
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";

const defaultChecks = ["A1", "A2", "A3", "A4", "A5", "B1", "B2", "B3", "B4", "B5"];

interface S {
  isLoading: boolean,
  matchList: any[],
  radarNode: radarData[],
  createDialog: boolean,
  currentChecks: string[],
  firstView: boolean
}

class Index extends React.Component<{} & RouteComponentProps, S> {

  unsubscribe: Unsubscribe | null = null;

  constructor(props: {} & RouteComponentProps) {
    super(props);
    this.state = {
      isLoading: true,
      matchList: [] as any[],
      radarNode: [],
      createDialog: false,
      currentChecks: defaultChecks,
      firstView: true,
    }
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  openCreateDialog = () => this.setState({ createDialog: !this.state.createDialog });

  async componentDidMount() {
    this.setState({ radarNode: await getRadar(), isLoading: false })
    const f = new fbArenaMatch();
    this.unsubscribe = f.realtime(await f.list(), this.watch);
  }

  watch = (snapshot: QuerySnapshot<DocumentData>) => {
    this.setState({ firstView: false });
    if (snapshot.empty) {
      this.setState({ isLoading: false });
    }
    snapshot.docChanges().forEach((change) => {
      let matchList = ([] as any[]).concat(this.state.matchList);
      if (change.type === "added") {
        matchList.push(change.doc.data());
      }
      if (change.type === "modified") {
        const newData = change.doc.data();
        matchList.forEach((item, index) => {
          if (item.matchId === newData.matchId) {
            matchList[index] = newData;
          }
        });
      }
      if (change.type === "removed") {
        const removed = change.doc.data();
        matchList = matchList.filter((item) => item.matchId !== removed.matchId);
      }
      return this.setState({ matchList: matchList });
    });
  }

  isAvailableMyMatch = () => {
    const auth = new fbActions().authInfo();
    if (auth && auth.uid && this.state.matchList.find((item) => item.uid === auth.uid)) {
      return true;
    }
    return false;
  }

  openMyMatch = () => {
    const auth = new fbActions().authInfo();
    if (auth && auth.uid) {
      const myMatch = this.state.matchList.find((item) => item.uid === auth.uid);
      this.props.history.push("/arena/" + myMatch.matchId);
    }
  }

  handleChange = (target: string, _event: React.ChangeEvent<HTMLInputElement>) => {
    const { currentChecks } = this.state;
    if (currentChecks.indexOf(target) > -1) {
      this.setState({ currentChecks: currentChecks.filter((item) => item !== target) });
    } else {
      this.setState({ currentChecks: currentChecks.concat(target) });
    }
  }

  reverseChecks = () => {
    const { currentChecks } = this.state;
    this.setState({ currentChecks: defaultChecks.filter(item => currentChecks.indexOf(item) === -1) });
  }

  uid = () => new fbActions().authInfo()?.uid;

  render() {
    const { firstView, isLoading, createDialog, matchList, radarNode, currentChecks } = this.state;
    const alreadyOwns = this.isAvailableMyMatch();
    if (isLoading) {
      return (<Loader />);
    }
    const style = {
      borderRadius: 0, borderLeft: 0, borderRight: 0
    }
    return (
      <React.Fragment>
        {!this.uid() && <Button fullWidth style={style} color="secondary" variant="outlined" onClick={() => this.props.history.push("/sync/settings")}>ルームの作成にはログインが必要です</Button>}
        {(this.uid() && alreadyOwns) && <Button fullWidth style={style} color="secondary" variant="outlined" onClick={this.openMyMatch}>自分のルームを表示</Button>}
        {(this.uid() && !alreadyOwns) && <Button fullWidth style={style} color="secondary" variant="outlined" onClick={this.openCreateDialog}>新しいルームを作成</Button>}
        <Filter currentChecks={currentChecks} reverse={this.reverseChecks} handleChange={this.handleChange} />
        {!firstView && matchList.filter((item) => currentChecks.indexOf(item.arenaRank) > -1).length === 0 && (
          <Alert severity="error">
            <AlertTitle>ルームがありません</AlertTitle>
            <p>まだ誰もルームを作成していないようです。<br/>
            <b>「新しいルームを作成」ボタンからルームを作成</b>し、バトル相手を募りましょう！</p>
          </Alert>
        )}
        <List>
          {matchList.filter((item) => currentChecks.indexOf(item.arenaRank) > -1).map((item: any) => {
            return (
              <UserCard history={this.props.history} key={item.uid} radarNode={radarNode} open={() => null} item={item} processing={false} />
            )
          })}
        </List>
        {createDialog && <CreateDialog toggle={this.openCreateDialog} />}
      </React.Fragment>
    );
  }
}

class Filter extends React.Component<{
  currentChecks: string[],
  handleChange: (item: string, e: React.ChangeEvent<HTMLInputElement>) => void,
  reverse: () => void
}, {}>{
  render() {
    return (
      <Alert icon={false} severity="info" variant="outlined" style={{ margin: 15 }}>
        <FormControl component="fieldset" fullWidth>
          <FormLabel component="legend">ルームのランクを選択 / <span onClick={this.props.reverse} style={{ textDecoration: "underline" }}>状態反転</span></FormLabel>
          <FormGroup row={true} style={{ justifyContent: "space-around" }}>
            {defaultChecks.map((item) => (
              <FormControlLabel
                key={item}
                control={
                  <Checkbox checked={this.props.currentChecks.indexOf(item) > -1} onChange={(e) => this.props.handleChange(item, e)} name={item} />
                }
                label={item}
              />
            ))}
          </FormGroup>
        </FormControl>
      </Alert>
    );
  }
}

export default withRouter(Index);
