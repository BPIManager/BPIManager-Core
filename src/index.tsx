import 'react-app-polyfill/ie11';
import * as React from "react";
import * as ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import firebase from 'firebase/app';
import 'firebase/messaging';

ReactDOM.render(<App />, document.getElementById("root"));
if (firebase.messaging.isSupported()){
  const messaging = firebase.messaging();
  if (navigator.serviceWorker) {
    navigator.serviceWorker.register('/firebase-messaging-sw.js').then(() => {
      return navigator.serviceWorker.ready;
    }).then(registration => {
      messaging.useServiceWorker(registration);
    }).catch(error => {
      console.error(error);
    });
  }
}
