import React, { useState, useRef, useEffect } from 'react';
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

const MatchList: React.FC<RouteComponentProps> = ({ history }) => {

  const [loading, setLoading] = useState(true);
  const [createDialog, setCreateDialog] = useState(false);
  const [radarNode, setRadarNode] = useState<radarData[]>([]);
  const [firstView, setFirstView] = useState(true);
  const [matchList, setMatchList] = useState<any[]>([]);
  const [currentChecks, setCurrentChecks] = useState<string[]>(defaultChecks);
  const unsubscribe = useRef<Unsubscribe | null>(null);
  const toggleCreateDialog = () => setCreateDialog(!createDialog);

  const load = async () => {
    setRadarNode(await getRadar());
    const f = new fbArenaMatch();
    unsubscribe.current = f.realtime(await f.list(), watch);
  }

  useEffect(() => {
    load();
    return (()=>{
      if(unsubscribe.current){
        unsubscribe.current();
      }
    })
  }, []);

  const watch = (snapshot: QuerySnapshot<DocumentData>) => {
    setFirstView(false);
    console.log(snapshot.docs);
    if (snapshot.empty) {
      setLoading(false);
    }
    snapshot.docChanges().forEach((change) => {
      let newList = ([] as any[]).concat(matchList);
      if (change.type === "added") {
        newList.push(change.doc.data());
      }
      if (change.type === "modified") {
        const newData = change.doc.data();
        newList.forEach((item, index) => {
          if (item.matchId === newData.matchId) {
            newList[index] = newData;
          }
        });
      }
      if (change.type === "removed") {
        const removed = change.doc.data();
        newList = newList.filter((item) => item.matchId !== removed.matchId);
      }
      setMatchList(newList);
      setLoading(false);
    });
  }

  const isAvailableMyMatch = () => {
    const auth = new fbActions().authInfo();
    return auth && auth.uid && matchList.find((item) => item.uid === auth.uid);
  }

  const openMyMatch = () => {
    const auth = new fbActions().authInfo();
    if (auth && auth.uid) {
      const myMatch = matchList.find((item) => item.uid === auth.uid);
      history.push("/arena/" + myMatch.matchId);
    }
  }

  const handleChange = (target: string, _event: React.ChangeEvent<HTMLInputElement>) => {
    if (currentChecks.indexOf(target) > -1) {
      setCurrentChecks(currentChecks.filter((item) => item !== target));
    } else {
      setCurrentChecks(currentChecks.concat(target));
    }
  }

  const reverseChecks = () => setCurrentChecks(defaultChecks.filter(item => currentChecks.indexOf(item) === -1));

  const uid = () => new fbActions().authInfo() ?.uid;
  const alreadyOwns = isAvailableMyMatch();
  if (loading) {
    return (<Loader />);
  }
  const style = {
    borderRadius: 0, borderLeft: 0, borderRight: 0
  }
  return (
    <React.Fragment>
      {!uid() && <Button fullWidth style={style} color="secondary" variant="outlined" onClick={() => history.push("/sync/settings")}>ルームの作成にはログインが必要です</Button>}
      {(uid() && alreadyOwns) && <Button fullWidth style={style} color="secondary" variant="outlined" onClick={openMyMatch}>自分のルームを表示</Button>}
      {(uid() && !alreadyOwns) && <Button fullWidth style={style} color="secondary" variant="outlined" onClick={toggleCreateDialog}>新しいルームを作成</Button>}
      <Filter currentChecks={currentChecks} reverse={reverseChecks} handleChange={handleChange} />
      {!firstView && matchList.filter((item) => currentChecks.indexOf(item.arenaRank) > -1).length === 0 && (
        <Alert severity="error">
          <AlertTitle>ルームがありません</AlertTitle>
          <p>まだ誰もルームを作成していないようです。<br />
            <b>「新しいルームを作成」ボタンからルームを作成</b>し、バトル相手を募りましょう！</p>
        </Alert>
      )}
      <List>
        {matchList.filter((item) => currentChecks.indexOf(item.arenaRank) > -1).map((item: any) => {
          return (
            <UserCard history={history} key={item.uid} radarNode={radarNode} open={() => null} item={item} processing={false} />
          )
        })}
      </List>
      {createDialog && <CreateDialog toggle={toggleCreateDialog} />}
    </React.Fragment>
  );

}

const Filter: React.FC<{
  currentChecks: string[],
  handleChange: (item: string, e: React.ChangeEvent<HTMLInputElement>) => void,
  reverse: () => void
}> = ({ currentChecks, handleChange, reverse }) => {
  return (
    <Alert icon={false} severity="info" variant="outlined" style={{ margin: 15 }}>
      <FormControl component="fieldset" fullWidth>
        <FormLabel component="legend">ルームのランクを選択 / <span onClick={reverse} style={{ textDecoration: "underline" }}>状態反転</span></FormLabel>
        <FormGroup row={true} style={{ justifyContent: "space-around" }}>
          {defaultChecks.map((item) => (
            <FormControlLabel
              key={item}
              control={
                <Checkbox checked={currentChecks.indexOf(item) > -1} onChange={(e) => handleChange(item, e)} name={item} />
              }
              label={item}
            />
          ))}
        </FormGroup>
      </FormControl>
    </Alert>
  );
}

export default withRouter(MatchList);
