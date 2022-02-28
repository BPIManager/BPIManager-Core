import * as React from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import { favsDB } from '@/components/indexedDB';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import { alternativeImg } from '@/components/common';

interface P {
  handleToggle: (reload: boolean) => void,
  toggleSnack: () => void,
  isCreating: boolean,
  target?: number,
}

interface S {
  name: string,
  description: string,
  icon: string,
  processing: boolean,
  willDelete: boolean,
  errorMessage: string,
}

class ListAdd extends React.Component<P, S> {

  constructor(props: P) {
    super(props);
    this.state = {
      name: "",
      description: "",
      icon: "",
      processing: false,
      willDelete: false,
      errorMessage: ""
    }
  }

  async componentDidMount() {
    const target = this.props.target;
    if (target && target !== -1) {
      const p = await new favsDB().getListFromNum(target);
      if (p) {
        this.setState({
          name: p.title,
          description: p.description,
          icon: p.icon || alternativeImg(p.title)
        });
      } else {
        this.props.handleToggle(false);
      }
    }
  }

  saveList = async (): Promise<void> => {
    const { name, description, willDelete, icon } = this.state;
    this.setState({ processing: true });
    if (this.props.target && willDelete) {
      await new favsDB().removeList(this.props.target);
    } else {
      if (!name) {
        return this.setState({ processing: false, errorMessage: "リスト名が入力されていません" });
      }
      if (this.props.target && !this.props.isCreating) {
        await new favsDB().editList(this.props.target, name, description, icon);
      } else {
        await new favsDB().addList(name, description, icon);
      }
    }
    this.props.toggleSnack();
    this.props.handleToggle(true);
    return;
  }

  changeDelete = () => (_e: React.ChangeEvent<HTMLInputElement>): void => {
    return this.setState({ willDelete: !this.state.willDelete });
  }

  render() {
    const { handleToggle, isCreating } = this.props;
    const { name, description, icon, processing, errorMessage, willDelete } = this.state;
    return (
      <Dialog open={true}>
        <DialogTitle>リストの{isCreating ? "作成" : "編集"}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            id="listName"
            label="リスト名"
            fullWidth
            value={name}
            onChange={(e) => this.setState({ name: e.target.value })}
          />
          <TextField
            margin="dense"
            id="listDescription"
            label="リストの説明文(オプション)"
            fullWidth
            value={description}
            onChange={(e) => this.setState({ description: e.target.value })}
          />
          <TextField
            margin="dense"
            id="listIcon"
            label="リストのアイコンURL(オプション)"
            fullWidth
            value={icon}
            onChange={(e) => this.setState({ icon: e.target.value })}
          />
          {!isCreating &&
            <FormControl fullWidth style={{ margin: "10px 0" }}>
              <FormLabel component="legend">リストを削除する場合はチェック</FormLabel>
              <FormGroup>
                <FormControlLabel control={<Checkbox checked={willDelete} onChange={this.changeDelete()} />} label="リストを削除" />
              </FormGroup>
            </FormControl>
          }
          {processing && <LinearProgress style={{ margin: "10px 0" }} />}
          <p style={{ color: "#ff0000", textAlign: "center" }}>{errorMessage}</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleToggle(false)} disabled={processing} color="primary">
            閉じる
          </Button>
          <Button onClick={this.saveList} disabled={processing} color="primary">
            {isCreating ? "追加" : "完了"}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default ListAdd;
