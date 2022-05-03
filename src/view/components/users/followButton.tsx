import { Fab, Tooltip } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import AddIcon from "@mui/icons-material/Add";
import React, { useState, useEffect } from "react";
import { rivalListsDB } from "@/components/indexedDB";
import fbActions from "@/components/firebase/actions";
import ShowSnackBar from "../snackBar";
import { _currentStore, _isSingle } from "@/components/settings";

const FollowButton: React.FC<{
  meta: any;
  myId: string;
  myDisplayName: string;
}> = ({ meta, myId, myDisplayName }) => {
  const [isAdded, setIsAdded] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [snackBarMessage, setSnackBarMessage] = useState<string | false>(false);
  const loadData = async () => {
    const uids = await new rivalListsDB().getAllRivalUid();
    setIsAdded(uids.indexOf(meta.uid) > -1);
  };
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const addUser = async () => {
    setProcessing(true);
    const fbA = new fbActions();
    const fbStores = new fbActions();
    fbA.v2SetUserCollection();
    fbStores.setColName(`${_currentStore()}_${_isSingle()}`);
    const data = await fbStores.setDocName(meta.uid).load();
    const rivalLen = await new rivalListsDB().getRivalLength();
    if (rivalLen >= 10) {
      setProcessing(false);
      setSnackBarMessage(`ライバル登録数が上限を超えています。`);
      return;
    }
    if (!data || data.length === 0) {
      setProcessing(false);
      setSnackBarMessage(
        "該当ユーザーは当該バージョン/モードにおけるスコアを登録していません。"
      );
      return;
    }
    const putResult = await new rivalListsDB().addUser(
      {
        rivalName: meta.displayName,
        uid: meta.uid,
        photoURL: meta.photoURL,
        profile: meta.profile,
        updatedAt: meta.timeStamp,
        lastUpdatedAt: meta.timeStamp,
        isSingle: _isSingle(),
        storedAt: _currentStore(),
      },
      data.scores
    );
    await fbA.setDocName(myId).syncUploadOne(meta.uid, myDisplayName);
    if (!putResult) {
      setProcessing(false);
      setSnackBarMessage("追加に失敗しました");
      return;
    }
    setProcessing(false);
    setSnackBarMessage("ライバルを追加しました");
    loadData();
    return;
  };
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        {!isAdded && (
          <Tooltip title="ライバルに追加">
            <Fab
              size="large"
              color="secondary"
              variant="extended"
              onClick={addUser}
              disabled={myId === meta.uid || processing}
              style={{
                fontWeight: "bold",
                fontSize: "12px",
                zIndex: 1,
              }}
            >
              <AddIcon />
            </Fab>
          </Tooltip>
        )}
        {isAdded && (
          <Tooltip title="ライバルです！">
            <Fab
              size="large"
              color="secondary"
              variant="extended"
              disabled={true}
              style={{
                fontWeight: "bold",
                fontSize: "12px",
                zIndex: 1,
              }}
            >
              <CheckIcon />
            </Fab>
          </Tooltip>
        )}
      </div>
      <ShowSnackBar
        message={snackBarMessage}
        variant={
          snackBarMessage === "ライバルを追加しました" ? "success" : "error"
        }
        handleClose={() => setSnackBarMessage(false)}
        open={!!snackBarMessage}
        autoHideDuration={3000}
      />
    </>
  );
};

export default FollowButton;
