import React, { useState, useEffect, useCallback } from "react";
import { arenaRankColor, bgColorByBPI } from "@/components/common";
import Chip from "@mui/material/Chip";
import { updatedTime } from "@/components/common/timeFormatter";
import { getAltTwitterIcon } from "@/components/rivals";
import { _currentStore } from "@/components/settings";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import { radarData } from "@/components/stats/radar";
import Radar from "@/view/components/rivals/viewComponents/ui/radar";
import Grid from "@mui/material/Grid";
import { UserIcon } from "../../common/icon";

const UserCard: React.FC<{
  item: any;
  open: (q: string) => void;
  processing: boolean;
  radarNode?: radarData[];
  history: any;
}> = (props) => {
  const [radar, setRadar] = useState<radarData[]>([]);

  const concatRadar = useCallback(() => {
    const { item, radarNode } = props;
    if (!radarNode || !item.admin) return [];
    const node = radarNode.slice().map((row) => Object.assign({}, row));
    let res = [];
    for (let i = 0; i < node.length; ++i) {
      const itemName = node[i]["title"];
      if (!item.admin.radar || !item.admin.radar[itemName]) {
        res = [];
        break;
      }
      node[i]["rivalTotalBPI"] = item.admin.radar[itemName];
      res.push(node[i]);
    }
    return setRadar(res);
  }, [props]);

  useEffect(() => {
    concatRadar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { item } = props;

  return (
    <React.Fragment>
      <ListItem
        button
        alignItems="flex-start"
        onClick={() => props.history.push("/arena/" + item.matchId)}
      >
        <ListItemAvatar onClick={() => props.open(item.admin.displayName)}>
          <UserIcon
            _legacy
            disableZoom
            defaultURL={item.admin.photoURL}
            text={item.admin.displayName}
            altURL={getAltTwitterIcon(item.admin, false, "normal")}
          />
        </ListItemAvatar>
        <ListItemText
          primary={
            <React.Fragment>
              {item.title}&nbsp;
              <small>{updatedTime(item.updatedAt.toDate())}</small>
            </React.Fragment>
          }
          secondary={
            <React.Fragment>
              <Tooltip title={"アリーナランク"}>
                <Chip
                  component="span"
                  size="small"
                  style={{
                    backgroundColor: arenaRankColor(item.arenaRank),
                    color: "#fff",
                    margin: "5px 0",
                  }}
                  label={item.arenaRank || "-"}
                />
              </Tooltip>
              {!isNaN(item.admin.totalBPI) && (
                <Tooltip title={"総合BPI"}>
                  <Chip
                    component="span"
                    size="small"
                    style={{
                      backgroundColor: bgColorByBPI(item.admin.totalBPI),
                      color: "#fff",
                      margin: "0 0 0 5px",
                    }}
                    label={
                      item.admin.totalBPIs
                        ? item.admin.totalBPIs[_currentStore()]
                        : item.admin.totalBPI
                    }
                  />
                </Tooltip>
              )}
              {item.description && (
                <span style={{ margin: "0", display: "block" }}>
                  {" "}
                  {item.description}
                </span>
              )}
            </React.Fragment>
          }
        />
      </ListItem>
      {radar && radar.length > 0 && (
        <Grid container>
          <Grid item xs={false} sm={7}></Grid>
          <Grid item xs={12} sm={5}>
            <div style={{ display: "block", width: "100%", height: "200px" }}>
              <Radar withoutLegend outerRadius={60} radar={radar} />
            </div>
          </Grid>
        </Grid>
      )}
    </React.Fragment>
  );
};

export default UserCard;
