import * as React from 'react';
import Container from '@material-ui/core/Container';
import { historyDataWithLastScore } from '@/types/history';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Loader from '@/view/components/common/loader';
import Pagination from '@material-ui/lab/Pagination/Pagination';
import { _prefix } from '@/components/songs/filter';
import HistoryDataReceiver from '@/components/history';
import TableContainer from '@material-ui/core/TableContainer';
import { Table, TableRow, TableCell, TableBody, Dialog, DialogTitle, DialogContent, TableHead } from '@material-ui/core';
import { historyBgColor } from '@/components/common';
import { historyData } from '@/types/data';
import { scoreHistoryDB } from '@/components/indexedDB';
import timeFormatter from '@/components/common/timeFormatter';
import { RouteComponentProps, withRouter } from 'react-router-dom';

export interface IDays {key:string,num:number}

interface S {
  isLoading:boolean,
  filtered:historyDataWithLastScore[],
  days:IDays[],
  currentDate:string,
  page:number,
  showNumber:number,
}

class History extends React.Component<RouteComponentProps,S> {

  private hist:HistoryDataReceiver = new HistoryDataReceiver();

  constructor(props:RouteComponentProps){
    super(props);
    this.state ={
      isLoading:true,
      filtered:[],
      days:[],
      page:1,
      showNumber:10,
      currentDate:"すべて"
    }
  }

  async componentDidMount(){
    (await this.hist.load()).generate();
    const days = this.hist.getUpdateDays();
    const p = (this.props.match.params as any).date;

    let date = p ? timeFormatter(7,p) :  "すべて";
    let data = this.hist.setDate(date).getData();
    if(date !== "すべて" && data.length === 0 ){
      data = this.hist.getResult();
      date = "すべて";
    }
    this.setState({
      isLoading:false,
      filtered:data,
      days: days,
      currentDate:date
    })
  }

  changeDate = (input:React.ChangeEvent<{name?:string|undefined; value:unknown;}>)=>{
    const date = input.target.value as string;
    return this.setState({
      currentDate:date,
      page:1,
      filtered:this.hist.setDate(date).getData()
    });
  }

  changePage = (_e:Object,p:number)=> this.setState({page:p});

  render(){
    const {isLoading,filtered,days,currentDate,page,showNumber} = this.state;
    if(isLoading) return (<Loader/>)
    return (
      <Container fixed  className="commonLayout" id="stat">
        <DateSelector days={days} currentDate={currentDate} handleChange={this.changeDate}/>
        <Pagination count={Math.ceil(filtered.length / showNumber)} page={page} color="secondary" onChange={this.changePage} style={{marginBottom:"15px"}} />
          {filtered.slice((page - 1) * 10, page * 10 ).map((item:historyDataWithLastScore)=> (
              <React.Fragment key={item.title + item.difficulty}>
                <HistoryView item={item}/>
              </React.Fragment>
            )
          )}
        <Pagination count={Math.ceil(filtered.length / showNumber)} page={page} color="secondary" onChange={this.changePage} />
      </Container>
    );
  }
}


interface IDateSelector {days:IDays[],currentDate:string,handleChange:(input:React.ChangeEvent<{name?:string|undefined; value:unknown;}>)=>void}
class DateSelector extends React.Component<IDateSelector>{

  getAllCount = ()=> this.props.days.reduce((sum:number,item:IDays)=> sum += item.num,0);

  render(){
    return (
      <FormControl fullWidth style={{marginBottom:"15px"}}>
        <InputLabel>
          更新日
        </InputLabel>
        <Select
          value={this.props.currentDate}
          onChange={this.props.handleChange}
          displayEmpty
        >
          <MenuItem value={"すべて"}>すべて({this.getAllCount()})</MenuItem>
          {this.props.days.map((item)=><MenuItem value={item.key} key={item.key}>{item.key}({item.num})</MenuItem>)}
        </Select>
      </FormControl>
    )
  }
}

class HistoryView extends React.Component<{item:historyDataWithLastScore},{open:boolean}>{

  state = {open:false}

  handleOpen = ()=>this.setState({open:!this.state.open})

  render(){
    const {item} = this.props;
    const {open} = this.state;
    return (
    <React.Fragment>
    <TableContainer style={{marginBottom:"8px"}} onClick={this.handleOpen}>
      <Table size="small">
        <TableBody>
          <TableRow>
            <TableCell component="th" scope="row" className="tableTopDiff" style={{fontWeight:"bold",background:historyBgColor()}}>
              ☆{item.difficultyLevel} {item.title}{_prefix(item.difficulty)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell component="th" scope="row" className="dense tableTopDiff">
            </TableCell>
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
            <TableCell className="dense tableTopDiff" style={{textAlign:"center"}}>
            {item.updatedAt}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
    {open && <HistoryPopper handleOpen={this.handleOpen} title={item.title} diff={item.difficulty}/>}
    </React.Fragment>
    );
  }
}

class HistoryPopper extends React.Component<{
  handleOpen:()=>void,
  title:string,
  diff:string
},{
  dataset:historyData[],
}>{

  state = {
    dataset:[],
  }

  async componentDidMount(){
    const {title,diff} = this.props;
    const s = new scoreHistoryDB();
    let set = await s._getWithinVersion(title,diff);
    return this.setState({
      dataset:set.reduce((groups,item)=>{
        item.currentBPI = item.BPI === Infinity ? "-" : item.BPI;
        groups.push(item);
        return groups;
      },[]),
    })
  }

  render(){

    const columns = [
      { id: "updatedAt", label: "Date"},
      { id: "exScore", label: "EX" },
      { id: "currentBPI", label: "BPI" },
    ];

    return (
      <Dialog open={true} onClick={this.props.handleOpen}>
        <DialogTitle className="narrowDialogTitle">{this.props.title}{_prefix(this.props.diff)}</DialogTitle>
        <DialogContent className="narrowDialogContent">
          <Table size="small" className="detailedDiffs">
            <TableHead>
              <TableRow>
                {columns.map((column,i) => (
                  <TableCell className="dense"
                    key={column.id}
                    style={i===0 ? {minWidth:"150px"} : undefined}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.dataset.map((row:historyData,i:number) => {
                return (
                  <TableRow
                    hover role="checkbox" tabIndex={-1} key={row.title + row.difficulty + i} className={ i % 2 ? "isOdd" : "isEven"}>
                    {columns.map((column,_j) => {
                      return (
                        <TableCell key={column.id}>
                          {(_j === 0) && timeFormatter(0,row[column.id])}
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
}

export default withRouter(History);
