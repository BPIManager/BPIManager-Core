import * as React from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { scoreData, songData } from '@/types/data';
import { _prefixFromNum } from '@/components/songs/filter';
import Loader from '../../common/loader';
import TextField from '@mui/material/TextField';
import Alert from '@mui/lab/Alert/Alert';
import { Link as RLink } from '@mui/material/';

interface P {
  handleToggle: () => void,
  joinExec: (score: number) => Promise<{ "error": boolean, "errorMessage": string }>,
  song: songData,
  score?: scoreData | null,
  default?: any
}

interface S {
  isLoading: boolean,
  score: number,
  errorMessage: string,
}


class JoinModal extends React.Component<P, S> {

  constructor(props: P) {
    super(props);
    this.state = {
      isLoading: false,
      score: (this.props.default && this.props.default.detail) ? this.props.default.detail.exScore : 0,
      errorMessage: ""
    }
  }

  joinExec = async () => {
    this.setState({ isLoading: true });
    const p = await this.props.joinExec(this.state.score);
    if (p.error) {
      this.setState({ isLoading: false, errorMessage: p.errorMessage })
    } else {
      this.props.handleToggle();
    }
  }

  render() {
    const { handleToggle, song } = this.props;
    const { isLoading, score, errorMessage } = this.state;
    if (isLoading) {
      return (
        <Dialog open={true}>
          <DialogTitle>WRに参加</DialogTitle>
          <DialogContent>
            <Loader text="通信中です" />
          </DialogContent>
        </Dialog>
      );
    }
    if (!song) {
      return (null);
    }
    return (
      <Dialog open={true}>
        <DialogTitle>ランキングに参加</DialogTitle>
        <DialogContent>
          <p>
            ランキングにスコアデータを送信します（すでにスコアが登録されている場合、更新されます）。<br />
            <RLink color="secondary" href="https://docs2.poyashi.me/docs/social/ranking/" component="a">ルール</RLink>を確認のうえ、以下のフォームにスコアを入力して送信してください。<br />
            <b>登録できるスコアはランキング開催期間中に達成したもの</b>に限ります。
          </p>
          <TextField
            autoFocus
            fullWidth
            label={`${song.title}${_prefixFromNum(song.difficulty, true)}`}
            type="number"
            value={score || ""}
            onChange={(e) => this.setState({ score: Number(e.target.value) })}
          />
          {errorMessage && (
            <Alert severity="warning" style={{ margin: "5px 0" }}>
              {errorMessage}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleToggle} color="primary">
            キャンセル
          </Button>
          <Button onClick={this.joinExec} color="primary">
            送信
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default JoinModal;
