import React from "react";

declare var window: any


class Adsense extends React.Component<{component:JSX.Element},{}> {
  componentDidMount() {
    if(window){
      window.onload = function() {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    }
  }

  render() {
    return <div style={{margin:"5px auto"}}>{this.props.component}</div>;
  }
}

const Short = () => {
  return (
    null
  );
};

const Display = ()=> {
  return (
    null
   )
}

export const AdShort = () => <Adsense component={<Short/>}/>
export const AdDisplay = () => <Adsense component={<Display/>}/>
