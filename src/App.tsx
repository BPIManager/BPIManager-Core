import * as React from 'react';
import "./styles/App.css";
import Router from "./route";
import Initialize from "./components/initialize";
class App extends React.Component<{},{}> {

  render(){
    return (
      <div>
        <Initialize/>
        <Router/>
      </div>
    );
  }
}

export default App;
