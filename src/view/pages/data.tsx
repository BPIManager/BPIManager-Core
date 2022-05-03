import React, { useState, useEffect } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { FormattedMessage } from "react-intl";
import TextField from "@mui/material/TextField";
import {
  _currentStore,
  _isSingle,
  _currentStoreWithFullName,
} from "@/components/settings";
import { _autoSync } from "../../components/settings";
import Link from "@mui/material/Link";
import {
  Link as RLink,
  withRouter,
  RouteComponentProps,
} from "react-router-dom";
import Alert, { AlertColor } from "@mui/material/Alert/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import { config } from "@/config";
import timeFormatter from "@/components/common/timeFormatter";
import Loader from "@/view/components/common/loader";
import Divider from "@mui/material/Divider";
import AdsCard from "@/components/ad";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import LinkIcon from "@mui/icons-material/Link";
import LoadingButton from "@mui/lab/LoadingButton";
import executeFunc, { ImportResult } from "@/components/import/execute";

interface P {
  updateGlobal: (uid: string) => void;
}

const ImportScreen: React.FC<P & RouteComponentProps> = ({
  updateGlobal,
  match,
  history,
}) => {
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [raw, setRaw] = useState<string>("");
  const [result, setResult] = useState<ImportResult>({
    stateText: "",
    errors: [],
    updated: 0,
    updatedText: "",
  });

  const load = async () => {
    const user = JSON.parse(localStorage.getItem("social") || "{}");
    if (user) {
      setUid(user.uid);
    }
    setLoading(false);
    if ((match.params as any).docId) {
      setSaving(true);
      await loadTempItems();
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTempItems = async () => {
    const tempId = (match.params as any).docId || "";
    const res = await (
      await fetch(
        "https://proxy.poyashi.me/bpim/api/v1/bookmarklet/get?tempId=" + tempId
      )
    ).json();
    if (res.body) {
      const text = JSON.stringify(res.body);
      setRaw(text);
      await execute(text);
    }
  };

  const execute = async (forceText?: string) => {
    setSaving(true);
    const text = forceText || raw;
    const res: ImportResult = await executeFunc(text, uid, updateGlobal);
    setSaving(false);
    setRaw("");
    setResult({
      stateText: res.stateText,
      errors: res.errors,
      updated: res.updated,
      updatedText: res.updatedText,
    });
  };

  const spdp = _isSingle() ? "SP" : "DP";
  const currentStore = _currentStore();
  if (loading) {
    return <Loader />;
  }
  return (
    <Container fixed className="commonLayout">
      {currentStore !== config.latestStore && currentStore !== "INF" && (
        <MakeAlert title="スコア保存先をご確認ください" severity="error">
          <p>
            スコアデータの保存先が最新のIIDXバージョンではありません。(現在選択中:
            {_currentStoreWithFullName()})<br />
            保存先が間違っていませんか？
            <br />
            <RLink to="/settings" style={{ textDecoration: "none" }}>
              <Link color="secondary" component="span">
                設定画面からスコアの保存先を変更する
              </Link>
            </RLink>
            。
          </p>
        </MakeAlert>
      )}
      <Stepper orientation="vertical" className="vertStepper">
        <Step active>
          <StepLabel>
            <FormattedMessage id="Data.Copy" />
          </StepLabel>
          <StepContent>
            <Typography variant="caption">
              <Link
                color="secondary"
                href={
                  "https://p.eagate.573.jp/game/2dx/" +
                  currentStore +
                  "/djdata/score_download.html?style=" +
                  spdp
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                <FormattedMessage id="Data.ClickHere" />
                <LinkIcon style={{ fontSize: 15 }} />
              </Link>
              <FormattedMessage id="Data.CopyAfter" />
            </Typography>
            <Navigation />
          </StepContent>
        </Step>
        <Step active>
          <StepLabel>
            <FormattedMessage id="Data.Import" />
          </StepLabel>
          <StepContent>
            <Typography variant="caption">
              <FormattedMessage id="Data.ImportText" />
            </Typography>
            <React.Fragment>
              <Typography
                variant="caption"
                style={{ margin: "8px 0 0 0", display: "block" }}
              >
                <FormattedMessage id="Data.ImportFails" />
              </Typography>
              <TextField
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setRaw(e.target.value)
                }
                disabled={saving}
                value={raw}
                style={{ width: "100%" }}
                margin="dense"
                variant="outlined"
                multiline
                maxRows="4"
              />
            </React.Fragment>
            <LoadingButton
              variant="outlined"
              color="secondary"
              onClick={() => execute()}
              disabled={saving}
              loading={saving}
              style={{ margin: "5px 0" }}
            >
              <FormattedMessage id="Data.Execute" />
              <br />
              (-{">"}
              {_currentStoreWithFullName()}&nbsp;/&nbsp;
              {spdp})
            </LoadingButton>
          </StepContent>
        </Step>
        <Step active={result.errors.length > 0}>
          <StepLabel>
            <FormattedMessage id="Data.Result" />
          </StepLabel>
          <StepContent>
            <Typography variant="caption">
              <FormattedMessage id="Data.ResultText" />
            </Typography>
          </StepContent>
        </Step>
      </Stepper>
      {result.errors.length > 0 && result.stateText !== "Data.Failed" && (
        <MakeAlert
          severity="success"
          title={<FormattedMessage id="Data.End" />}
        >
          <div style={{ width: "100%" }}>
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              onClick={() => history.push("/songs/today")}
              style={{ margin: "5px 0" }}
            >
              <FormattedMessage id="Data.ShowUpdated" />
            </Button>
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              onClick={() =>
                history.push("/history/" + timeFormatter(7, new Date()))
              }
              style={{ margin: "5px 0" }}
            >
              <FormattedMessage id="Data.ShowUpdatedHistory" />
            </Button>
          </div>
        </MakeAlert>
      )}
      {result.errors.length > 0 && (
        <MakeAlert title="実行ログ" severity="error">
          {result.errors.map((item) => (
            <span key={item}>
              {item}
              <br />
            </span>
          ))}
        </MakeAlert>
      )}
      <AdsCard />
      <Divider style={{ margin: "15px 0" }} />
      {uid === "" && (
        <MakeAlert title="ログインしていません" severity="warning">
          <p>
            Sync機能を用いることで、スコアデータをクラウドと同期することが可能です。
            <br />
            不慮のデータ消失に備えるためにも、常にログイン状態を維持することをおすすめします。
            <RLink to="/sync" style={{ textDecoration: "none" }}>
              <Link color="secondary" component="span">
                こちらからログインしてください
              </Link>
            </RLink>
            。
          </p>
        </MakeAlert>
      )}
      {!_autoSync() && uid !== "" && (
        <MakeAlert title="ご存知ですか？" severity="warning">
          <p>
            設定画面より「Auto-sync」を有効にすることで、最新のスコアデータをクラウドと自動同期できます。
            <br />
            不慮のデータ消失に備えられるほか、新たなライバルを探すためにも有用です。
            <RLink to="/settings" style={{ textDecoration: "none" }}>
              <Link color="secondary" component="span">
                こちらから有効化してください
              </Link>
            </RLink>
            。
          </p>
        </MakeAlert>
      )}
    </Container>
  );
};

const Navigation: React.FC = () => {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen(!open);

  return (
    <React.Fragment>
      <Divider style={{ margin: "15px" }} />
      <Typography variant="caption" component="p" style={{ margin: "8px 0" }}>
        <Link color="secondary" onClick={toggle}>
          ブックマークレットでスコアを取り込む
          <br />
          (eAMUベーシック会員向け)
        </Link>
      </Typography>
      {open && (
        <div>
          <pre
            style={{
              background: "#eaeaea",
              color: "#000",
              padding: "15px",
              margin: "10px",
              wordBreak: "break-all",
              whiteSpace: "pre-line",
            }}
          >
            &#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;&#40;&#102;&#117;&#110;&#99;&#116;&#105;&#111;&#110;&#40;&#41;&#32;&#123;&#32;&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;&#32;&#40;&#102;&#117;&#110;&#99;&#116;&#105;&#111;&#110;&#40;&#100;&#44;&#32;&#115;&#41;&#32;&#123;&#32;&#115;&#32;&#61;&#32;&#100;&#46;&#99;&#114;&#101;&#97;&#116;&#101;&#69;&#108;&#101;&#109;&#101;&#110;&#116;&#40;&#39;&#115;&#99;&#114;&#105;&#112;&#116;&#39;&#41;&#59;&#32;&#115;&#46;&#115;&#114;&#99;&#32;&#61;&#32;&#39;&#104;&#116;&#116;&#112;&#115;&#58;&#47;&#47;&#102;&#105;&#108;&#101;&#115;&#46;&#112;&#111;&#121;&#97;&#115;&#104;&#105;&#46;&#109;&#101;&#47;&#98;&#112;&#105;&#109;&#47;&#105;&#110;&#100;&#101;&#120;&#46;&#106;&#115;&#63;&#118;&#61;&#39;&#32;&#43;&#32;&#78;&#117;&#109;&#98;&#101;&#114;&#40;&#77;&#97;&#116;&#104;&#46;&#102;&#108;&#111;&#111;&#114;&#40;&#77;&#97;&#116;&#104;&#46;&#114;&#97;&#110;&#100;&#111;&#109;&#40;&#41;&#32;&#42;&#32;&#49;&#48;&#48;&#48;&#48;&#48;&#48;&#48;&#41;&#41;&#59;&#32;&#100;&#46;&#98;&#111;&#100;&#121;&#46;&#97;&#112;&#112;&#101;&#110;&#100;&#67;&#104;&#105;&#108;&#100;&#40;&#115;&#41;&#59;&#32;&#125;&#41;&#40;&#100;&#111;&#99;&#117;&#109;&#101;&#110;&#116;&#41;&#32;&#125;&#41;&#40;&#41;&#59;
          </pre>
          <Typography variant="caption" component="p">
            1.ブラウザに上記ブックマークレットを登録します。
            <Link
              color="secondary"
              href="http://yomahigoto.blogspot.com/2017/10/androidchrome.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              登録方法はこちらのサイトを参照してください。
            </Link>
          </Typography>
          <Typography variant="caption" component="p">
            2.
            <Link
              color="secondary"
              href="https://p.eagate.573.jp/game/2dx/27/top/index.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              IIDX公式サイト
            </Link>
            を開きます。
          </Typography>
          <Typography variant="caption" component="p">
            3.登録したブックマークレットを実行します。
          </Typography>
          <Typography variant="caption" component="p">
            4.処理が完了したら自動的に BPIManager
            へ遷移しデータがインポートされます。
          </Typography>
          <MakeAlert title="注意事項" severity="warning">
            <Typography variant="caption" component="p">
              IIDX公式サイトの仕様変更によりブックマークレットが機能しなくなるかもしれません。その場合はお問い合わせください。
              <br />
              ブックマークレットにより更新できる情報はEXスコアとクリアランプのみです。ミスカウントなどは集計されません。
              <br />
              更新日時は最終プレイ日時ではなく、取り込み日時となります。
              <br />
              ブックマークレットは現段階ではSPのみ対応しています。
            </Typography>
          </MakeAlert>
        </div>
      )}
    </React.Fragment>
  );
};

const MakeAlert: React.FC<{
  title: string | React.ReactNode;
  children: React.ReactNode;
  severity: AlertColor;
}> = ({ severity, title, children }) => {
  return (
    <Alert severity={severity} style={{ margin: "10px 0" }}>
      <AlertTitle>{title}</AlertTitle>
      {children}
    </Alert>
  );
};

export default withRouter(ImportScreen);
