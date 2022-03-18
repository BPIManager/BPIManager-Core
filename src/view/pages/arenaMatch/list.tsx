import React from 'react';
import Loader from '@/view/components/common/loader';
import List from '@mui/material/List';
import { getRadar, radarData } from '@/components/stats/radar';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import fbArenaMatch from "@/components/firebase/arenaMatch";
import UserCard from '@/view/components/arenaMatch/card';
import {
  QuerySnapshot, DocumentData, Unsubscribe
} from "firebase/firestore";

interface S {
  isLoading: boolean,
  matchList: any[],
  radarNode:radarData[]
}

class Index extends React.Component<{} & RouteComponentProps, S> {

  unsubscribe: Unsubscribe | null = null;

  constructor(props: {} & RouteComponentProps) {
    super(props);
    this.state = {
      isLoading: true,
      matchList: [] as any[],
      radarNode:[]
    }
  }

  async componentDidMount() {
    this.setState({radarNode:await getRadar(),isLoading:false})
    const f = new fbArenaMatch();
    this.unsubscribe = f.realtime(f.list(), this.watch);
  }

  watch = (snapshot: QuerySnapshot<DocumentData>) => {
    snapshot.docChanges().forEach((change) => {
      const matchList = new Array().concat(this.state.matchList);
      if (change.type === "added") {
        matchList.push(change.doc.data());
      }
      if (change.type === "modified") {
        const newData = change.doc.data();
        matchList.forEach((item,index) => {
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

  render() {
    const { isLoading, matchList,radarNode } = this.state;

    if (isLoading) {
      return (<Loader />);
    }
    return (
      <React.Fragment>
        <List>
          {matchList.map((item: any) => {
            return (
              <UserCard history={this.props.history} key={item.uid} radarNode={radarNode} open={()=>null} item={item} processing={false} />
            )
          })}
        </List>
      </React.Fragment>
    );
  }
}

export default withRouter(Index);
