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

interface S {
  isLoading: boolean,
  matchList: any[],
  radarNode: radarData[],
  createDialog: boolean,
}

class Index extends React.Component<{} & RouteComponentProps, S> {

  unsubscribe: Unsubscribe | null = null;

  constructor(props: {} & RouteComponentProps) {
    super(props);
    this.state = {
      isLoading: true,
      matchList: [] as any[],
      radarNode: [],
      createDialog: false
    }
  }

  openCreateDialog = () => this.setState({ createDialog: !this.state.createDialog });

  async componentDidMount() {
    this.setState({ radarNode: await getRadar(), isLoading: false })
    const f = new fbArenaMatch();
    this.unsubscribe = f.realtime(f.list(), this.watch);
  }

  watch = (snapshot: QuerySnapshot<DocumentData>) => {
    snapshot.docChanges().forEach((change) => {
      const matchList = ([] as any[]).concat(this.state.matchList);
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
        matchList.filter((item) => item.matchId !== removed.matchId);
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

  render() {
    const { isLoading, createDialog, matchList, radarNode } = this.state;
    const alreadyOwns = this.isAvailableMyMatch();
    if (isLoading) {
      return (<Loader />);
    }
    const style = {
      borderRadius:0,borderLeft:0,borderRight:0
    }
    return (
      <React.Fragment>
        {alreadyOwns && <Button fullWidth style={style} color="secondary" variant="outlined" onClick={this.openMyMatch}>自分のルームを表示</Button>}
        {!alreadyOwns && <Button fullWidth style={style} color="secondary" variant="outlined" onClick={this.openCreateDialog}>新しいルームを作成</Button>}
        <List>
          {matchList.map((item: any) => {
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

export default withRouter(Index);
