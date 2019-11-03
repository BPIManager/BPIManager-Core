import * as React from 'react';
import AppBar from "../view/components/header/appBar";
import { IntlProvider } from 'react-intl'
import Index from "../view/pages";
import Data from "../view/pages/data";
import Songs from "../view/pages/songs";
import Favorite from "../view/pages/favorites";
import NotPlayed from "../view/pages/notPlayed";
import Stats from "../view/pages/stats";
import Settings from "../view/pages/settings";
import Compare from "../view/pages/compare";
import {BrowserRouter, Route} from "react-router-dom";


//locale data

import ja  from "../i18n/ja";
import en from "../i18n/en";
import GlobalContainer from '../components/context/global';
import { Subscribe, Provider } from 'unstated';

//
export default class Router extends React.Component<{},{}> {

  render(){
    return (
      <Provider>
        <Subscribe to={[GlobalContainer]}>
          {global =>{
            console.log(global);
            return (<IntlProvider
              locale={global.state.lang}
              messages={global.state.lang === "ja" ? ja : en}
            >
              <BrowserRouter>
                <AppBar global={global}/>
                <Route path="/" exact component={Index}/>
                <Route path="/data" exact render={_props=><Data global={global}/>}/>
                <Route path="/songs" exact component={Songs}/>
                <Route path="/favorite" exact component={Favorite}/>
                <Route path="/notPlayed" exact component={NotPlayed}/>
                <Route path="/stats" exact component={Stats}/>
                <Route path="/compare" exact component={Compare}/>
                <Route path="/settings" exact component={Settings}/>
              </BrowserRouter>
            </IntlProvider>
          )}}
        </Subscribe>
      </Provider>
    );
  }

}
