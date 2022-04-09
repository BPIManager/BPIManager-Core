import React from 'react';
import Grid from '@mui/material/Grid';
import { Twitter as TwitterIcon } from "@/assets/twitter";
import { Line as LINEIcon } from "@/assets/line";
import { Link, List, ListSubheader } from '@mui/material';
import { DefListCard } from '@/view/pages/user';

export default class ShareButtons extends React.Component<{ withTitle: boolean, url?: string, text?: string }, {}> {

  render() {
    return (
      <Grid container spacing={1} justifyContent="center">
        <Grid item xs={2} style={{ display: "flex", justifyContent: "center" }}>
          <Link target="_blank" href={`https://social-plugins.line.me/lineit/share?url=${this.props.url || window.location.href}`}>
            <LINEIcon />
          </Link>
        </Grid>
        <Grid item xs={2} style={{ display: "flex", justifyContent: "center" }}>
          <Link target="_blank" href={`https://twitter.com/intent/tweet?url=${this.props.url || window.location.href}&text=${encodeURIComponent(this.props.withTitle ? (this.props.text || "BPIManagerを使っています:") : "")}&hashtags=BPIM&related=BPIManager`}>
            <TwitterIcon />
          </Link>
        </Grid>
      </Grid>
    );
  }
}

export class ShareList extends React.Component<{ withTitle: boolean, url?: string, text?: string, disableSubHeader?: boolean }, {}> {

  render() {

    const buttons = [
      { icon: <LINEIcon />, primary: "LINEでシェア", secondary: "", onClick: () => window.open(`https://social-plugins.line.me/lineit/share?url=${this.props.url || window.location.href}`) },
      { icon: <TwitterIcon />, primary: "Twitterでシェア", secondary: "", onClick: () => window.open(`https://twitter.com/intent/tweet?url=${this.props.url || window.location.href}&text=${encodeURIComponent(this.props.withTitle ? (this.props.text || "BPIManagerを使っています:") : "")}&hashtags=BPIM&related=BPIManager`) },
    ]
    return (
      <List subheader={this.props.disableSubHeader ? <span/> : <ListSubheader>プロフィールをシェア</ListSubheader>}>
        {buttons.map((item, i) => {
          return (
            <DefListCard key={i} onAction={item.onClick} disabled={false} icon={item.icon}
              primaryText={item.primary} secondaryText={item.secondary} />
          )
        })
        }
      </List>
    );
  }
}

export class ShareOnTwitter extends React.Component<{
  url?: string,
  text?: string,
  isNotInline?: boolean
}, {}>{
  render() {
    return (
      <Link target="_blank" href={`https://twitter.com/intent/tweet?url=${this.props.url || window.location.href}&text=${encodeURIComponent(this.props.text || "")}&hashtags=BPIM&related=BPIManager`} style={{ display: this.props.isNotInline ? "flex" : "inline-block", padding: "0 5px" }}>
        <TwitterIcon  />
      </Link>
    )
  }
}

export const getShareURL = (url: string, text: string) => `https://twitter.com/intent/tweet?url=${url || window.location.href}&text=${encodeURIComponent(text || "")}&hashtags=BPIM&related=BPIManager`;
