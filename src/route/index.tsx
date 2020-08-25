import * as React from 'react';
import AppBar from "../view/components/header/appBar";
import { IntlProvider } from 'react-intl'
import Index from "../view/pages";
import Data from "../view/pages/data";
import Songs from "../view/pages/songs";
import ListsBody from "../view/pages/lists/listBody";
import Lists from "../view/pages/lists";
import NotPlayed from "../view/pages/notPlayed";
import Stats from "../view/pages/stats";
import Settings from "../view/pages/settings";
import Compare from "../view/pages/compare";
import Help from "../view/pages/help";
import Rivals from "../view/pages/rivals";
import User from "../view/pages/user";
import AAATable from "../view/pages/AAATable";
import Tools from "../view/pages/tools";
import Shared from "../view/pages/shared";
import {BrowserRouter, Route} from "react-router-dom";


//locale data

import ja  from "../i18n/ja";
import en from "../i18n/en";
import GlobalContainer from '../components/context/global';
import { Subscribe, Provider } from 'unstated';
import SyncIndex from '../view/components/sync';

//

import fbActions from '../components/firebase/actions';
import { _currentStore, _isSingle } from '../components/settings';
import RivalChallengeLetters from '../view/components/rivals/rivalChallengeLetters';
import Note from '@/view/pages/note';
import NoteIndv from '@/view/pages/noteIndv';
import HelpNotes from '@/view/pages/helpNotes';
import SitemapGen from '@/view/pages/sitemap';

export default class Router extends React.Component<{},{}> {

  async globalUpdateScore(uName:string){
    const f = new fbActions();
    const t = await f.setColName("users").setDocName(uName).load();
    await f.setColName(`${_currentStore()}_${_isSingle()}`).setDocName(uName).save((t && t.displayName) ? t.displayName : "");
  }

  render(){
    return (
      <Provider>
        <Subscribe to={[GlobalContainer]}>
          {global =>{
            return (<IntlProvider
              locale={global.state.lang}
              messages={global.state.lang === "ja" ? ja : en}
            >
              <BrowserRouter>
                <AppBar global={global}>
                  <Route path="/" exact render={_props=><Index global={global}/>}/>
                  <Route path="/data" exact render={_props=><Data global={global} updateGlobal={this.globalUpdateScore}/>}/>
                  <Route path="/songs" exact component={Songs}/>
                  <Route path="/lists" exact component={Lists}/>
                  <Route path="/lists/:listTitle" exact component={ListsBody}/>
                  <Route path="/notPlayed" exact component={NotPlayed}/>
                  <Route path="/stats" exact component={Stats}/>
                  <Route path="/compare" exact component={Compare}/>
                  <Route path="/settings" exact render={_props=><Settings global={global}/>}/>
                  <Route path="/help" exact component={Help}/>
                  <Route path="/help/notes" exact component={HelpNotes}/>
                  <Route path="/sync" exact component={SyncIndex}/>
                  <Route path="/rivals" exact component={Rivals}/>
                  <Route path="/rivalCompare" exact component={RivalChallengeLetters}/>
                  <Route path="/AAATable" exact component={AAATable}/>
                  <Route path="/tools" exact component={Tools}/>
                  <Route path="/share/:id" exact component={Shared}/>
                  <Route path="/u/" exact component={User}/>
                  <Route path="/u/:uid" exact component={User}/>
                  <Route path="/notes" exact component={Note}/>
                  <Route path="/notes/:title/:diff/:single" exact component={NoteIndv}/>
                  <Route path="/sitemap" exact component={SitemapGen}/>
                </AppBar>
              </BrowserRouter>
            </IntlProvider>
          )}}
        </Subscribe>
      </Provider>
    );
  }

}
