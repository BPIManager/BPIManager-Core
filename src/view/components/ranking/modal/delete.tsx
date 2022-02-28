import * as React from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Loader from '../../common/loader';
import Alert from '@mui/lab/Alert/Alert';

interface P {
  handleToggle: () => void,
  exec: () => Promise<{ "error": boolean, "errorMessage": string }>,
}

interface S {
  isLoading: boolean,
  errorMessage: string,
}


class DeleteModal extends React.Component<P, S> {

  constructor(props: P) {
    super(props);
    this.state = {
      isLoading: false,
      errorMessage: ""
    }
  }

  deleteExec = async () => {
    this.setState({ isLoading: true });
    const p = await this.props.exec();
    if (p.error) {
      this.setState({ isLoading: false, errorMessage: p.errorMessage })
    } else {
      this.props.handleToggle();
    }
  }

  render() {
    const { handleToggle } = this.props;
    const { isLoading, errorMessage } = this.state;
    if (isLoading) {
      return (
        <Dialog open={true}>
          <DialogTitle>スコアの削除</DialogTitle>
          <DialogContent>
            <Loader text="通信中です" />
          </DialogContent>
        </Dialog>
      );
    }
    return (
      <Dialog open={true}>
        <DialogTitle>スコアの削除</DialogTitle>
        <DialogContent>
          <p>
            ランキングに登録済みのスコアを削除しますか？
          </p>
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
          <Button onClick={this.deleteExec} color="primary">
            削除
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default DeleteModal;
