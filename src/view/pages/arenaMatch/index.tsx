import React from 'react';
import MatchList from "./list";
import { _currentTheme } from '@/components/settings';
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";

const Index: React.FC = () => {
  const themeColor = _currentTheme();
  return (
    <React.Fragment>
      <div style={{ background: `url("/images/background/${themeColor}.svg")`, backgroundSize: "cover" }} id="mxHeaderBox">
        <div style={{ background: themeColor === "light" ? "transparent" : "rgba(0,0,0,0)", display: "flex", padding: "30px 8px", width: "100%", height: "100%", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
          <Typography variant="h5">
            ArenaMatch
        </Typography>
          <Typography variant="caption" style={{ marginTop: 15, textAlign: "center" }}>
            アリーナ / BPLバトル向けチャットツール<br />
            <Link color="secondary" target="_blank" href="https://docs2.poyashi.me/docs/social/match/">使い方はこちら</Link>
          </Typography>
        </div>
      </div>
      <MatchList />
    </React.Fragment>
  );

}

export default Index;
