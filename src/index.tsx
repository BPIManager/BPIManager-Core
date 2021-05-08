//import './components/common/wdyr';

import 'react-app-polyfill/ie11';
import * as React from "react";
import * as ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import ReloadModal from './view/components/update';

ReactDOM.render(<App />, document.getElementById("root"));

serviceWorker.register({
  onUpdate: (registration:ServiceWorkerRegistration) => {
    if (registration.waiting) {
      ReactDOM.render(<ReloadModal registration={registration} />, document.querySelector('.SW-update-dialog'));
    }
  },
});
