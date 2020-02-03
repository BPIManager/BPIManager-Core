import * as React from 'react';
import "./styles/App.css";
import Router from "./route";
import Initialize from "./components/initialize";
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from "@material-ui/core/CssBaseline";
import Dark from './themes/dark';
import Light from './themes/light';
import DarkNavy from './themes/deepsea';
import { Provider, Subscribe } from 'unstated';
import GlobalContainer from './components/context/global';

export default function App() {

  document.title = "BPI Manager";
  return (
    <Provider>
      <Subscribe to={[GlobalContainer]}>
        {global =>{
          const c = global.state.theme;
          return (
            <ThemeProvider theme={c === "dark" ? Dark : c === "light" ? Light : DarkNavy}>
              <CssBaseline />
              <Initialize/>
              <div id={c === "dark" ? "__dark" : c === "light" ? "__light" : "__deepsea"}>
                <Router/>
              </div>
            </ThemeProvider>)
        }}
      </Subscribe>
    </Provider>
  );

}
