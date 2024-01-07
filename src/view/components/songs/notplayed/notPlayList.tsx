import React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { FormattedMessage } from "react-intl";

import SongsTable from "./tableNotPlayed";
import BackspaceIcon from "@mui/icons-material/Backspace";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";
import FormControl from "@mui/material/FormControl";

import Input from "@mui/material/Input";
import InputLabel from "@mui/material/InputLabel";

import { songData } from "@/types/data";
import { difficultyDiscriminator } from "@/components/songs/filter";
import equal from "fast-deep-equal";
import Button from "@mui/material/Button";
import SongsFilter, { B } from "../common/filter";
import FilterListIcon from "@mui/icons-material/FilterList";
import { bpmFilter, verArr } from "../common";
import { commonFunc , customCompare} from "@/components/common";
import FilterByLevelAndDiff from "@/view/components/common/selector";

interface stateInt {
  filterByName: string;
  songData: songData[];
  options: { [key: string]: string[] };
  sort: number;
  isDesc: boolean;
  page: number;
  filterOpen: boolean;
  bpm: B;
  versions: number[];
}

interface P {
  title: string;
  full: songData[];
  updateScoreData: (
    whenUpdated: boolean,
    willDeleteItem?: { title: string; difficulty: string }
  ) => Promise<void>;
}

export default class NotPlayList extends React.Component<P, stateInt> {
  _mounted: boolean = false;

  constructor(props: P) {
    super(props);
    this.state = {
      filterByName: "",
      songData: [],
      sort: 1,
      isDesc: false,
      options: {
        level: ["11", "12"],
        difficulty: ["0", "1", "2"],
      },
      bpm: {
        noSoflan: true,
        min: "",
        max: "",
        soflan: true,
      },
      page: 0,
      filterOpen: false,
      versions: verArr(),
    };
    this.updateScoreData = this.updateScoreData.bind(this);
  }

  componentDidMount() {
    this._mounted = true;
    this.setState({ songData: this.songFilter() });
  }

  componentDidUpdate(prevProps: P) {
    if (!equal(prevProps.full, this.props.full)) {
      return this.setState({ songData: this.songFilter() });
    }
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement, MouseEvent> | null,
    newPage: number
  ): void => this.setState({ page: newPage });

  handleChange =
    (name: string, target: string) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      this.handleExec(name, e.target.checked, target);
    };

  updateScoreData(
    whenUpdated: boolean = false,
    willDeleteItem?: { title: string; difficulty: string }
  ): Promise<void> {
    if (!whenUpdated || !willDeleteItem) {
      return this.props.updateScoreData(false);
    }
    return this.props.updateScoreData(whenUpdated, willDeleteItem);
  }

  handleExec = (name: string, checked: boolean, target: string) => {
    let newState = this.state;
    if (checked) {
      newState["options"][target].push(name);
    } else {
      newState["options"][target] = newState["options"][target].filter(
        (t: string) => t !== name
      );
    }
    return this.setState({
      songData: this.songFilter(newState),
      options: newState["options"],
      page: 0,
    });
  };

  handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | null
  ) => {
    let newState = this.clone();
    newState.filterByName = e ? e.target.value : "";

    return this.setState({
      songData: this.songFilter(newState),
      filterByName: newState.filterByName,
      page: 0,
    });
  };

  songFilter = (newState: stateInt = this.state) => {
    const v = newState.versions;
    const evaluateVersion = (song: songData): boolean => {
      const songVer = song.textage.split("/")[0];
      if (songVer === "s") {
        return v.indexOf(1.5) > -1;
      }
      return v.indexOf(Number(songVer)) > -1;
    };
    const diffs: string[] = ["hyper", "another", "leggendaria"];
    const b = newState.bpm;
    return this.props.full.filter((data) => {
      return (
        evaluateVersion(data) &&
        bpmFilter(data.bpm, b) &&
        newState["options"]["level"].some((item: string) => {
          return item === data.difficultyLevel;
        }) &&
        newState["options"]["difficulty"].some((item: string) => {
          return (
            diffs[Number(item)] === difficultyDiscriminator(data.difficulty)
          );
        }) &&
        data.title
          .toLowerCase()
          .indexOf(newState["filterByName"].toLowerCase()) > -1
      );
    });
  };

  changeSort = (newNum: number): void => {
    const { sort, isDesc } = this.state;
    if (sort === newNum) {
      return this.setState({ isDesc: !isDesc });
    }
    return this.setState({ sort: newNum, isDesc: true });
  };

  sortedData = (): songData[] => {
    const { songData, sort, isDesc } = this.state;
    const res = songData.sort((a, b) => {
      switch (sort) {
        case 0:
          return Number(b.difficultyLevel) - Number(a.difficultyLevel);
        case 1:
        default:
          return customCompare(a.title, b.title);
      }
    });
    return isDesc ? res : res.reverse();
  };

  applyFilter = (state: { bpm: B; versions: number[] }): void => {
    let newState = this.clone();
    newState.bpm = state.bpm;
    newState.versions = state.versions;
    return this.setState({
      songData: this.songFilter(newState),
      bpm: state.bpm,
      versions: state.versions,
      page: 0,
    });
  };

  handleToggleFilterScreen = () =>
    this.setState({ filterOpen: !this.state.filterOpen });

  clone = () => {
    return new commonFunc().set(this.state).clone();
  };

  render() {
    const { filterByName, filterOpen, options, sort, isDesc, page, versions } =
      this.state;
    return (
      <Container fixed className="commonLayout" id="songsVil">
        <Typography
          component="h5"
          variant="h5"
          color="textPrimary"
          gutterBottom
          style={{ display: "flex", justifyContent: "flex-end" }}
        >
          <Button
            className="filterButton"
            onClick={this.handleToggleFilterScreen}
            variant="outlined"
            color="primary"
            style={{
              marginRight: "10px",
              minWidth: "40px",
              padding: "5px 6px",
            }}
          >
            <FilterListIcon />
          </Button>
        </Typography>
        <Grid container spacing={1} style={{ margin: "5px 0" }}>
          <Grid item xs={12}>
            <FormControl component="fieldset" style={{ width: "100%" }}>
              <InputLabel>
                <FormattedMessage id="Songs.filterByName" />
              </InputLabel>
              <Input
                style={{ width: "100%" }}
                value={filterByName}
                onChange={this.handleInputChange}
                endAdornment={
                  filterByName && (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => this.handleInputChange(null)}
                        size="large"
                      >
                        <BackspaceIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }
              />
            </FormControl>
          </Grid>
        </Grid>
        <FilterByLevelAndDiff
          options={options}
          handleChange={this.handleChange}
        />

        <SongsTable
          page={page}
          handleChangePage={this.handleChangePage}
          data={this.sortedData()}
          sort={sort}
          isDesc={isDesc}
          changeSort={this.changeSort}
          updateScoreData={this.updateScoreData}
        />
        {filterOpen && (
          <SongsFilter
            versions={versions}
            handleToggle={this.handleToggleFilterScreen}
            applyFilter={this.applyFilter}
            bpm={this.state.bpm}
          />
        )}
      </Container>
    );
  }
}
