import { alternativeImg } from "@/components/common";
import { getAltTwitterIcon, getTwitterName } from "@/components/rivals";
import { _currentStore, _currentTheme } from "@/components/settings";
import { Avatar, Button, Grid, Skeleton, Typography } from "@mui/material";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import TwitterIcon from "@mui/icons-material/Twitter";
import React from "react";
import FollowButton from "./followButton";
const getIIDXId = (input: string) => {
  const match = input.match(/\d{4}(-|)\d{4}/);
  return match ? match[0].replace(/[^\d]/g, "") : "";
};
const background = () => {
  const themeColor = _currentTheme();
  if (themeColor === "deepsea")
    return "linear-gradient(0, rgba(0,13,25,1) 0%, rgba(0,42,82,1) 100%)";
  if (themeColor === "dark")
    return "linear-gradient(0, rgba(10,10,10,1) 0%, rgba(37,37,37,1) 100%)";
  return "linear-gradient(0, rgba(255,255,255,1) 0%, rgba(255,212,212,1) 100%)";
};

const SubHeader: React.FC<{
  title: string;
  body: string;
}> = ({ title, body }) => (
  <Grid xs={4} style={{ textAlign: "center" }}>
    <p style={{ fontSize: "9px", margin: 0 }}>{title}</p>
    <p style={{ fontSize: "20px", margin: "4px 0 0 0" }}>{body}</p>
  </Grid>
);

const UserHeader: React.FC<{
  meta: any;
  myId: string;
  myDisplayName: string;
}> = ({ meta, myId, myDisplayName }) => {
  const themeColor = _currentTheme();
  if (!meta) return null;
  return (
    <div
      style={{
        background: background(),
        display: "flex",
        padding: "3vh 0 1vh 0",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <div
        style={{
          color: themeColor === "light" ? "#222" : "#fff",
          width: "90%",
        }}
      >
        <Grid container alignItems="center">
          <SubHeader title="アリーナランク" body={meta.arenaRank || "-"} />
          <Grid
            item
            xs={4}
            sx={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <Avatar
              style={{ border: "1px solid #222", margin: "15px auto" }}
              className="userpageIcon"
            >
              <img
                src={
                  meta.photoURL
                    ? meta.photoURL.replace("_normal", "")
                    : "noimage"
                }
                style={{ width: "100%", height: "100%" }}
                alt={meta.displayName}
                onError={(e) =>
                  ((e.target as HTMLImageElement).src =
                    getAltTwitterIcon(meta) || alternativeImg(meta.displayName))
                }
              />
            </Avatar>
          </Grid>
          <SubHeader
            title="総合BPI"
            body={String(Number.isNaN(meta.totalBPI) ? "-" : meta.totalBPI)}
          />
        </Grid>
        <Typography
          variant="h4"
          style={{ overflow: "hidden", textAlign: "center" }}
        >
          {meta.displayName}
        </Typography>
        <div style={{ margin: "0 8px 15px", textAlign: "center" }}>
          <Typography variant="caption" gutterBottom>
            {meta.profile}
          </Typography>
          <Typography
            variant="caption"
            component="p"
            gutterBottom
            style={{
              marginTop: "4px",
              color: themeColor === "light" ? "#888" : "#aaa",
            }}
          >
            {meta.timeStamp}
          </Typography>
        </div>
        <Grid container style={{ display: "flex", alignItems: "center" }}>
          <Grid item xs={4}>
            <form
              method="post"
              name="rivalSearch"
              action={`https://p.eagate.573.jp/game/2dx/${_currentStore()}/rival/rival_search.html#rivalsearch`}
            >
              <input
                type="hidden"
                name="iidxid"
                value={getIIDXId(meta.profile)}
              />
              <input type="hidden" name="mode" value="1" />
              <Button
                color="secondary"
                size="small"
                type="submit"
                fullWidth
                disabled={!getIIDXId(meta.profile)}
                startIcon={<ExitToAppIcon />}
              >
                IIDX公式
              </Button>
            </form>
          </Grid>
          <Grid item xs={4}>
            <FollowButton
              myId={myId}
              myDisplayName={myDisplayName}
              meta={meta}
            />
          </Grid>
          <Grid item xs={4}>
            <Button
              color="secondary"
              size="small"
              fullWidth
              disabled={!meta.twitter && !getTwitterName(meta.profile)}
              onClick={() =>
                window.open(
                  `https://twitter.com/${
                    meta.twitter || getTwitterName(meta.profile)
                  }`
                )
              }
              startIcon={<TwitterIcon />}
            >
              Twitter
            </Button>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

const SkeletonSubHeader = () => <Grid item xs={4} />;

export const LoadingHeader: React.FC = () => {
  const themeColor = _currentTheme();
  return (
    <div
      style={{
        background: background(),
        display: "flex",
        padding: "3vh 0 1vh 0",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <div
        style={{
          color: themeColor === "light" ? "#222" : "#fff",
          width: "90%",
        }}
      >
        <Grid container alignItems="center" sx={{ textAlign: "center" }}>
          <SkeletonSubHeader />
          <Grid
            item
            xs={4}
            sx={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Skeleton
              animation="wave"
              variant="circular"
              className="userpageIcon"
            />
          </Grid>
          <SkeletonSubHeader />
        </Grid>
      </div>
    </div>
  );
};

export default UserHeader;
