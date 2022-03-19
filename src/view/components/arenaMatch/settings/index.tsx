import React from 'react';
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import LoadingButton from '@mui/lab/LoadingButton';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import fbArenaMatch from "@/components/firebase/arenaMatch";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Divider from "@mui/material/Divider";
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';

interface P {
  meta: any,
  user: any
}

class Settings extends React.Component<P, {
  deleting: boolean,
  confirm: boolean,
  timer: string
}> {

  state = {
    deleting: false,
    confirm: false,
    timer: "15"
  }

  delete = async () => {
    this.setState({ deleting: true })
    const fb = new fbArenaMatch();
    await fb.deleteRoom(this.props.meta.matchId);
    window.location.href = "/arena";
  }

  onConfirm = () => this.setState({ confirm: !this.state.confirm });

  handleChange = (event: SelectChangeEvent) => {
    this.setState({ timer: event.target.value as string });
  }

  setTimer = async () => {
    const fb = new fbArenaMatch();
    await fb.enterChat(this.props.meta.matchId,"/timer: タイマーを" + this.state.timer + "秒にセットしました",this.props.user);
    await fb.setTimer(this.state.timer,this.props.meta.matchId);
  }

  render() {
    const { deleting, confirm, timer } = this.state;
    return (
      <React.Fragment>
        <Container style={{ marginTop: 8 }}>
          <Typography variant="h6">
            カウントダウンの開始
          </Typography>
          <Typography variant="caption" style={{ margin: "8px 0" }}>
            アリーナモードへの参加タイミングを合わせるためのカウントダウンを設定します。<br />
            チャットで「/timer set ○」と入力しても設定できます。(例: /timer set 15 : 15秒後にスタート)
          </Typography>
          <Grid container>
            <Grid item xs={10}>
              <FormControl fullWidth>
                <Select
                  value={timer}
                  label="カウントダウンを指定"
                  onChange={this.handleChange}
                >
                  {["15", "30", "45", "60"].map((item) => <MenuItem key={item} value={String(item)}>{item}秒後</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={2}>
              <Button fullWidth onClick={this.setTimer}>設定</Button>
            </Grid>
          </Grid>


          <Divider style={{ margin: "8px 0" }} />
          <Typography variant="h6">
            ルームの削除
          </Typography>
          <Typography variant="caption" style={{ margin: "8px 0", display: "block" }}>
            ルームの削除を実行します。<br />
            ルーム情報、チャット履歴を含む情報がすべて削除され、もとに戻すことはできません。
          </Typography>
          <LoadingButton
            onClick={this.onConfirm}
            loading={deleting}
            loadingPosition="start"
            startIcon={<DeleteForeverIcon />}
            variant="outlined"
          >
            ルームを削除
          </LoadingButton>
        </Container>
        {confirm && <ConfirmDialog cancel={this.onConfirm} next={this.delete} />}
      </React.Fragment>
    );
  }
}

export default Settings;


class ConfirmDialog extends React.Component<{
  next: () => void,
  cancel: () => void,
}, {}> {
  render() {
    const { next, cancel } = this.props;
    return (
      <Dialog
        open={true}
        onClose={cancel}
      >
        <DialogTitle>
          確認
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            このルームのすべての情報を削除します。<br />
            操作は取り消しできません。続行してもよろしいですか？
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancel}>キャンセル</Button>
          <Button onClick={() => {
            next();
            cancel();
          }} autoFocus>
            続行
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
