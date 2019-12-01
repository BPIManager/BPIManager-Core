import * as React from 'react';
import "./styles/App.css";
import Router from "./route";
import Initialize from "./components/initialize";
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from "@material-ui/core/CssBaseline";
import Dark from './themes/dark';
import Light from './themes/light';
import ReloadModal from './view/components/update';
import { Provider, Subscribe } from 'unstated';
import GlobalContainer from './components/context/global';

export default function App() {

  document.title = "BPI Manager";
  return (
    <Provider>
      <Subscribe to={[GlobalContainer]}>
        {global =>{
          return (
            <ThemeProvider theme={global.state.theme === "dark" ? Dark : Light}>
              <CssBaseline />
              <Initialize/>
              <div id={global.state.theme === "dark" ? "__dark" : "__light"}>
                <Router/>
              </div>
              <ReloadModal />
            </ThemeProvider>)
        }}
      </Subscribe>
    </Provider>
  );

}
