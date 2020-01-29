import { Component } from "react";
import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";

export default class ReloadModal extends Component<{registration: ServiceWorkerRegistration},{show:boolean}> {
  state = {
    show: !!this.props.registration.waiting
  };

  handleClose = () =>{
    this.setState({show:false});
  }

  handleUpdate = () => {
    this.props.registration.waiting && this.props.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    this.handleClose();
    window.location.reload();
  };

  render() {
    const {show} = this.state;
    if (!show) {
      return null;
    }
    return (
    <div>
      <Dialog
        open={show}
      >
        <DialogTitle id="alert-dialog-title">{"アプリケーションの更新"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            アプリケーションの更新データがあります。<br/>
            今すぐ更新しますか？
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleClose} color="primary">
            無視
          </Button>
          <Button onClick={this.handleUpdate} color="primary" autoFocus>
            更新
          </Button>
        </DialogActions>
      </Dialog>
    </div>
    );
  }
}
