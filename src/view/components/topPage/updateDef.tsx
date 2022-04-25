import React, { useState, useEffect, useRef } from "react";
import Button from "@mui/material/Button";
import { Link as RefLink, Grid, Typography } from "@mui/material/";
import {
  _currentVersion,
  _currentTheme,
  _currentQuickAccessComponents,
} from "@/components/settings";
import UpdateIcon from "@mui/icons-material/Update";
import Loader from "@/view/components/common/loader";
import { updateDefFile } from "@/components/settings/updateDef";
import CheckIcon from "@mui/icons-material/Check";
import WarningIcon from "@mui/icons-material/Warning";
import { _apiFetch } from "@/components/common/rankApi";
import CachedIcon from "@mui/icons-material/Cached";
import SubHeader from "@/view/components/topPage/subHeader";

const styled = { color: "#ff4040" };
const UpdateContainer: React.FC = ({ children }) => (
  <Grid item xs={12} style={{ paddingTop: "15px" }}>
    <SubHeader
      icon={<CachedIcon style={styled} />}
      text={<span style={styled}>定義データを更新</span>}
    />
    {children}
  </Grid>
);

const UpdateDef: React.FC = () => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<{
    version: string;
    url: string;
  }>({ version: "", url: "" });
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState("");

  const initialize = async () => {
    try {
      const versions = await fetch("https://proxy.poyashi.me/?type=bpiVersion");
      const data = await versions.json();
      const currentVersion = _currentVersion();
      if (data.version !== currentVersion) {
        setShowUpdate(true);
        setUpdateInfo({ version: data.version, url: data.updateInfo });
      }
    } catch (e: any) {
      console.log(e);
    }
  };
  const progressRef = useRef(null);

  const update = async () => {
    setProgress(1);
    const p = await updateDefFile(progressRef);
    setProgress(2);
    setResult(p.message);
  };

  const handleToggle = () => setShowUpdate(false);

  useEffect(() => {
    initialize();
  }, []);

  if (!showUpdate) {
    return null;
  }
  if (progress === 0) {
    return (
      <UpdateContainer>
        <Typography variant="body2" style={{ margin: 0 }}>
          最新の楽曲データ(ver{updateInfo.version})が利用可能です。
          <br />
          <RefLink href={updateInfo.url} target="_blank" color="secondary">
            こちらのページ
          </RefLink>
          より変更点をご確認の上、アップデートを適用してください。
        </Typography>
        <Button
          style={{ marginTop: "8px" }}
          variant="outlined"
          color="secondary"
          fullWidth
          onClick={update}
          startIcon={<UpdateIcon />}
        >
          今すぐ更新
        </Button>
      </UpdateContainer>
    );
  }
  if (progress === 1) {
    return (
      <UpdateContainer>
        <Grid container>
          <Grid
            item
            xs={3}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Loader />
          </Grid>
          <Grid
            item
            xs={9}
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <Typography variant="body2" component="p">
              更新しています
              <br />
              <span id="_progressText" ref={progressRef} />
            </Typography>
          </Grid>
        </Grid>
      </UpdateContainer>
    );
  }
  if (progress === 2) {
    return (
      <UpdateContainer>
        <Grid container>
          <Grid
            item
            xs={3}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {(result === "定義データはすでに最新です" ||
              result === "更新完了") && (
              <CheckIcon style={{ fontSize: 60, margin: 0 }} />
            )}
            {result !== "定義データはすでに最新です" &&
              result !== "更新完了" && (
                <WarningIcon style={{ fontSize: 60, margin: 0 }} />
              )}
          </Grid>
          <Grid
            item
            xs={9}
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <Typography variant="body1" component="p">
              {result}
            </Typography>
            {result !== "定義データはすでに最新です" && result !== "更新完了" && (
              <span>
                <RefLink
                  href="https://gist.github.com/potakusan/11b5322c732bfca4d41fc378dab9b992"
                  color="secondary"
                  target="_blank"
                >
                  トラブルシューティングを表示
                </RefLink>
              </span>
            )}
            <RefLink onClick={handleToggle} color="secondary">
              閉じる
            </RefLink>
          </Grid>
        </Grid>
      </UpdateContainer>
    );
  }
  return null;
};

export default UpdateDef;
