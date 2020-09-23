import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import { config } from '@/config';
const {LineShareButton,LineIcon,TwitterShareButton,TwitterIcon} = require('react-share');

export default class ShareButtons extends React.Component<{withTitle:boolean,url?:string,text?:string},{}> {

  render(){
    return (
    <Grid container spacing={1} justify="center">
      <Grid item xs={2}>
        <LineShareButton url={this.props.url || window.location.href}>
            <LineIcon size={32} round />
        </LineShareButton>
      </Grid>
      <Grid item xs={2}>
        <TwitterShareButton url={this.props.url || window.location.href} title={this.props.withTitle ? (this.props.text || "BPIManagerを使っています:") : ""}>
            <TwitterIcon size={32} round />
        </TwitterShareButton>
      </Grid>
    </Grid>
    );
  }
}

export class ShareOnTwitter extends React.Component<{
  url?:string,
  text?:string,
},{}>{
  render(){
    return (
      <TwitterShareButton url={this.props.url || config.baseUrl} title={this.props.text || ""} style={{display:"inline-block",padding:"0 5px"}}>
        <TwitterIcon size={20} round style={{display:"inline-block"}} />
      </TwitterShareButton>
    )
  }
}
