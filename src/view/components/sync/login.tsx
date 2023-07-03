import React from "react";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import fbActions from "@/components/firebase/actions";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import IconButton from "@mui/material/IconButton";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ListSubheader from "@mui/material/ListSubheader";
import LockIcon from "@mui/icons-material/Lock";
import Avatar from "@mui/material/Avatar";
import { avatarFontColor, avatarBgColor } from "@/components/common";
import Alert from "@mui/material/Alert";
import Link from "@mui/material/Link";
import { FormattedMessage } from "react-intl";

class SyncLoginScreen extends React.Component<
  {
    mode: number;
  },
  {}
> {
  private fbA: fbActions = new fbActions();

  render() {
    return (
      <React.Fragment>
        <Paper style={{ padding: "15px" }}>
          <Avatar
            style={{
              background: avatarBgColor,
              color: avatarFontColor,
              margin: "10px auto",
              padding: "35px",
              fontSize: "25px",
            }}
          >
            <LockIcon fontSize="large" />
          </Avatar>
          <Typography
            component="h5"
            variant="h5"
            style={{ textAlign: "center", marginTop: "10px" }}
          >
            <FormattedMessage id={"SignIn"} />
          </Typography>
          <Divider style={{ margin: "10px 0" }} />
          <List
            subheader={
              <ListSubheader component="div" disableSticky>
                <FormattedMessage id={"SignInWith"} />
              </ListSubheader>
            }
          >
            {[
              {
                name: "Twitter",
                func: () => this.fbA.authWithTwitter(),
                desc: "",
              },
              {
                name: "Google",
                func: () => this.fbA.authWithGoogle(),
                desc: "",
              },
              { name: "LINE", func: () => this.fbA.authWithLINE(), desc: "" },
            ].map((item, i) => {
              return (
                <ListItem key={i} button onClick={item.func}>
                  <ListItemText
                    primary={
                      <span>
                        <FormattedMessage id={"SignInWithPre"} />
                        {item.name}
                        <FormattedMessage id={"SignInWithAfter"} />
                      </span>
                    }
                    secondary={item.desc}
                  />
                  <ListItemSecondaryAction onClick={item.func}>
                    <IconButton edge="end" size="large">
                      <ArrowForwardIosIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
          <Divider style={{ margin: "10px 0" }} />
          <Typography component="p" variant="caption" gutterBottom>
            <b>
              <FormattedMessage id={"Signin.title"} />
            </b>
          </Typography>
          <ul className="MuiTypography-caption">
            <li>
              <FormattedMessage id={"Signin.list1"} />
            </li>
            <li>
              <FormattedMessage id={"Signin.list2"} />
            </li>
            <li>
              <FormattedMessage id={"Signin.list3"} />
            </li>
            <li>
              <FormattedMessage id={"Signin.list4"} />
            </li>
            <li>
              スコアを同期すると
              <Link href="https://rank.poyashi.me" color="secondary">
                BPIMRanks
              </Link>
              にてランキングに掲載されます
            </li>
          </ul>
          <Alert severity="info">
            <Typography component="p" variant="caption" gutterBottom>
              <FormattedMessage id={"Signin.warn1"} />
              <br />
              <FormattedMessage id={"Signin.warn2"} />
              <br />
              <Link color="secondary" href="https://docs2.poyashi.me/tos/">
                <FormattedMessage id={"Signin.warn3"} />
              </Link>
            </Typography>
          </Alert>
        </Paper>
      </React.Fragment>
    );
  }
}

export default SyncLoginScreen;
