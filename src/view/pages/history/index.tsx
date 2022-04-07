import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Container from '@mui/material/Container';
import { historyDataWithLastScore } from '@/types/history';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Loader from '@/view/components/common/loader';
import Pagination from '@mui/lab/Pagination/Pagination';
import { _prefix } from '@/components/songs/filter';
import HistoryDataReceiver from '@/components/history';
import TableContainer from '@mui/material/TableContainer';
import { Table, TableRow, TableCell, TableBody, Dialog, DialogTitle, DialogContent, TableHead } from '@mui/material';
import { historyBgColor } from '@/components/common';
import { historyData } from '@/types/data';
import { scoreHistoryDB } from '@/components/indexedDB';
import timeFormatter from '@/components/common/timeFormatter';
import { RouteComponentProps, withRouter } from 'react-router-dom';

export interface IDays { key: string, num: number }

const History: React.FC<RouteComponentProps> = props => {

  const hist: HistoryDataReceiver = useMemo(()=>new HistoryDataReceiver(),[]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filtered, setFiltered] = useState<historyDataWithLastScore[]>([]);
  const [days, setDays] = useState<IDays[]>([]);
  const [page, setPage] = useState<number>(1);
  const [currentDate, setCurrentDate] = useState<string>("すべて");

  const initialLoading = useCallback(async () => {
    (await hist.load()).generate();
    const days = hist.getUpdateDays();
    const p = (props.match.params as any).date;

    let date = p ? timeFormatter(7, p) : "すべて";
    let data = hist.setDate(date).getData();
    if (date !== "すべて" && data.length === 0) {
      data = hist.getResult();
      date = "すべて";
    }
    setIsLoading(false);
    setFiltered(data);
    setDays(days);
    setCurrentDate(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeDate = async (input: SelectChangeEvent<string>) => {
    const date = input.target.value as string;
    setCurrentDate(date);
    setPage(1);
    setFiltered(hist.setDate(date).getData());
    return;
  }

  const changePage = (_e: Object, p: number) => setPage(p);
  const showNumber = 10;

  useEffect(() => {
    initialLoading();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) return (<Loader />)
  return (
    <Container fixed className="commonLayout" id="stat">
      <DateSelector days={days} currentDate={currentDate} handleChange={changeDate} />
      <Pagination count={Math.ceil(filtered.length / showNumber)} page={page} color="secondary" onChange={changePage} style={{ marginBottom: "15px" }} />
      {filtered.slice((page - 1) * 10, page * 10).map((item: historyDataWithLastScore, i: number) => (
        <HistoryView item={item} key={item.title + item.difficulty + i} />
      ))}
      <Pagination count={Math.ceil(filtered.length / showNumber)} page={page} color="secondary" onChange={changePage} />
    </Container>
  );
}


interface IDateSelector { days: IDays[], currentDate: string, handleChange: (input: SelectChangeEvent<string>) => void }

const DateSelector: React.FC<IDateSelector> = props => {

  const getAllCount = () => props.days.reduce((sum: number, item: IDays) => sum += item.num, 0);
  return (
    <FormControl fullWidth style={{ marginBottom: "15px" }}>
      <InputLabel>
        更新日
      </InputLabel>
      <Select
        value={props.currentDate}
        onChange={props.handleChange}
        displayEmpty
      >
        <MenuItem value={"すべて"}>すべて({getAllCount()})</MenuItem>
        {props.days.map((item) => <MenuItem value={item.key} key={item.key}>{item.key}({item.num})</MenuItem>)}
      </Select>
    </FormControl>
  )
}

const HistoryView: React.FC<{ item: historyDataWithLastScore }> = props => {

  const [open, setOpen] = useState<boolean>(false);
  const { item } = props;
  return (
    <React.Fragment>
      <TableContainer style={{ marginBottom: "8px" }} onClick={() => setOpen(!open)}>
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell component="th" scope="row" className="tableTopDiff" style={{ fontWeight: "bold", background: historyBgColor() }}>
                ☆{item.difficultyLevel} {item.title}{_prefix(item.difficulty)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell component="th" scope="row" className="dense tableTopDiff" />
              <TableCell className="denseCont">
                前回
              </TableCell>
              <TableCell className="denseCont">
                更新後
              </TableCell>
              <TableCell className="denseCont">
                差分
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell component="th" scope="row" className="dense tableTopDiff">
                EX
              </TableCell>
              <TableCell className="denseCont">
                {item.lastScore}
              </TableCell>
              <TableCell className="denseCont">
                {item.exScore}
              </TableCell>
              <TableCell className="denseCont">
                +{item.exScore - item.lastScore}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell component="th" scope="row" className="dense">
                BPI
              </TableCell>
              <TableCell className="denseCont">
                {item.lastBPI.toFixed(2)}
              </TableCell>
              <TableCell className="denseCont">
                {item.BPI.toFixed(2)}
              </TableCell>
              <TableCell className="denseCont">
                +{(item.BPI - item.lastBPI).toFixed(2)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <Table className="textCenter">
          <TableBody>
            <TableRow>
              <TableCell className="dense tableTopDiff" style={{ textAlign: "center" }}>
                {item.updatedAt}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      {open && <HistoryPopper handleOpen={() => setOpen(!open)} title={item.title} diff={item.difficulty} />}
    </React.Fragment>
  );
}

const HistoryPopper: React.FC<{
  handleOpen: () => void,
  title: string,
  diff: string
}> = props => {

  const [dataset, setDataset] = useState<historyData[]>([]);

  const load = useCallback(async () => {
    const { title, diff } = props;
    const s = new scoreHistoryDB();
    let set = await s._getWithinVersion(title, diff);
    return setDataset(set.reduce((groups, item) => {
      item.currentBPI = item.BPI === Infinity ? "-" : item.BPI;
      groups.push(item);
      return groups;
    }, []));
  },[props]);

  const columns = [
    { id: "updatedAt", label: "Date" },
    { id: "exScore", label: "EX" },
    { id: "currentBPI", label: "BPI" },
  ];

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Dialog open={true} onClick={props.handleOpen}>
      <DialogTitle className="narrowDialogTitle">{props.title}{_prefix(props.diff)}</DialogTitle>
      <DialogContent className="narrowDialogContent">
        <Table size="small" className="detailedDiffs">
          <TableHead>
            <TableRow>
              {columns.map((column, i) => (
                <TableCell className="dense"
                  key={column.id}
                  style={i === 0 ? { minWidth: "150px" } : undefined}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {dataset.map((row: historyData, i: number) => {
              return (
                <TableRow
                  hover role="checkbox" tabIndex={-1} key={row.title + row.difficulty + i} className={i % 2 ? "isOdd" : "isEven"}>
                  {columns.map((column, _j) => {
                    return (
                      <TableCell key={column.id}>
                        {(_j === 0) && timeFormatter(0, row[column.id])}
                        {(_j !== 0) && row[column.id]}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  )
}

export default withRouter(History);
