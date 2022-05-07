import React from "react";
import AppBar from "../view/components/header/appBar";
import { IntlProvider } from "react-intl";
import Data from "../view/pages/data";
import Songs from "../view/pages/songs";
import ListsBody from "../view/pages/lists/listBody";
import Lists from "../view/pages/lists";
import NotPlayed from "../view/pages/notPlayed";
import Stats from "../view/pages/stats";
import Settings from "../view/pages/settings";
import Compare from "../view/pages/compare";
import Rivals from "../view/pages/rivals";
import User, { NotFound } from "../view/pages/user";
import AAATable from "../view/pages/AAATable";
import ArenaMatchIndex from "../view/pages/arenaMatch";
import ArenaMatchDetail from "../view/pages/arenaMatch/detail";
import { BrowserRouter, Route, Switch } from "react-router-dom";

//locale data

import ja from "../i18n/ja";
import en from "../i18n/en";
import SyncIndex from "../view/components/sync";

//

import fbActions from "../components/firebase/actions";
import { _currentStore, _isSingle } from "../components/settings";
import RivalChallengeLetters from "../view/components/rivals/rivalChallengeLetters";
import Note from "@/view/pages/note";
import NoteIndv from "@/view/pages/noteIndv";
import Camera from "@/view/pages/camera/camera";
import RedirectMyProfile from "@/view/pages/extra/myprofile";
import RedirectUserProfile from "@/view/pages/extra/user";
import Index from "@/view/pages/index";
import History from "@/view/pages/history";
import { Container as UnstatedContainer } from "unstated";

export const Router: React.FC<{ global: UnstatedContainer<any> }> = (props) => {
  const globalUpdateScore = async (uName: string) => {
    const f = new fbActions();
    const t = await f.v2SetUserCollection().setDocName(uName).load();
    await f
      .setColName(`${_currentStore()}_${_isSingle()}`)
      .setDocName(uName)
      .save(t && t.displayName ? t.displayName : "");
  };
  const global = props.global;

  return (
    <IntlProvider
      locale={global.state.lang}
      messages={global.state.lang === "ja" ? ja : en}
    >
      <BrowserRouter>
        <AppBar global={global}>
          <Switch>
            <Route
              path="/"
              exact
              render={(_props) => <Index global={global} />}
            />
            <Route
              path="/data/:docId?"
              exact
              render={(_props) => <Data updateGlobal={globalUpdateScore} />}
            />
            <Route path="/songs/:today?" exact component={Songs} />
            <Route path="/lists" exact component={Lists} />
            <Route path="/lists/:listTitle" exact component={ListsBody} />
            <Route path="/notPlayed" exact component={NotPlayed} />
            <Route path="/stats" exact component={Stats} />
            <Route path="/compare" exact component={Compare} />
            <Route
              path="/settings"
              exact
              render={(_props) => <Settings global={global} />}
            />
            <Route path="/sync/settings" exact component={SyncIndex} />
            <Route path="/rivals" exact component={Rivals} />
            <Route
              path="/rivalCompare"
              exact
              component={RivalChallengeLetters}
            />
            <Route path="/AAATable" exact component={AAATable} />
            <Route path="/u/:uid/:exactId?" exact component={User} />
            <Route
              path="/redirect/myprofile"
              exact
              component={RedirectMyProfile}
            />
            <Route path="/r/u/:uid" exact component={RedirectUserProfile} />
            <Route path="/notes" exact component={Note} />
            <Route path="/history/:date?" exact component={History} />
            <Route
              path="/notes/:title/:diff/:single"
              exact
              component={NoteIndv}
            />
            <Route path="/camera" exact component={Camera} />
            <Route path="/arena" exact component={ArenaMatchIndex} />
            <Route path="/arena/:docId" exact component={ArenaMatchDetail} />
            <Route path="*">
              <NotFound isInUserPage={false} />
            </Route>
          </Switch>
        </AppBar>
      </BrowserRouter>
    </IntlProvider>
  );
};

export default Router;
