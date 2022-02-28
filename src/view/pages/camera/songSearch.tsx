import { songData } from "@/types/data";
import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Loader from "@/view/components/common/loader";
import TextField from "@mui/material/TextField";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import { CameraClass } from "@/components/camera/songs";

interface UP {
  isDialogOpen: boolean,
  close: () => void,
  decide: (input: songData) => void,
  text?: string,
  diff?: string
}

export default class SongSearchDialog extends React.Component<UP, { value: string, isLoading: boolean, fullset: any[], display: any[] }> {

  constructor(props: UP) {
    super(props);
    this.state = {
      value: "",
      isLoading: true,
      fullset: [],
      display: []
    }
  }

  async componentDidMount() {
    if (this.props.text && this.props.diff) {
      //リコメンド
      const cam = new CameraClass();
      (await cam.setSplitLetters(/.{6}/g).loadSongs()).init();
      const p = cam.setText(this.props.text).levenshtein(this.props.diff);
      return this.setState({ fullset: p, display: p, isLoading: false });
    }
  }

  handleClose = () => {
    this.props.close();
  };

  render() {
    const { isDialogOpen, decide } = this.props;
    const { isLoading, display, fullset } = this.state;
    return (
      <div>
        <Dialog
          open={isDialogOpen}
          onClose={this.handleClose}>
          <DialogTitle>楽曲検索</DialogTitle>
          <DialogContent>
            {isLoading && <Loader />}
            {!isLoading &&
              <div>
                <TextField
                  margin="dense"
                  id="name"
                  label="楽曲名で絞り込み"
                  type="text"
                  value={this.state.value}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.setState({ value: e.target.value, display: fullset.filter(item => item.title.toLowerCase().indexOf(e.target.value.toLowerCase()) > -1) })}
                  fullWidth
                />
                <List subheader={<li />}>
                  {display.map(item =>
                    <ListItem alignItems="flex-start" key={item.title} button onClick={() => decide(item)}>
                      <ListItemText
                        primary={item.title}
                        secondary={
                          <React.Fragment>
                            <Typography
                              component="span"
                              variant="body2"
                              color="textPrimary"
                            >
                              類似度: {item.distance.toFixed(5)}
                            </Typography>
                          </React.Fragment>
                        }
                      />
                    </ListItem>)}
                </List>
              </div>
            }
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="secondary">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}
