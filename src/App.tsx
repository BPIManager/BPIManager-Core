import * as React from 'react';
import "./styles/App.css";
import Router from "./route";
import Initialize from "./components/initialize";
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from "@material-ui/core/CssBaseline";
import defaultTheme from './themes/dark';

export default function App() {

  document.title = "BPI Manager";
  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <Initialize/>
      <Router/>
    </ThemeProvider>
  );

}
