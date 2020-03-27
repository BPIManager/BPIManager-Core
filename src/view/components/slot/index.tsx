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
    <ins className="adsbygoogle"
      style={{display:"inline-block",width:"295px",height:"95px"}}
      data-ad-client="ca-pub-9237861069664679"
      data-ad-slot="3297665612"/>
  );
};

const Display = ()=> {
  return (
    <ins className="adsbygoogle"
     style={{display:"block"}}
     data-ad-client="ca-pub-9237861069664679"
     data-ad-slot="3297665612"
     data-ad-format="auto"
     data-full-width-responsive="true"/>
   )
}

export const AdShort = () => <Adsense component={<Short/>}/>
export const AdDisplay = () => <Adsense component={<Display/>}/>
