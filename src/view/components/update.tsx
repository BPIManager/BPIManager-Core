import { Component } from "react";
import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Container from "@mui/material/Container";
import CircularProgress from "@mui/material/CircularProgress";

export default class ReloadModal extends Component<{ registration: ServiceWorkerRegistration }, { show: boolean }> {
  state = {
    show: !!this.props.registration.waiting
  };

  handleClose = () => {
    this.setState({ show: false });
  }

  componentDidMount() {
    console.log(this.props.registration);
    if ((this.props.registration && this.props.registration.waiting)) {
      this.handleUpdate();
    }
  }

  wait = (msec: number) => {
    return new Promise((resolve, _reject) => {
      setTimeout(resolve, msec);
    });
  }

  handleUpdate = async () => {
    (this.props.registration && this.props.registration.waiting) && this.props.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    await this.wait(1000);
    window.location.reload();
  };

  render() {
    const { show } = this.state;
    if (!show) {
      return null;
    }
    return (
      <React.Fragment>
        <Dialog
          open={show}
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
}
