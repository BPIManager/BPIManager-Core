import React from "react";

import Button from "@mui/material/Button";
import { _currentStore, _isSingle } from "@/components/settings";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import List from "@mui/material/List";
import fbActions from "@/components/firebase/actions";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import ListSubheader from "@mui/material/ListSubheader";
import Paper from "@mui/material/Paper";
import Switch from "@mui/material/Switch";
import { messanger } from "@/components/firebase/message";
import Typography from "@mui/material/Typography";
import { isSupported } from "firebase/messaging";
import Loader from "@/view/components/common/loader";
import { getAltTwitterIcon } from "@/components/rivals";
import { UserIcon } from "../common/icon";

interface P {}

interface S {
  available: boolean;
  uid: string;
  processing: boolean;
  errorMessage: string;
  syncData: {
    from: any;
    to: any;
    updatedAt: any;
    version: any;
    notify: boolean;
  }[];
  userData: any;
  permission: boolean;
  rivalAdded: boolean;
}

class PushSettings extends React.Component<P, S> {
  private fbActions = new fbActions();
  private fbStores: fbActions = new fbActions();
  private messanger = new messanger();

  constructor(props: P) {
    super(props);
    this.state = {
      uid: "",
      processing: true,
      errorMessage: "",
      syncData: [],
      userData: null,
      permission: false,
      rivalAdded: false,
      available: false,
    };
    this.fbStores.setColName(`${_currentStore()}_${_isSingle()}`);
  }

  async componentDidMount() {
    this.refreshData();
    this.setState({
      permission: this.messanger.checkPermission(),
      available: await isSupported(),
    });
  }

  handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ processing: true });
    const { value, checked } = event.target;
    let newSyncData = this.state.syncData;
    newSyncData[Number(value)]["notify"] = checked;
    this.fbActions.syncNotificationItem(newSyncData[Number(value)]);
    return this.setState({ syncData: newSyncData, processing: false });
  };

  uid = () => {
    return this.state.uid;
  };

  refreshData = () => {
    this.setState({ processing: true });
    return this.fbActions.auth().onAuthStateChanged(async (user: any) => {
      if (!user.uid) return;
      this.fbActions.setDocName(user.uid);
      const me = await new fbActions()
        .setColName("notifyWhenAddedAsRivals")
        .setDocName(user.uid)
        .load();
      const p = user.uid
        ? ((await this.fbActions.syncLoadRival(true)) as any)
        : [];
      this.setState({
        uid: user.uid,
        processing: false,
        userData:
          this.state.userData ||
          (await new fbActions()
            .v2SetUserCollection()
            .setDocName(user.uid)
            .load()),
        syncData: p,
        rivalAdded: (me && me.addedNotify === true) || false,
      });
    });
  };

  requestNotify = async () => {
    if (await isSupported()) {
      await this.messanger.requestPermission();
      return this.setState({ permission: true });
    }
  };

  toggleAddedNotify = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.fbActions.toggleAddedNotify(this.uid(), event.target.checked);
    return this.setState({ rivalAdded: event.target.checked });
  };

  render() {
    const { syncData, permission, processing, available } = this.state;
    if (!permission) {
      return (
        <React.Fragment>
          <Paper style={{ padding: "15px" }}>
            <Typography component="h6" variant="h6" color="textPrimary">
              ライバルの更新を通知
            </Typography>
            <Typography
              component="p"
              variant="caption"
              style={{ margin: "10px 0" }}
            >
              ライバルが新たにスコアを更新したとき、プッシュ通知で更新をお知らせする機能です。
              <br />
              通知をタップすることで、ライバルの最新スコアを直ぐに確認できます。
              <br />
              通知のオンオフはライバルごとに設定できます。
            </Typography>
            <Button variant="outlined" fullWidth onClick={this.requestNotify}>
              通知を許可
            </Button>
            <Typography
              component="p"
              variant="caption"
              style={{ margin: "10px 0" }}
            >
              本機能の利用にはプッシュ通知を許可する必要があります。
              <br />
              下のボタンをクリックし、通知を許可してください。
              <br />
              通知許可はブラウザの設定画面から何時でも取り消すことが可能です。
              <br />
              iOSには対応していません。Android/Windows PCでのみ利用可能です。
            </Typography>
          </Paper>
        </React.Fragment>
      );
    }
    return (
      <React.Fragment>
        <Paper style={{ padding: "15px" }}>
          <List
            subheader={
              <ListSubheader component="div" disableSticky>
                スコア更新を通知
              </ListSubheader>
            }
          >
            {processing && <Loader />}
            {syncData.length === 0 && !processing && (
              <div>
                <Typography
                  component="p"
                  variant="caption"
                  style={{ margin: "10px 0" }}
                >
                  通知を許可できるユーザーがいません。
                  <br />
                  「ライバル」タブで通知対象にしたいユーザーが「アップロード済み」欄に存在することを確認のうえ、再度お試しください。
                </Typography>
              </div>
            )}
            {syncData.map((item, i) => {
              if (!item.to) return null;
              return (
                <ListItem key={item.to.displayName}>
                  <ListItemAvatar>
                    <UserIcon
                      _legacy
                      disableZoom
                      defaultURL={item.to.photoURL}
                      text={item.to.displayName}
                      altURL={getAltTwitterIcon(item.to, true)}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={item.to.displayName}
                    secondary={
                      "通知 : " +
                      ((syncData[i]["notify"] || false) === true
                        ? "許可"
                        : "不許可")
                    }
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      color="secondary"
                      onChange={this.handleToggle}
                      checked={syncData[i]["notify"] || false}
                      value={i}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
          {/* (
            <List
              subheader={
                <ListSubheader component="div" disableSticky>
                  その他のタイミング
                </ListSubheader>
              }>
              <ListItem>
                <ListItemAvatar>
                  <Avatar style={{background:avatarBgColor,color:avatarFontColor}}>
                    <GroupAddIcon/>
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={"逆ライバル通知"}
                  secondary={"他のユーザーがあなたをライバルとして追加されたときに通知します。"}
                />
                <ListItemSecondaryAction>
                  <Switch color="secondary" onChange={this.toggleAddedNotify} disabled={true} checked={false}/>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
        )*/}
        </Paper>

        <Alert severity="info" style={{ margin: "10px 0" }}>
          <AlertTitle style={{ marginTop: "0px", fontWeight: "bold" }}>
            ライバルのスコア更新を通知
          </AlertTitle>
          <p>
            この画面で通知を許可したユーザーが新規スコアを登録したとき、プッシュ通知でお知らせします。
          </p>
          <p>
            仕様:
            <br />
            ・最短通知間隔は30分です
            <br />
            ・通知をクリックするとユーザーのスコア更新を確認できます
            <br />
            ・スコアデータを非公開にしているユーザーの更新は通知されません
            <br />
            ・お試し実装なので今後機能の改廃を行う可能性が大です
            <br />
            ・問題が発生した場合は@BPIManagerまで教えていただけると助かります
            <br />
            ・通知を許可できる対象は「ライバル」タブよりサーバーにデータを送信済みのライバルのみです
            <br />
            ・iOSには対応していません
          </p>
          <p>使用中のデバイス:通知を{available ? "利用可能" : "利用不可"}</p>
        </Alert>
      </React.Fragment>
    );
  }
}

export default PushSettings;
