import React from "react";
import {config} from "../../config";

declare global {
    interface Window { adsbygoogle: any; }
}

export default class Ad extends React.Component<{slot:string},{}> {


  componentDidMount() {
    if(window) (window.adsbygoogle = window.adsbygoogle || []).push({});
  };

  render() {
    return (
      <ins className="adsbygoogle"
        data-ad-client={config.client}
        data-ad-slot={this.props.slot}
        style={{display:"block"}}
        data-ad-format="fluid"
        data-ad-layout-key="-fb+5w+4e-db+86"></ins>
    );
  }
};
