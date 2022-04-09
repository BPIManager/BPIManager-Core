import React, { useState } from 'react';
import Container from '@mui/material/Container';
import { injectIntl } from 'react-intl';
import RivalView from "@/view/components/rivals/view";
import ShowSnackBar from '@/view/components/snackBar';
import RivalIndex from '@/view/components/rivals';
import { rivalScoreData, rivalStoreData, DBRivalStoreData } from '@/types/data';
import { withRouter, RouteComponentProps } from 'react-router-dom';

const RivalRoot: React.FC<{ intl: any } & RouteComponentProps> = props => {

  const search = new URLSearchParams(props.location.search);
  const tab = Number(search.get("tab"));

  const [currentView, setCurrentView] = useState<{ user: string, view: number }>({ user: "", view: 0 });
  const [snackBar, setSnackBar] = useState<{ message: string, visible: boolean }>({ message: "", visible: false });
  const [descendingRivalData, setDescendingRivalData] = useState<rivalScoreData[]>([]);
  const [lastVisible, setLastVisible] = useState<rivalStoreData | null>(null);
  const [arenaRank, setArenaRank] = useState<string>("すべて");
  const [recentView, setRecentView] = useState<number>(tab || 0);
  const [rivalMeta, setRivalMeta] = useState<DBRivalStoreData | rivalStoreData | null>(null);

  const showEachRival = (rivalMeta: DBRivalStoreData) => {
    setRecentView(0);
    setCurrentView({ user: rivalMeta.uid, view: 1 });
    setRivalMeta(rivalMeta);
    setDescendingRivalData([]);
  }

  const compareUser = (rivalMeta: rivalStoreData, rivalBody: rivalScoreData[], last: rivalStoreData, arenaRank: string, currentPage: number) => {
    setRecentView(currentPage);
    setLastVisible(currentPage === 2 ? last : null);
    setCurrentView({ user: rivalMeta.uid, view: 2 });
    setRivalMeta(rivalMeta);
    setDescendingRivalData(rivalBody);
    setArenaRank(arenaRank);
  }

  const backToMainPage = () => setCurrentView({ user: "", view: 0 });
  const toggleSnack = (message: string = "ライバルを削除しました") => setSnackBar({ message: message, visible: !snackBar.visible });


  if (currentView.view === 0) return (
    <RivalIndex showEachRival={showEachRival} compareUser={compareUser} backToRecentPage={recentView} last={lastVisible} arenaRank={arenaRank} />
  );

  return (
    <Container fixed style={{ margin: "20px auto" }}>
      {(rivalMeta && currentView.view === 1) && (
        <RivalView showAllScore={false} toggleSnack={toggleSnack} backToMainPage={backToMainPage} rivalData={currentView.user} rivalMeta={rivalMeta} />
      )}
      {(rivalMeta && currentView.view === 2) && (
        <RivalView showAllScore={false} toggleSnack={toggleSnack} backToMainPage={backToMainPage} rivalData={rivalMeta.uid} rivalMeta={rivalMeta} descendingRivalData={descendingRivalData} isNotRival={true} />
      )}
      <ShowSnackBar message={snackBar.message} variant="success"
        handleClose={toggleSnack} open={snackBar.visible} autoHideDuration={3000} />
    </Container>
  );

}

export default withRouter(injectIntl(RivalRoot));
