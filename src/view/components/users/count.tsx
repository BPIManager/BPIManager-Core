import React, { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import FolloweeList from "./list";
import { httpsCallable, httpsCfGet } from "@/components/firebase";
import { _currentStore } from "@/components/settings";
import Loader from "../common/loader";
import { Avatar, AvatarGroup, Grid, Tooltip } from "@mui/material";
import { getAltTwitterIcon } from "@/components/rivals";
import { UserIcon } from "../common/icon";

interface P {
  ids: any[];
  body: any[];
  text: string;
  userName: string;
  changeUser: (userName: string) => void;
}

export const FollowList: React.FC<{
  meta: any;
  changeUser: (userName: string) => void;
}> = ({ meta, changeUser }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [followings, setFollowings] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [followingIds, setFollowingIds] = useState<any[]>([]);
  const [followerIds, setFollowerIds] = useState<any[]>([]);
  const [error, setError] = useState<boolean>(false);

  const counts = async (type: number = 0, id: string): Promise<any> => {
    try {
      return await httpsCfGet(
        type === 0 ? `getFollowersCnt` : `getFollowingsCnt`,
        `targetId=${id}&version=${_currentStore()}`
      );
    } catch (e: any) {
      console.log(e);
      return null;
    }
  };
  const details = async (targetArray: string[]) => {
    if (targetArray.length === 0) return [];
    const res: any = await httpsCallable("", "getFolloweeDetails", {
      userIds: targetArray.slice(0, 5),
      version: _currentStore(),
    });
    if (res.data && res.data.body && res.data.body.length > 0) {
      return res.data.body;
    }
    return [];
  };
  const loader = async () => {
    try {
      const er = await counts(0, meta.uid);
      const ing = await counts(1, meta.uid);
      const ids = (p: any): string[] => {
        try {
          return p.reduce((groups: string[], item: any) => {
            if (!groups) groups = [];
            const id = item["_path"]["segments"][1] || null;
            if (id) {
              groups.push(id);
            }
            return groups;
          }, []);
        } catch (e: any) {
          return [];
        }
      };
      if (!er || !ing) {
        setFollowings([]);
        setFollowers([]);
        setLoading(false);
        return;
      }
      setFollowerIds(ids(er.body));
      setFollowingIds(ids(ing.body));
      setFollowers(await details(ids(er.body)));
      setFollowings(await details(ids(ing.body)));
      setLoading(false);
    } catch (e) {
      console.log(e);
      setError(true);
      setLoading(false);
    }
  };
  useEffect(() => {
    loader();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <Loader isLine text="ライバルを読込中です" />;
  }
  if (error) {
    return (
      <Typography
        variant="caption"
        color="textSecondary"
        style={{
          fontWeight: "bold",
          textAlign: "center",
          display: "block",
          marginTop: "12px",
        }}
      >
        ライバルを読み込めませんでした
      </Typography>
    );
  }
  return (
    <Grid container style={{ marginTop: "12px" }}>
      <Grid item xs={6} md={6}>
        <FolloweeCounter
          body={followings}
          ids={followingIds}
          text="ライバル"
          userName={meta.displayName}
          changeUser={changeUser}
        />
      </Grid>
      <Grid item xs={6} md={6}>
        <FolloweeCounter
          body={followers}
          ids={followerIds}
          text="逆ライバル"
          userName={meta.displayName}
          changeUser={changeUser}
        />
      </Grid>
    </Grid>
  );
};

const FolloweeCounter: React.FC<P> = ({
  body,
  ids,
  text,
  userName,
  changeUser,
}) => {
  const [showList, setShowList] = useState(false);
  const toggle = () => setShowList(!showList);

  return (
    <React.Fragment>
      <Typography
        component="p"
        variant="caption"
        color="textSecondary"
        style={{ fontWeight: "bold", textAlign: "center" }}
      >
        {ids.length}&nbsp;{text}
      </Typography>
      <AvatarGroup
        style={{
          justifyContent: "center",
          marginTop: "8px",
          marginLeft: "8px",
        }}
      >
        {body.slice(0, 3).map((item: any) => (
          <Tooltip
            title={item.displayName}
            onClick={() => changeUser(item.displayName)}
          >
            <UserIcon
              _legacy
              disableZoom
              defaultURL={item.photoURL}
              text={item.displayName}
              altURL={getAltTwitterIcon(item, false, "normal")}
            />
          </Tooltip>
        ))}
        {body.length > 3 && (
          <Tooltip title="すべて表示">
            <Avatar onClick={toggle}>+{ids.length - 3}</Avatar>
          </Tooltip>
        )}
      </AvatarGroup>
      {showList && (
        <FolloweeList
          handleClose={toggle}
          ids={ids}
          text={text}
          userName={userName}
        />
      )}
    </React.Fragment>
  );
};
