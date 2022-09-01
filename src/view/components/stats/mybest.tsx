import React from "react";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import TablePagination from "@mui/material/TablePagination";
import { scoreData } from "@/types/data";
import Loader from "../common/loader";
import { _prefix } from "@/components/songs/filter";
import { myBest, scoreByVersion, apply } from "@/components/stats/myBest";

interface S {
  isLoading: boolean;
  scoreData: scoreData[];
  scoreByVersion: scoreByVersion[];
  targetLevel: string;
  sort: number;
  isDesc: boolean;
  page: number;
  rowsPerPage: number;
}

const columns = [
  { id: "title", label: "曲名" },
  { id: "storedAt", label: "VER" },
  {
    id: "exScore",
    label: "EX",
  },
  {
    id: "currentBPI",
    label: "BPI",
  },
];

class MyBest extends React.Component<{}, S> {
  constructor(props: {}) {
    super(props);
    this.state = {
      isLoading: true,
      scoreData: [],
      scoreByVersion: [],
      targetLevel: "12",
      sort: 0,
      isDesc: true,
      page: 0,
      rowsPerPage: 10,
    };
    this.updateScoreData = this.updateScoreData.bind(this);
  }

  async componentDidMount() {
    await this.updateScoreData();
  }

  async updateScoreData(
    newData: { targetLevel: string } = {
      targetLevel: this.state.targetLevel,
    }
  ) {
    const data = await myBest(newData.targetLevel, this.state.sort, this.state.isDesc);
    return this.setState({
      scoreData: data.scoreData,
      scoreByVersion: data.scoreByVersion,
      isLoading: false,
      targetLevel: newData.targetLevel,
    });
  }

  apply = () => apply(this.state.sort, this.state.isDesc, this.state.scoreData);

  handleLevelChange = async (event: SelectChangeEvent<string>): Promise<void> => {
    console.log(event.target.value);
    if (typeof event.target.value !== "string") return;
    this.setState({ isLoading: true });
    return this.updateScoreData({ targetLevel: event.target.value });
  };

  changeSort = (newNum: number): void => {
    const { sort, isDesc } = this.state;
    if (sort === newNum) {
      return this.setState({ isDesc: !isDesc });
    }
    return this.setState({ sort: newNum, isDesc: true });
  };

  handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>): void => {
    this.handleChangePage(null, 0);
    this.setState({ rowsPerPage: +event.target.value });
  };

  handleChangePage = (_e: React.MouseEvent<HTMLButtonElement, MouseEvent> | null, newPage: number): void => this.setState({ page: newPage });

  render() {
    const { page, sort, isDesc, rowsPerPage, isLoading, targetLevel, scoreData } = this.state;
    return (
      <Container fixed style={{ padding: 0 }}>
        <Grid container>
          <Grid item xs={12} md={12} lg={12}>
            <Grid container spacing={1} style={{ margin: "5px -4px" }}>
              <Grid item xs={12} lg={12}>
                <FormControl component="fieldset" style={{ width: "100%" }}>
                  <InputLabel>レベル</InputLabel>
                  <Select value={targetLevel} onChange={this.handleLevelChange}>
                    <MenuItem value={"12"}>☆12</MenuItem>
                    <MenuItem value={"11"}>☆11</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            {isLoading && <Loader />}
            {!isLoading && (
              <div>
                {scoreData.length === 0 && <p>表示するデータが見つかりません。</p>}
                {scoreData.length > 0 && (
                  <div>
                    <Paper>
                      <Grid container spacing={0}>
                        <Grid item xs={12} md={12} lg={12}>
                          <div style={{ width: "100%", overflowX: "auto" }}>
                            <Table>
                              <TableHead>
                                <TableRow>
                                  {columns.map((column, i) => (
                                    <TableCell key={column.id} onClick={() => this.changeSort(i)} style={{ textAlign: "center" }}>
                                      {column.label}
                                      {i === sort && <span>{isDesc ? "▼" : "▲"}</span>}
                                      {i !== sort && <span>△</span>}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {this.apply()
                                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                  .map((row: scoreData, i: number) => {
                                    const prefix = _prefix(row.difficulty);
                                    return (
                                      <TableRow hover role="checkbox" tabIndex={-1} key={row.title + row.prefix + i} className={i % 2 ? "isOdd" : "isEven"}>
                                        {columns.map((column, j) => {
                                          return (
                                            <TableCell
                                              key={column.id + prefix}
                                              style={{
                                                textAlign: j === 0 ? "left" : "center",
                                                width: j === 0 ? "80%" : "initial",
                                              }}
                                            >
                                              {column.id !== "currentBPI" && row[column.id]}
                                              {column.id === "currentBPI" && (row[column.id] !== Infinity ? Number(row[column.id]).toFixed(2) : "-")}
                                              {column.id === "title" && prefix}
                                            </TableCell>
                                          );
                                        })}
                                      </TableRow>
                                    );
                                  })}
                              </TableBody>
                            </Table>
                          </div>
                          <TablePagination
                            rowsPerPageOptions={[10, 25, 50, 100]}
                            component="div"
                            count={scoreData.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            labelRowsPerPage=""
                            backIconButtonProps={{
                              "aria-label": "previous page",
                            }}
                            nextIconButtonProps={{
                              "aria-label": "next page",
                            }}
                            onPageChange={this.handleChangePage}
                            onRowsPerPageChange={this.handleChangeRowsPerPage}
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  </div>
                )}
              </div>
            )}
          </Grid>
        </Grid>
      </Container>
    );
  }
}

export default MyBest;
