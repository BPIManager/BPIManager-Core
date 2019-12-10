import * as React from 'react';
import { scoresDB } from '../../../components/indexedDB';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import {_isSingle,} from "../../../components/settings";
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import TablePagination from '@material-ui/core/TablePagination';

interface S {
  isLoading:boolean,
  scoreData:any[],
  scoreByVersion:any[],
  targetLevel:string,
  sort:number,
  isDesc:boolean,
  page:number,
  rowsPerPage:number,
}


const columns = [
  { id: "title", label: "曲名" },
  { id: "storedAt", label: "VER"},
  {
    id: "exScore",
    label: "EX",
  },
  {
    id: "currentBPI",
    label: "BPI",
  },
];

class MyBest extends React.Component<{},S> {

  constructor(props:{}){
    super(props);
    this.state ={
      isLoading:true,
      scoreData:[],
      scoreByVersion:[],
      targetLevel:"12",
      sort:0,
      isDesc:true,
      page:0,
      rowsPerPage:10,
    }
    this.updateScoreData = this.updateScoreData.bind(this);
  }

  async componentDidMount(){
    await this.updateScoreData();
  }

  async updateScoreData(newData:{targetLevel:string} = {
    targetLevel:this.state.targetLevel,
  }){
    const isSingle = _isSingle();
    let {targetLevel} = newData;
    let scoreDataKeys:{[key:string]:any} = {};
    const data = (await new scoresDB(isSingle).getAllVersions()).filter(item=>item.difficultyLevel === targetLevel);
    for(let key in data){
      const d = data[key];
      const title = d["title"] + d["difficulty"];
      if(!scoreDataKeys[title] || d["exScore"] > scoreDataKeys[title]["exScore"]){
        scoreDataKeys[title] = d;
      }
    }
    let v:{[key:string]:number} = {};
    //BPI別集計
    this.setState(Object.assign({
      isLoading:false,
      scoreData:this.apply(Object.keys(scoreDataKeys).reduce((group:any[],item)=>{
        group.push(scoreDataKeys[item]);
        if(v[scoreDataKeys[item]["storedAt"]]){
          v[scoreDataKeys[item]["storedAt"]]++;
        }else{
          v[scoreDataKeys[item]["storedAt"]] = 1;
        }
        return group;
      },[])),
      scoreByVersion:Object.keys(v).reduce((group:any[],item:string)=>{
        group.push({
          name:item,
          value:v[item]
        })
        return group;
      },[])
    },newData));
  }

  apply = (data = this.state.scoreData)=>{
    return data.sort((a,b):number=> {
      const p = ():boolean=>{
        switch(this.state.sort){
          case 0:
            return b.title.localeCompare(a.title, "ja", {numeric:true}) > -1;
          case 1:
            return Number(b.storedAt) - Number(a.storedAt) > 0;
          default:
          case 2:
            return b.exScore - a.exScore > 0;
          case 3:
            return b.currentBPI - a.currentBPI > 0
        }
      }
      return (this.state.isDesc ? p() : !p()) ? 1 : -1
    });
  }

  handleLevelChange = async(event:React.ChangeEvent<{name?:string|undefined; value:unknown;}>):Promise<void> =>{
    if (typeof event.target.value !== "string") { return; }
    this.setState({isLoading:true});
    return this.updateScoreData({targetLevel:event.target.value});
  }

  changeSort = (newNum:number):void=>{
    const {sort,isDesc} = this.state;
    if(sort === newNum){
      return this.setState({isDesc:!isDesc});
    }
    return this.setState({sort:newNum,isDesc:true})
  }

  handleChangeRowsPerPage = (event:React.ChangeEvent<HTMLInputElement>):void => {
    this.handleChangePage(null,0);
    this.setState({rowsPerPage:+event.target.value});
  }

  handleChangePage = (_e:React.MouseEvent<HTMLButtonElement, MouseEvent> | null, newPage:number):void => this.setState({page:newPage});


  render(){
    const {page,sort,isDesc,rowsPerPage,isLoading,targetLevel,scoreData} = this.state;
    return (
      <Container style={{padding:0}} fixed>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12} lg={12}>
              <Grid container spacing={1} style={{margin:"5px 0"}}>
                <Grid item xs={12} lg={12}>
                  <FormControl component="fieldset" style={{width:"100%"}}>
                    <InputLabel>レベル</InputLabel>
                    <Select value={targetLevel} onChange={this.handleLevelChange}>
                      <MenuItem value={"12"}>☆12</MenuItem>
                      <MenuItem value={"11"}>☆11</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              {isLoading &&
                <Container className="loaderCentered">
                  <CircularProgress />
                </Container>
              }
              {!isLoading && <div>
                {scoreData.length === 0 && <p>表示するデータが見つかりません。</p>}
                {(scoreData.length > 0) &&
                  <div>
                  <Paper>
                  <Grid container spacing={0}>
                    <Grid item xs={12} md={12} lg={12}>
                      <div style={{width:"100%",overflowX:"auto"}}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            {columns.map((column,i) => (
                              <TableCell
                                key={column.id}
                                onClick={()=>this.changeSort(i)}
                                style={{textAlign:"center"}}
                              >
                                {column.label}
                                {i === sort &&
                                  <span>
                                    { isDesc && <span>▼</span> }
                                    { !isDesc && <span>▲</span> }
                                  </span>
                                }
                                {i !== sort && <span>△</span>}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {this.apply().slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row:any,i:number) => {
                            const prefix = row.difficulty === "hyper" ? "(H)" : row.difficulty === "leggendaria" ? "(†)" : "";
                            return (
                              <TableRow
                                hover role="checkbox" tabIndex={-1} key={row.title + row.prefix + i} className={ i % 2 ? "isOdd" : "isEven"}>
                                {columns.map((column,j) => {
                                  return (
                                    <TableCell key={column.id + prefix} style={{textAlign:j === 0 ? "left" : "center",width:j === 0 ? "80%" : "initial"}}>
                                      {row[column.id]}
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
                        onChangePage={this.handleChangePage}
                        onChangeRowsPerPage={this.handleChangeRowsPerPage}
                      />
                  </Grid>
                </Grid>
                </Paper>
              </div>
              }
            </div>
            }
          </Grid>
        </Grid>
      </Container>
    );
  }
}

export default MyBest;
