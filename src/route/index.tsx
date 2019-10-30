import * as React from 'react';
import AppBar from "../view/components/header/appBar";
import { IntlProvider } from 'react-intl'
import Index from "../view/pages";
import Data from "../view/pages/data";
import Songs from "../view/pages/songs";
import Favorite from "../view/pages/favorites";
import NotPlayed from "../view/pages/notPlayed";
import {BrowserRouter, Route} from "react-router-dom";


//locale data

import ja  from "../i18n/ja";
import en from "../i18n/en";

//
export default class Router extends React.Component<{},{}> {

  chooseLocale(lang:string){
    return lang === "ja" ? ja : en;
  }

  render(){
    const lc = "en";
    return (
      <IntlProvider
        locale={lc}
        messages={this.chooseLocale(lc)}
      >
        <BrowserRouter>
          <AppBar/>
          <Route path="/" exact component={Index}/>
          <Route path="/data" exact component={Data}/>
          <Route path="/songs" exact component={Songs}/>
          <Route path="/favorite" exact component={Favorite}/>
          <Route path="/notPlayed" exact component={NotPlayed}/>
        </BrowserRouter>
      </IntlProvider>
    );
  }

}
