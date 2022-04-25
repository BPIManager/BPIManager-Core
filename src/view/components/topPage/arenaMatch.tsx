import { alternativeImg } from "@/components/common";
import { updatedTime } from "@/components/common/timeFormatter";
import fbArenaMatch from "@/components/firebase/arenaMatch";
import { getAltTwitterIcon } from "@/components/rivals";
import {
  Button,
  Container,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import React from "react";
import { FormattedMessage } from "react-intl";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import SubHeader from "./subHeader";

export default class ArenaMatch extends React.Component<
  { history: any },
  { list: any[] }
> {
  state = {
    list: [],
  };

  componentDidMount() {
    this.getRoomList();
  }

  getRoomList = async () => {
    const fbArena = new fbArenaMatch();
    fbArena.realtime(await fbArena.list(), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        let matchList = ([] as any[]).concat(this.state.list);
        if (change.type === "added") {
          matchList.push(change.doc.data());
        }
        if (change.type === "modified") {
          const newData = change.doc.data();
          matchList.forEach((item, index) => {
            if (item.matchId === newData.matchId) {
              matchList[index] = newData;
            }
          });
        }
        if (change.type === "removed") {
          const removed = change.doc.data();
          console.log(change.doc.data());
          matchList = matchList.filter(
            (item) => item.matchId !== removed.matchId
          );
        }
        return this.setState({
          list: matchList.slice(0, 5),
        });
      });
    });
  };

  render() {
    const { list } = this.state;
    const { history } = this.props;
    return (
      <React.Fragment>
        <Container style={{ marginTop: 24 }}>
          <SubHeader icon={<AccessTimeIcon />} text="ArenaMatch で待機中" />
          {list.length === 0 && <div style={{ marginTop: 8 }}></div>}
          {list.length > 0 && (
            <React.Fragment>
              <List>
                {list.map((item: any) => (
                  <ListItem
                    key={item.uid}
                    button
                    onClick={() => history.push("/arena/" + item.matchId)}
                    style={{ padding: "5px 0" }}
                  >
                    <ListItemAvatar>
                      <Avatar>
                        <img
                          src={
                            item.admin.photoURL
                              ? item.admin.photoURL.replace("_normal", "")
                              : "noimage"
                          }
                          style={{ width: "100%", height: "100%" }}
                          alt={item.admin.displayName}
                          onError={(e) => {
                            return ((e.target as HTMLImageElement).src =
                              getAltTwitterIcon(item.admin) ||
                              alternativeImg(item.admin.displayName));
                          }}
                        />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={item.admin.displayName}
                      secondary={
                        item.arenaRank +
                        " / 総合BPI:" +
                        item.admin.totalBPI +
                        " / " +
                        updatedTime(item.updatedAt.toDate())
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </React.Fragment>
          )}
          <Button
            startIcon={<ArrowRightIcon />}
            fullWidth
            size="small"
            onClick={() => history.push("/arena")}
          >
            <FormattedMessage id="ShowMore" /> / ルーム作成
          </Button>
        </Container>
      </React.Fragment>
    );
  }
}
