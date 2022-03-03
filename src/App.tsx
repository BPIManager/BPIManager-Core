import * as React from 'react';
import "@/styles/App.css";
import Router from "./route";
import Initialize from "./components/initialize";
import { ThemeProvider, Theme, StyledEngineProvider } from '@mui/material/styles';
import CssBaseline from "@mui/material/CssBaseline";
import Dark from './themes/dark';
import Light from './themes/light';
import DarkNavy from './themes/deepsea';
import { Provider, Subscribe } from 'unstated';
import GlobalContainer from './components/context/global';
import fb from "@/components/firebase";
import { isSupported, getToken, getMessaging, onMessage } from 'firebase/messaging';
import { pubkey, messanger } from './components/firebase/message';


declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme { }
}


export default class App extends React.Component<{}, {}> {

  async componentDidMount() {
    if (await isSupported()) {
      const m = new messanger();
      try {
        const messaging = getMessaging(fb);

        console.log("Public key successfully set.");
        getToken(messaging, { vapidKey: pubkey }).then((currentToken) => {
          if (currentToken) {
            console.log("FCM token has been expired. Pulled up to the server.");
            m.refreshToken(currentToken);
          }
        }).catch((err) => {
          console.log('An error occurred while retrieving token. ', err);
        });
        console.log("Initialized FCM");

        onMessage(messaging,payload => {
          console.log("[FOREGROUND]Message received. ", payload);
        });
      } catch (e: any) {
        console.log(e);
        alert("Your device is supporting FCM but an error occured while setting up functions.");
      }
    } else {
      console.log("Firebase Cloud Messaging is not supported on this device.")
    }
  }

  render() {
    document.title = "BPIManager";
    return (
      <Provider>
        <Subscribe to={[GlobalContainer]}>
          {global => {
            const c = global.state.theme;
            return (
              <StyledEngineProvider injectFirst>
                <ThemeProvider theme={c === "dark" ? Dark : c === "light" ? Light : DarkNavy}>
                  <CssBaseline />
                  <Initialize global={global} />
                  <div id={c === "dark" ? "__dark" : c === "light" ? "__light" : "__deepsea"}>
                    <Router global={global} />
                  </div>
                </ThemeProvider>
              </StyledEngineProvider>
            );
          }}
        </Subscribe>
        <div className="SW-update-dialog"></div>
      </Provider>
    );
  }

}
