import React from "react";
import { blurredBackGround, getUA } from "@/components/common";
import { Link as RefLink, Alert, AlertTitle, Button } from "@mui/material/";
import { BeforeInstallPromptEvent } from "@/components/context/global";
import GetAppIcon from "@mui/icons-material/GetApp";

export class BeginnerAlert extends React.Component<{}, {}> {
  render() {
    return (
      <Alert
        variant="outlined"
        className="MuiPaper-root updateDefAlert"
        severity="info"
        style={{ marginBottom: "25px" }}
      >
        <AlertTitle>はじめての方へ</AlertTitle>
        <p>
          「BPIとはなにか？何を表す数字なのか？」などのよくあるご質問にお答えするページがございます。
          <br />
          <RefLink
            href="https://docs2.poyashi.me"
            target="_blank"
            color="secondary"
          >
            こちらのページを御覧ください。
          </RefLink>
        </p>
      </Alert>
    );
  }
}

export class InstallAlert extends React.Component<
  { global: any },
  { hide: boolean }
> {
  constructor(props: { global: any }) {
    super(props);
    this.state = {
      hide: false,
    };
  }
  private available =
    "standalone" in window.navigator && (window.navigator as any)["standalone"];

  installApp = () => {
    const { global } = this.props;
    if (global && global.prompt) {
      const p = global.prompt as BeforeInstallPromptEvent;
      p.prompt();
    } else {
      alert(
        "インストールダイアログの呼び出しに失敗しました。\nChromeのメニューより「ホーム画面に追加」をタップし、手動で追加してください。"
      );
    }
  };

  hideMessage = () => {
    localStorage.setItem("hideAddToHomeScreen", "true");
    this.setState({ hide: true });
  };

  render() {
    const ua = getUA();
    const bg = blurredBackGround();
    if (localStorage.getItem("hideAddToHomeScreen") || this.state.hide)
      return null;
    if (ua === "ios" && this.available) return null; // iOS PWA動作時
    if (
      ua === "chrome" &&
      window.matchMedia("(display-mode: standalone)").matches
    )
      return null; // Chronium PWA動作時
    if (ua === "chrome") {
      return (
        <Alert className="MuiPaper-root" severity="info" style={bg}>
          <AlertTitle>ご存知ですか？</AlertTitle>
          <p>
            「インストール」ボタンをタップして、ホーム画面から通常のアプリのようにBPIManagerをお使いいただけます。
          </p>
          <Button
            startIcon={<GetAppIcon />}
            fullWidth
            color="secondary"
            variant="outlined"
            onClick={this.installApp}
          >
            インストール
          </Button>
        </Alert>
      );
    }
    if (ua === "ios") {
      return (
        <Alert className="MuiPaper-root" severity="info" style={bg}>
          <AlertTitle>お試しください</AlertTitle>
          <p>
            ホーム画面に追加して、通常のアプリのようにBPIManagerをお使いいただけます。
          </p>
          <img
            src="/images/how_to_add_ios.webp"
            style={{
              width: "100%",
              maxWidth: "460px",
              display: "block",
              margin: "3px auto",
            }}
            alt="ホーム画面への追加手順"
          />
          <Button
            fullWidth
            style={{ marginTop: "8px", display: "block", textAlign: "right" }}
            onClick={this.hideMessage}
          >
            次から表示しない
          </Button>
        </Alert>
      );
    }
    return null;
  }
}
