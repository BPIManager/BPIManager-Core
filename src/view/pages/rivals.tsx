import * as React from 'react';
import Container from '@mui/material/Container';
import { injectIntl } from 'react-intl';
import RivalView from "@/view/components/rivals/view";
import ShowSnackBar from '@/view/components/snackBar';
import RivalIndex from '@/view/components/rivals';
import { rivalScoreData, rivalStoreData, DBRivalStoreData } from '@/types/data';
import { withRouter, RouteComponentProps } from 'react-router-dom';

interface S {
  currentView: number
  currentUser: string,
  message: string,
  showSnackBar: boolean,
  rivalMeta: DBRivalStoreData | rivalStoreData | null,
  descendingRivalData?: rivalScoreData[],
  lastVisible: rivalStoreData | null,
  arenaRank: string,
  recentView: number,
}

class Stats extends React.Component<{ intl: any } & RouteComponentProps, S> {

  constructor(props: { intl: any } & RouteComponentProps) {
    super(props);
    const search = new URLSearchParams(props.location.search);
    const tab = Number(search.get("tab"));
    this.state = {
      currentView: 0,
      currentUser: "",
      message: "",
      showSnackBar: false,
      lastVisible: null,
      arenaRank: "すべて",
      recentView: tab || 0,
      rivalMeta: null,
    }
  }

  showEachRival = (rivalMeta: DBRivalStoreData) => this.setState({ recentView: 0, currentView: 1, currentUser: rivalMeta.uid, rivalMeta: rivalMeta, descendingRivalData: [], });
  compareUser = (rivalMeta: rivalStoreData, rivalBody: rivalScoreData[], last: rivalStoreData, arenaRank: string, currentPage: number) => {
    return this.setState({ recentView: currentPage, lastVisible: currentPage === 2 ? last : null, currentView: 2, rivalMeta: rivalMeta, descendingRivalData: rivalBody, arenaRank: arenaRank });
  }
  backToMainPage = () => this.setState({ currentView: 0, currentUser: "" });
  toggleSnack = (message: string = "ライバルを削除しました") => this.setState({ message: message, showSnackBar: !this.state.showSnackBar });

  render() {
    const { currentView, currentUser, message, showSnackBar, rivalMeta, descendingRivalData, lastVisible, arenaRank, recentView } = this.state;
    if (currentView === 0) return <RivalIndex showEachRival={this.showEachRival} compareUser={this.compareUser} backToRecentPage={recentView} last={lastVisible} arenaRank={arenaRank} />
    return (
      <Container fixed style={{ margin: "20px auto" }}>
        {(rivalMeta && currentView === 1) && <RivalView showAllScore={false} toggleSnack={this.toggleSnack} backToMainPage={this.backToMainPage} rivalData={currentUser} rivalMeta={rivalMeta} />}
        {(rivalMeta && currentView === 2) && <RivalView showAllScore={false} toggleSnack={this.toggleSnack} backToMainPage={this.backToMainPage} rivalData={rivalMeta.uid} rivalMeta={rivalMeta} descendingRivalData={descendingRivalData} isNotRival={true} />}
        <ShowSnackBar message={message} variant="success"
          handleClose={this.toggleSnack} open={showSnackBar} autoHideDuration={3000} />
      </Container>
    );
  }
}

export default withRouter(injectIntl(Stats));
