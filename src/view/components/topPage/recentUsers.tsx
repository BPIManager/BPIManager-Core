import { alternativeImg } from "@/components/common";
import { getAltTwitterIcon } from "@/components/rivals";
import {
  Avatar,
  Button,
  Container,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import React from "react";
import { FormattedMessage } from "react-intl";
import Loader from "../common/loader";
import ModalUser from "../rivals/modal";
import SubHeader from "./subHeader";
import PeopleIcon from "@mui/icons-material/People";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import fbActions from "@/components/firebase/actions";
import totalBPI from "@/components/bpi/totalBPI";
import { _apiFetch } from "@/components/common/rankApi";

export default class RecentUsers extends React.Component<
  { history: any },
  {
    loading: boolean;
    list: any[];
    open: boolean;
    username: string;
    maintenance: boolean;
  }
> {
  state = {
    loading: true,
    maintenance: false,
    list: [],
    open: false,
    username: "",
  };

  componentDidMount() {
    this.getRecentUsers();
  }

  handleModalOpen = (flag: boolean) => this.setState({ open: flag });
  open = (uid: string) => this.setState({ open: true, username: uid });

  getRecentUsers = async () => {
    const fbA = new fbActions();
    fbA.auth().onAuthStateChanged(async (user: any) => {
      const total = await (await new totalBPI().load()).currentVersion();
      const gt = total > 60 ? 50 : total - 2;
      const lt = total > 50 ? 100 : total + 5;
      const res = await _apiFetch("users/getRecommend", { gt: gt, lt: lt });
      if (res.error || res.maintenance) {
        return this.setState({
          maintenance: res.maintenance,
          loading: false,
          list: [],
        });
      }
      return this.setState({
        maintenance: res.maintenance,
        loading: false,
        list: res.body
          .filter((item: any) => {
            if (user) {
              return user.uid !== item.uid;
            }
            return true;
          })
          .sort((a: any, b: any) => {
            return (
              Math.abs(total - (Number(a.totalBPI) || -15)) -
              Math.abs(total - (Number(b.totalBPI) || -15))
            );
          })
          .slice(0, 5),
      });
    });
  };

  render() {
    const { loading, list, open, username, maintenance } = this.state;
    const { history } = this.props;
    return (
      <React.Fragment>
        <Container style={{ marginTop: 24 }}>
          <SubHeader icon={<PeopleIcon />} text="あなたに実力が近いユーザー" />
          {loading && (
            <div style={{ marginTop: 8 }}>
              <Loader />
            </div>
          )}
          {!loading && maintenance && (
            <Typography variant="caption" color="textSecondary">
              現在この機能はメンテナンス中のためご利用いただけません。
              <br />
              (毎日午前3時~午前5時は一部機能がご利用いただけなくなります。)
            </Typography>
          )}
          {!loading && !maintenance && (
            <React.Fragment>
              <List>
                {list.map((item: any) => (
                  <ListItem
                    key={item.uid}
                    button
                    onClick={() => this.open(item.displayName)}
                    style={{ padding: "5px 0" }}
                  >
                    <ListItemAvatar>
                      <Avatar>
                        <img
                          src={
                            item.photoURL
                              ? item.photoURL.replace("_normal", "")
                              : "noimage"
                          }
                          style={{ width: "100%", height: "100%" }}
                          alt={item.displayName}
                          onError={(e) =>
                            ((e.target as HTMLImageElement).src =
                              getAltTwitterIcon(item) ||
                              alternativeImg(item.displayName))
                          }
                        />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={item.displayName}
                      secondary={item.arenaRank + " / 総合BPI:" + item.totalBPI}
                    />
                  </ListItem>
                ))}
              </List>
              <Button
                startIcon={<ArrowRightIcon />}
                fullWidth
                size="small"
                onClick={() => history.push("/rivals?tab=1")}
              >
                <FormattedMessage id="ShowMore" />
              </Button>
            </React.Fragment>
          )}
        </Container>
        {open && (
          <ModalUser
            isOpen={open}
            currentUserName={username}
            handleOpen={(flag: boolean) => this.handleModalOpen(flag)}
          />
        )}
      </React.Fragment>
    );
  }
}
