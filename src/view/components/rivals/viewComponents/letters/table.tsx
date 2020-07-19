import * as React from 'react';
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import Loader from '@/view/components/common/loader';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import { songData } from '@/types/data';
import { DiffsTable } from '@/view/components/songs/songRivals';
import { datasets, rivalShow } from "@/components/rivals/letters";
import { _prefixFromNum } from '@/components/songs/filter';

interface S {
  rowsPerPage:number,
  showDetail:boolean,
  currentSong:songData|null,
  currentScore:any|null,
}

interface P{
  data:any[],
  full:any[],
  isLoading:boolean,
  page:number,
  handleChangePage:(newPage:number)=>void,
}

export default class LettersTable extends React.Component<P,S> {

  constructor(props:P){
    super(props);
    this.state = {
      rowsPerPage: 10,
      showDetail:false,
      currentSong:null,
      currentScore:null,
    }
  }

  handleOpen = async(row:any):Promise<void>=> {
    console.log(this.props.full)
    return this.setState({
      showDetail:!this.state.showDetail,
      currentScore:row,
      currentSong:this.props.full[row.title + row.difficulty]
    });
  }

  handleToggle = ()=> this.setState({showDetail:!this.state.showDetail,currentScore:null,currentSong:null});

  handleChangePage = (_e:React.MouseEvent<HTMLButtonElement, MouseEvent> | null, newPage:number):void => this.props.handleChangePage(newPage);

  handleChangeRowsPerPage = (event:React.ChangeEvent<HTMLInputElement>):void => {
    this.props.handleChangePage(0);
    this.setState({rowsPerPage:+event.target.value});
  }

  render(){
    const {data,isLoading,page} = this.props;
    const {rowsPerPage,showDetail,currentSong,currentScore} = this.state;
    const columns = [
      { id: "difficultyLevel", label: "☆"},
      { id: "win", label: "WIN"},
      {
        id: "lose",
        label: "LOSE",
      },
      {
        id: "rate",
        label: "RATE",
      },
    ];
    if(isLoading){
      return (<Loader/>);
    }
    return (
    <Paper style={{width:"100%",overflowX:"auto"}}>
      <div>
        <div>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
              {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row:any,i:number) => {
                const prefix = row.difficulty === "hyper" ? "(H)" : row.difficulty === "leggendaria" ? "(†)" : "";
                return (
                <TableBody className="rival" key={row.title + i} onClick={()=>this.handleOpen(row)}>
                  <TableRow
                    hover role="checkbox" tabIndex={-1} className={ i % 2 ? "isOdd" : "isEven"}>
                    <TableCell
                      rowSpan={2}
                      style={{position:"relative"}}
                    >
                      {row["difficultyLevel"]}
                    </TableCell>
                    <TableCell
                      rowSpan={1}
                      colSpan={3}
                      style={{position:"relative"}}
                    >
                      {row["title"]}
                      {prefix}
                    </TableCell>
                  </TableRow>
                  <TableRow className="rivalBody">
                    <TableCell
                      style={{
                        borderLeft:`4px solid rgb(255, 151, 151)`,
                        position:"relative"}}
                    >
                      <span className={"bodyNumber"}>
                        {row.win}
                      </span>
                    </TableCell>
                    <TableCell
                      style={{
                        borderLeft:`4px solid rgb(151, 255, 151)`,
                        position:"relative"}}
                    >
                      <span className={"bodyNumber"}>
                        {row.lose}
                      </span>
                    </TableCell>
                    <TableCell
                      style={{
                        borderLeft:`4px solid rgb(151, 151, 255)`,
                        position:"relative"}}
                    >
                      <span className={"bodyNumber"}>
                        {row.rate}
                      </span>
                    </TableCell>
                  </TableRow>
                </TableBody>
                );
              })}
          </Table>
        </div>
      </div>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={data.length}
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
      {showDetail && <SongDetail song={currentSong} score={currentScore} handleToggle={this.handleToggle}/>}
    </Paper>
    );
  }
}

interface P2{song:songData|null,score:any,handleToggle:()=>void};

class SongDetail extends React.Component<P2,{isLoading:boolean,dataset:datasets[],yourEx:number,isError:boolean}> {

  constructor(props:P2){
    super(props);
    this.state = {
      dataset:[],
      isLoading:true,
      yourEx:0,
      isError:false,
    }
  }

  async componentDidMount(){
    try{
      const {song,score} = this.props;
      if(!song || !score){
        throw new Error();
      }
      return this.setState({
        dataset:await rivalShow(song,score),
        isLoading:false,
        yourEx:score.exScore,
      })
    }catch(e){
      console.log(e);
      return this.setState({
        isLoading:false,
        isError:true,
      })
    }
  }

  render(){
    const {handleToggle,song} = this.props;
    const {dataset,yourEx,isLoading,isError} = this.state;
    return (
      <Dialog open={true} onClose={handleToggle} onClick={handleToggle}>
        {song && <DialogTitle className="narrowDialogTitle">{song.title}{_prefixFromNum(song.difficulty)}</DialogTitle>}
        <DialogContent style={{padding:0}}>
          {
            (!isLoading && isError) && (
              <div style={{margin:"15px 0",textAlign:"center"}}>
                <p>An Error Occured</p>
              </div>
            )
          }
          {
            isLoading && <Loader/>
          }
          {
            (!isLoading && !isError) && <DiffsTable scoreTable={dataset} yourEx={yourEx}/>
          }
        </DialogContent>
      </Dialog>
    );
  }
}
