import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Container from "@mui/material/Container";
import CircularProgress from "@mui/material/CircularProgress";

const ReloadModal: React.FC<{ registration: ServiceWorkerRegistration }> = ({ registration }) => {
  const [visible, _] = useState<boolean>(!!registration.waiting);

  const wait = (msec: number) => {
    return new Promise((resolve, _reject) => {
      setTimeout(resolve, msec);
    });
  }

  const handleUpdate = async () => {
    (registration && registration.waiting) && registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    await wait(1000);
    window.location.reload();
  };

  useEffect(() => {
    if ((registration && registration.waiting)) {
      handleUpdate();
    }
  });
  
  if (!visible) {
    return null;
  }
  return (
    <React.Fragment>
      <Dialog
        open={visible}
      >
        <DialogTitle id="alert-dialog-title"></DialogTitle>
        <DialogContent>
          <Container fixed className="loaderCentered" style={{ flexDirection: "column" }}>
            <CircularProgress />
            <p style={{ marginTop: "15px" }}>アプリケーションの更新中...</p>
          </Container>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );

}

export default ReloadModal;
