import React from 'react';
import timeFormatter from "@/components/common/timeFormatter"
import Button from "@mui/material/Button";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { RouteComponentProps, withRouter } from 'react-router-dom';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import fbArenaMatch from "@/components/firebase/arenaMatch";
import LoadingButton from '@mui/lab/LoadingButton';
import SaveIcon from '@mui/icons-material/Save';
import Typography from "@mui/material/Typography";
interface S {
  title: string,
  arenaRank: string,
  description: string,
  isBPLMode: boolean,
  isPublicKey: boolean,
  matchStartAt: string,
  passCode: number,
  loading: boolean
}

interface P {
  toggle: () => void
}

class CreateDialog extends React.Component<P & RouteComponentProps, S> {

  constructor(props: P & RouteComponentProps) {
    super(props);
    this.state = {
      title: this.getDefaultTitle(),
      arenaRank: this.getArenaRank(),
      description: "",
      isBPLMode: false,
      isPublicKey: true,
      matchStartAt: timeFormatter(3),
      passCode: 0,
      loading: false
    }
  }

  getDefaultTitle = () => {
    const t = localStorage.getItem("social");
    if (!t) return "";
    const p = JSON.parse(t);
    return p.displayName !== "" ? p.displayName + " のルーム" : "";

  }

  getArenaRank = () => {
    const t = localStorage.getItem("social");
    if (!t) return "A1";
    const p = JSON.parse(t);
    return (p.arenaRank && p.arenaRank !== "" && p.arenaRank !== "-") ? p.arenaRank : "A1";
  }

  changeTitle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const text = e ? e.target.value : "";
    this.setState({ title: text });
  }

  changeDesc = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const text = e ? e.target.value : "";
    this.setState({ description: text });
  }

  make = async () => {
    const { loading, title, description, arenaRank, isBPLMode, isPublicKey } = this.state;
    if (loading) return;
    this.setState({ loading: true });
    const fb = new fbArenaMatch();
    const p = await fb.create({ title: title, description: description, arenaRank: arenaRank, isBPLMode: isBPLMode, isPublicKey: isPublicKey });
    if (p) {
      this.props.history.push("/arena/" + p);
    } else {
      alert("作成に失敗しました");
      this.setState({ loading: false });
    }
  }

  handleBPLMode = (e: React.ChangeEvent<HTMLInputElement>) => this.setState({ isBPLMode: e.target.checked });
  handlePublicKey = (e: React.ChangeEvent<HTMLInputElement>) => this.setState({ isPublicKey: e.target.checked });

  render() {
    const { title, description, arenaRank, loading } = this.state;
    return (
      <Dialog open={true} onClose={() => loading ? null : this.props.toggle()}>
        <DialogTitle>ルームを作成</DialogTitle>
        <DialogContent>
          <TextBox loading={loading} title="ルーム タイトル" value={title} changeEvent={this.changeTitle} />
          <FormControl fullWidth style={{ margin: "8px 0" }}>
            <InputLabel>アリーナランク</InputLabel>
            <Select disabled={loading} fullWidth value={arenaRank} onChange={(e: SelectChangeEvent<string>, ) => {
              if (typeof e.target.value !== "string") return;
              this.setState({ arenaRank: e.target.value });
            }}>
              {["A1", "A2", "A3", "A4", "A5", "B1", "B2", "B3", "B4", "B5"].map(item => <MenuItem value={item} key={item}>{item}</MenuItem>)}
            </Select>
          </FormControl>
          <TextBox loading={loading} title="募集内容(オプション)" value={description} changeEvent={this.changeDesc} />
          <Typography variant="caption">1 つのルームの有効期限は 3 時間です。</Typography>
        </DialogContent>
        <DialogActions>
          <Button disabled={loading} onClick={() => loading ? null : this.props.toggle()}>閉じる</Button>
          <LoadingButton
            onClick={this.make}
            loading={loading}
            loadingPosition="start"
            startIcon={<SaveIcon />}
            variant="outlined"
          >
            作成
          </LoadingButton>
        </DialogActions>
      </Dialog>

    );
  }
}

export default withRouter(CreateDialog);

class TextBox extends React.Component<{
  title: string,
  value: string,
  loading: boolean,
  changeEvent: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}, {}>{
  render() {
    return (
      <FormControl component="fieldset" style={{ width: "100%" }}>
        <InputLabel>{this.props.title}</InputLabel>
        <Input
          disabled={this.props.loading}
          style={{ width: "100%" }}
          value={this.props.value}
          onChange={this.props.changeEvent}
        />
      </FormControl>
    )
  }
}
