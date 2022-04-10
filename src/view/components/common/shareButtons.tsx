import React from 'react';
import Grid from '@mui/material/Grid';
import { Twitter as TwitterIcon } from "@/assets/twitter";
import { Line as LINEIcon } from "@/assets/line";
import { Link, List, ListSubheader } from '@mui/material';
import { DefListCard } from '@/view/pages/user';

interface P { withTitle: boolean, url?: string, text?: string, disableSubHeader?: boolean }

const getURL = (text: string, url?: string) => (
  `https://twitter.com/intent/tweet?url=${url || window.location.href}&text=${encodeURIComponent(text)}&hashtags=BPIM&related=BPIManager`
);

const ShareButtons: React.FC<P> = ({ withTitle, url, text }) => (
  <Grid container spacing={1} justifyContent="center">
    <Grid item xs={2} style={{ display: "flex", justifyContent: "center" }}>
      <Link target="_blank" href={`https://social-plugins.line.me/lineit/share?url=${url || window.location.href}`}>
        <LINEIcon />
      </Link>
    </Grid>
    <Grid item xs={2} style={{ display: "flex", justifyContent: "center" }}>
      <Link target="_blank" href={getURL(withTitle ? (text || "BPIManagerを使っています:") : "", url)}>
        <TwitterIcon />
      </Link>
    </Grid>
  </Grid>
)

export default ShareButtons;

export const ShareList: React.FC<P> = ({ withTitle, url, text, disableSubHeader }) => {
  const buttons = [
    {
      icon: <LINEIcon />,
      primary: "LINEでシェア",
      secondary: "",
      onClick: () => window.open(`https://social-plugins.line.me/lineit/share?url=${url || window.location.href}`)
    },
    {
      icon: <TwitterIcon />,
      primary: "Twitterでシェア",
      secondary: "",
      onClick: () => window.open(getURL(withTitle ? (text || "BPIManagerを使っています:") : "", url))
    },
  ]
  return (
    <List subheader={disableSubHeader ? <span /> : <ListSubheader>プロフィールをシェア</ListSubheader>}>
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

export const ShareOnTwitter: React.FC<{ url?: string, text?: string, isNotInline?: boolean }> = ({ url, text, isNotInline }) => (
  <Link
    target="_blank" href={getURL(text || "", url)}
    style={{ display: isNotInline ? "flex" : "inline-block", padding: "0 5px" }}>
    <TwitterIcon />
  </Link>
)

export const getShareURL = (url: string, text: string) => `https://twitter.com/intent/tweet?url=${url || window.location.href}&text=${encodeURIComponent(text || "")}&hashtags=BPIM&related=BPIManager`;
