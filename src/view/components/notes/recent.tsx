import React from "react";
import Container from "@mui/material/Container";
import fbActions from "@/components/firebase/actions";
import Loader from "@/view/components/common/loader";
import List from "@mui/material/List";
import ModalNotes from "./modal";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Link from "@mui/material/Link";
import Button from "@mui/material/Button";
import { Link as RLink } from "react-router-dom";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { EachMemo } from "../songs/songNotes";

interface S {
  isLoading: boolean;
  recentNotes: any[];
  isModalOpen: boolean;
  lastReached: boolean;
  data: any;
  hide: boolean;
  sort: number;
}

class NotesRecent extends React.Component<{}, S> {
  private fbA: fbActions = new fbActions();

  constructor(props: {}) {
    super(props);
    this.state = {
      isLoading: true,
      isModalOpen: false,
      lastReached: false,
      recentNotes: [],
      data: null,
      hide: !!localStorage.getItem("hideNotesInfo"),
      sort: 0,
    };
  }

  async componentDidMount() {
    this.changeSort();
  }

  async changeSort(newSort = 0) {
    this.setState({ isLoading: true });
    const sort = newSort;
    const loaded = sort === 0 ? await this.fbA.loadRecentNotes() : await this.fbA.loadFavedNotes();
    this.setState({
      recentNotes: loaded.docs,
      lastReached: false,
      isLoading: false,
    });
  }

  handleModalOpen = (flag: boolean) => this.setState({ isModalOpen: flag, data: null });

  onClick = (data: any) => {
    this.setState({
      isModalOpen: true,
      data: data,
    });
  };

  next = async () => {
    const { recentNotes } = this.state;
    const last = recentNotes[recentNotes.length - 1];
    const next = this.state.sort === 0 ? await this.fbA.loadRecentNotes(last) : await this.fbA.loadFavedNotes(last);
    if (next.docs.length === 0) {
      this.setState({ lastReached: true });
    } else {
      this.setState({ recentNotes: recentNotes.concat(next.docs) });
    }
  };

  render() {
    const { isLoading, recentNotes, isModalOpen, data, lastReached, hide, sort } = this.state;
    const sortDisp = ["???????????????????????????", "?????????????????????"];
    if (isLoading) {
      return <Loader />;
    }
    return (
      <Container fixed>
        {!hide && !localStorage.getItem("hideNotesInfo") && (
          <Alert variant="outlined" severity="info" style={{ margin: "8px 0" }}>
            <AlertTitle>Notes?????????</AlertTitle>
            <p>
              Notes????????????????????????????????????????????????????????????????????????????????????????????????????????? (
              <Link color="secondary" href="https://docs2.poyashi.me/docs/social/notes/" component="span">
                ???????????????
              </Link>
              )<br />
              <b>
                <RLink to="/songs">
                  <Link color="secondary" component="span">
                    ????????????
                  </Link>
                </RLink>
                ??????????????????????????????????????????????????????NOTES????????????????????????????????????
              </b>
              <br />
              ???MY??????????????????????????????????????????????????????????????????????????????
            </p>
            <Button
              variant="outlined"
              startIcon={<VisibilityOffIcon />}
              onClick={() => {
                localStorage.setItem("hideNotesInfo", "true");
                this.setState({ hide: true });
              }}
            >
              ?????????????????????
            </Button>
          </Alert>
        )}
        <FormControl fullWidth style={{ marginTop: "8px" }}>
          <InputLabel>?????????????????????</InputLabel>
          <Select
            fullWidth
            value={sort}
            onChange={(e: SelectChangeEvent<number>) => {
              if (typeof e.target.value !== "number") return;
              this.setState({ sort: e.target.value });
              this.changeSort(e.target.value);
            }}
          >
            {[0, 1].map((item) => (
              <MenuItem value={item} key={item}>
                {sortDisp[item]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <List component="nav">
          {recentNotes.map((item: any, i: number) => {
            return <EachMemo item={item} listType onClick={this.onClick} key={i} />;
          })}
        </List>
        {!lastReached && (
          <Button fullWidth variant="outlined" onClick={this.next}>
            ??????20????????????
          </Button>
        )}
        {lastReached && (
          <Button fullWidth disabled>
            ??????????????????????????????
          </Button>
        )}
        {isModalOpen && data && <ModalNotes derived={data} isOpen={isModalOpen} handleOpen={(flag: boolean) => this.handleModalOpen(flag)} />}
      </Container>
    );
  }
}

export default NotesRecent;
