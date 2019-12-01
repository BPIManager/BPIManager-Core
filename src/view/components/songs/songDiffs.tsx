import React from "react";

import { scoreData, songData } from "../../../types/data";
import Container from "@material-ui/core/Container";
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import CircularProgress from "@material-ui/core/CircularProgress";
import { FormattedMessage } from "react-intl";
import {scoreHistoryDB} from "../../../components/indexedDB";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import Table from "@material-ui/core/Table";
import TableRow from "@material-ui/core/TableRow";

interface P{
  song:songData|null,
  score:scoreData|null,
}

interface S{
  isLoading:boolean,
  current:number,
  dataset:any[],
}

class SongDiffs extends React.Component<P,S> {

  constructor(props:P){
    super(props);
    this.state = {
      isLoading:true,
      current:0,
      dataset:[],
    }
  }

  componentDidMount(){
    this.updateScoreData();
  }

  handleChange = (event: React.ChangeEvent<{ value: unknown }>)=> {
    if(typeof event.target.value !== "number"){return;}
    this.setState({current:event.target.value,isLoading:true});
    this.updateScoreData(event.target.value);
  }

  async updateScoreData(newState:number = 0){
    const {song} = this.props;
    if(!song){return};
    const s = new scoreHistoryDB();
    if(newState === 0){
      return this.setState({
        dataset:await s.getWithinVersion(song),
        isLoading:false,
      })
    }else{
      return this.setState({
        dataset:await s.getAcrossVersion(song),
        isLoading:false,
      })
    }
  }

  render(){
    const {current,isLoading,dataset} = this.state;
    const {song,score} = this.props;
    if(!song || !score){
      return (null);
    }
    return (
      <div>
        <Container>
          <FormControl style={{width:"100%"}}>
          <InputLabel shrink>
              <FormattedMessage id="SongDiffs.Target"/>
            </InputLabel>
            <Select
              value={current}
              onChange={this.handleChange}
              displayEmpty>
                <MenuItem value={0}><FormattedMessage id="SongDiffs.WithinSameVersion"/></MenuItem>
                <MenuItem value={1}><FormattedMessage id="SongDiffs.EachVersion"/></MenuItem>
              </Select>
          </FormControl>
          {
            isLoading && <div style={{display:"flex",justifyContent:"center",marginTop:"30px"}}><CircularProgress/></div>
          }
          {
            !isLoading && <DiffsTable scoreTable={dataset} type={current}/>
          }
        </Container>
      </div>
    );
  }
}

export default SongDiffs;


class DiffsTable extends React.Component<{scoreTable:any[],type:number},{}>{

  render(){

    const columns = [
      this.props.type === 0 ? { id: "updatedAt", label: "Date"} : { id: "storedAt", label: "Version"},
      { id: "exScore", label: "EX" },
      { id: "BPI", label: "BPI" },
    ];

    return (
      <Table className="detailedDiffs">
        <TableHead>
          <TableRow>
            {columns.map((column,i) => (
              <TableCell
                key={column.id}
                style={i===0 ? {minWidth:"150px"} : undefined}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {this.props.scoreTable.map((row:any,i:number) => {
            return (
              <TableRow
                hover role="checkbox" tabIndex={-1} key={row.title + row.difficulty + i} className={ i % 2 ? "isOdd" : "isEven"}>
                {columns.map((column,_j) => {
                  return (
                    <TableCell key={column.id}>
                      {row[column.id]}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  }
}
