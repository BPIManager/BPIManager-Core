import * as React from 'react';
import "@/styles/App.css";
import Router from "./route";
import Initialize from "./components/initialize";
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from "@material-ui/core/CssBaseline";
import Dark from './themes/dark';
import Light from './themes/light';
import DarkNavy from './themes/deepsea';
import { Provider, Subscribe } from 'unstated';
import GlobalContainer from './components/context/global';
import firebase from 'firebase/app';
import 'firebase/messaging';
import { pubkey, messanger } from './components/firebase/message';

export default class App extends React.Component<{},{}> {

  componentDidMount(){
    if(firebase.messaging.isSupported()){
      const m = new messanger();
      try{
        const messaging = firebase.messaging();
        console.log("Public key successfully set.");
        messaging.usePublicVapidKey(pubkey);
        messaging.onTokenRefresh(function() {
          messaging.getToken().then(function(refreshedToken) {
            console.log("FCM token has been expired. Pulled up to the server.");
            m.refreshToken(refreshedToken);
          });
        });
        console.log("Initialized FCM");

        messaging.onMessage(payload => {
          console.log("[FOREGROUND]Message received. ", payload);
        });
      }catch(e){
        console.log(e);
        alert("Your device is supporting FCM but an error occured while setting up functions.");
      }
    }else{
      console.log("Firebase Cloud Messaging is not supported on this device.")
    }
  }

  render(){
    document.title = "BPI Manager";
    return (
      <Provider>
        <Subscribe to={[GlobalContainer]}>
          {global =>{
            const c = global.state.theme;
            return (
              <ThemeProvider theme={c === "dark" ? Dark : c === "light" ? Light : DarkNavy}>
                <CssBaseline />
                <Initialize global={global}/>
                <div id={c === "dark" ? "__dark" : c === "light" ? "__light" : "__deepsea"}>
                  <Router global={global}/>
                </div>
              </ThemeProvider>)
            }}
          </Subscribe>
        <div className="SW-update-dialog"></div>
      </Provider>
    );
  }

}
