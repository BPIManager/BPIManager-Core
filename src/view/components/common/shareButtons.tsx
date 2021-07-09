import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import {ReactComponent as TwitterIcon} from "@/assets/twitter.svg";
import {ReactComponent as LINEIcon} from "@/assets/line.svg";
import { Link } from '@material-ui/core';

export default class ShareButtons extends React.Component<{withTitle:boolean,url?:string,text?:string},{}> {

  render(){
    return (
    <Grid container spacing={1} justify="center">
      <Grid item xs={2} style={{display:"flex",justifyContent:"center"}}>
        <Link target="_blank" href={`https://social-plugins.line.me/lineit/share?url=${this.props.url || window.location.href}`}>
            <LINEIcon style={{width:"20px",height:"20px"}} />
        </Link>
      </Grid>
      <Grid item xs={2} style={{display:"flex",justifyContent:"center"}}>
        <Link target="_blank" href={`https://twitter.com/intent/tweet?url=${this.props.url || window.location.href}&text=${encodeURIComponent(this.props.withTitle ? (this.props.text || "BPIManagerを使っています:") : "")}&hashtags=BPIM&related=BPIManager`}>
            <TwitterIcon style={{width:"20px",height:"20px"}} />
        </Link>
      </Grid>
    </Grid>
    );
  }
}

export class ShareOnTwitter extends React.Component<{
  url?:string,
  text?:string,
  isNotInline?:boolean
},{}>{
  render(){
    return (
      <Link target="_blank" href={`https://twitter.com/intent/tweet?url=${this.props.url || window.location.href}&text=${encodeURIComponent(this.props.text || "")}&hashtags=BPIM&related=BPIManager`} style={{display:this.props.isNotInline ? "flex" : "inline-block",padding:"0 5px"}}>
        <TwitterIcon style={{width:"20px",height:"20px",display:"inline-block"}} />
      </Link>
    )
  }
}

export const getShareURL = (url:string,text:string)=>`https://twitter.com/intent/tweet?url=${url || window.location.href}&text=${encodeURIComponent(text|| "")}&hashtags=BPIM&related=BPIManager`;
