import React, { useState, useEffect, useRef } from "react";
import Loader from "@/view/components/common/loader";
import { RouteComponentProps, withRouter } from "react-router-dom";
import fbArenaMatch from "@/components/firebase/arenaMatch";
import fbActions from "@/components/firebase/actions";
import { DocumentData, Unsubscribe } from "firebase/firestore";
import { _currentStore, _currentTheme } from "@/components/settings";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import { getAltTwitterIcon } from "@/components/rivals";
import Chat from "@/view/components/arenaMatch/chat";
import Settings from "@/view/components/arenaMatch/settings";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Alert from "@mui/material/Alert";
import { isBeforeSpecificDate } from "@/components/common/timeFormatter";
import ModalUser from "@/view/components/rivals/modal";
import { UserIcon } from "@/view/components/common/icon";

const Detail: React.FC<RouteComponentProps> = ({ match }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [detail, setDetail] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [user, setUser] = useState<any>(null);
  const [uid, setUid] = useState<string>("");
  const [modal, setModal] = useState<{ open: boolean; uName: string }>({
    open: false,
    uName: "",
  });

  const themeColor = _currentTheme();
  let unsubscribe = useRef<Unsubscribe | null>(null);

  const handleChangeTab = (_: React.SyntheticEvent, newValue: number) =>
    setCurrentTab(newValue);
  const handleModalOpen = (flag: boolean, uName?: string) =>
    setModal({ ...modal, open: flag, uName: uName ? uName : user.uName });

  const load = async () => {
    const fbA = new fbActions();
    const user = fbA.authInfo();
    if (!user || !user.uid) {
      setUid("");
      setUser(null);
    } else {
      const userData = await fbA.setDocName(user.uid).getSelfUserData();
      if (userData.exists()) {
        setUser(userData.data());
        setUid(user ? user.uid : "");
      }
    }
    setLoading(false);
    const f = new fbArenaMatch();
    unsubscribe.current = f.listenDetail(
      (match.params as any).docId || "",
      watch
    );
  };

  const watch = (snapshot: DocumentData) => {
    setDetail(snapshot.data());
  };

  useEffect(() => {
    load();
    return () => {
      if (unsubscribe.current) {
        unsubscribe.current();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading || !detail) {
    return <Loader />;
  }

  return (
    <React.Fragment>
      <div
        style={{
          background: `url("/images/background/${themeColor}.svg")`,
          backgroundSize: "cover",
        }}
        id="mxHeaderBox"
      >
        <div
          style={{
            background:
              themeColor === "light" ? "transparent" : "rgba(0,0,0,0)",
            display: "flex",
            padding: "2vh 0",
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <Typography variant="h5">{detail.title}</Typography>
          {detail.description && (
            <span style={{ margin: "8px 0", display: "block" }}>
              {" "}
              {detail.description}
            </span>
          )}
          <div
            style={{ display: "flex", alignItems: "center", marginTop: 0 }}
            onClick={() => handleModalOpen(true, detail.admin.displayName)}
          >
            <Chip
              avatar={
                <UserIcon
                  disableZoom
                  defaultURL={detail.admin.photoURL}
                  text={detail.admin.displayName}
                  altURL={getAltTwitterIcon(detail.admin, false, "normal")}
                  size={32}
                />
              }
              component="span"
              label={detail.admin.displayName}
              style={{
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
                borderRight: 0,
              }}
            />
            <Chip
              component="span"
              style={{ borderRadius: 0, margin: "5px 0" }}
              label={"アリーナ" + (detail.admin.arenaRank || "-")}
            />
            {!isNaN(detail.admin.totalBPI) && (
              <Chip
                component="span"
                label={
                  "総合BPI: " +
                  (detail.admin.totalBPIs
                    ? detail.admin.totalBPIs[_currentStore()]
                    : detail.admin.totalBPI)
                }
                style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
              />
            )}
          </div>
        </div>
      </div>
      {detail.startAt && <Timer timer={detail.startAt} />}
      <Tabs
        value={currentTab}
        onChange={handleChangeTab}
        variant="fullWidth"
        id="mxTabBox"
        indicatorColor="secondary"
        textColor="secondary"
      >
        <Tab label="チャット" />
        <Tab label="ルーム設定" disabled={detail.admin.uid !== uid} />
      </Tabs>
      <div style={{ display: currentTab === 0 ? "block" : "none" }}>
        <Chat user={user} detail={detail} id={detail.matchId} />
      </div>
      {currentTab === 1 && <Settings user={user} meta={detail} />}
      {modal.open && (
        <ModalUser
          isOpen={modal.open}
          currentUserName={modal.uName}
          handleOpen={(flag: boolean) => handleModalOpen(flag)}
        />
      )}
    </React.Fragment>
  );
};

const Timer: React.FC<{ timer: any }> = ({ timer }) => {
  const [latency, setLatency] = useState(0);
  const timerRef = useRef<HTMLParagraphElement>(null);
  let intv: any = useRef(null);

  const timerCount = () => {
    if (!timerRef.current) return;
    const full = timer.toMillis() - (new Date().getTime() + latency);
    const seconds = Math.round(full * 100) / 100;
    if (seconds < 0) {
      timerRef.current.innerHTML =
        "あと0.00秒 - アリーナモードに参加して下さい";
      clearInterval(intv.current);
      return;
    }
    timerRef.current.innerHTML = `あと${(seconds / 1000).toFixed(
      2
    )}秒でアリーナモードに参加します`;
  };

  const isBefore = (_timer = timer) =>
    isBeforeSpecificDate(new Date().getTime() + latency, _timer.toDate());

  const initialize = async () => {
    await loadLatency();
    if (isBefore()) {
      intv.current = setInterval(timerCount, 10);
    } else {
      if (!timerRef.current) return;
      timerRef.current.innerHTML = "あと0.00秒 - 参加して下さい";
    }
  };

  const loadLatency = async () => {
    const f = new fbArenaMatch();
    const offset = await f.getLatency();
    setLatency(offset);
  };

  useEffect(() => {
    initialize();
    return () => clearInterval(intv.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    clearInterval(intv.current);
    if (isBefore(timer)) {
      intv.current = setInterval(timerCount, 10);
    } else {
      clearInterval(intv.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer]);

  if (!timer || !timer.toDate) return null;
  return (
    <Alert severity="warning" icon={false}>
      <p
        style={{ margin: 0, fontWeight: "bold", textAlign: "center" }}
        ref={timerRef}
      ></p>
    </Alert>
  );
};

export default withRouter(Detail);
