import * as React from 'react';
import Container from '@material-ui/core/Container';
import { injectIntl } from 'react-intl';
import Paper from '@material-ui/core/Paper';
import Typography from "@material-ui/core/Typography";
import TextField from '@material-ui/core/TextField';
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import CircularProgress from "@material-ui/core/CircularProgress";
import {_setGreenPreference,_currentGreenPreference, buttonTextColor} from "../../../components/settings/";
import {songData} from "../../../types/data";
import {songsDB} from "../../../components/indexedDB";
import {_prefixFromNum} from "../../../components/songs/filter";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

interface S {
  [key:string]:any,
  beforeBPM:number,
  afterBPM:number,
  result:number,
  pref:number,
  isDialogOpen:boolean,
}

class Cont extends React.Component<{},S> {

  constructor(props:{}){
    super(props);
    this.state ={
      beforeBPM:0,
      afterBPM:0,
      result:0,
      pref:_currentGreenPreference(),
      isDialogOpen:false,
    }
  }

  onChange = (target:"beforeBPM"|"afterBPM"|"pref",e:any)=>{
    const val = e.target.value;
    if(typeof val !== "string"){return;}
    if(target === "pref") _setGreenPreference(val);
    return this.setState({[target]:Number(val),result:this.calcResult(target,val)});
  }

  calcResult = (target:"beforeBPM"|"afterBPM"|"pref",newValue:string):number=>{
    const {beforeBPM,afterBPM,pref} = this.state;
    const n = Number(newValue);
    const values = {
      beforeBPM : target === "beforeBPM" ? n : beforeBPM,
      afterBPM : target === "afterBPM" ? n : afterBPM,
      pref : target === "pref" ? n : pref
    };
    return this.result(values.beforeBPM,values.afterBPM,values.pref);
  }

  result = (b:number,a:number,p:number)=> Math.round(a / b * p);

  dialogToggle = ()=> this.setState({isDialogOpen:!this.state.isDialogOpen});
  decide = (input:string)=> {
    const split = input.split("-");
    const b = Number(split[0]) || 0,a = Number(split[1]) || 0,p = this.state.pref;
    this.setState({beforeBPM:b, afterBPM:a,
    result:this.result(b,a,p),
    isDialogOpen:false});
  }

  switchNum = ()=>{
    const {beforeBPM,afterBPM,pref} = this.state;
    this.setState({
      beforeBPM:afterBPM,
      afterBPM:beforeBPM,
      pref:pref,
      result:this.result(afterBPM,beforeBPM,pref)
    })
  }

  render(){
    const {beforeBPM,afterBPM,result,pref,isDialogOpen} = this.state;
    return (
      <Container fixed style={{padding:0}}>
        <Paper style={{padding:"15px"}}>
          <ButtonGroup fullWidth color="primary"  variant="outlined">
            <Button onClick={this.dialogToggle}
            style={{color:buttonTextColor()}}>曲名検索</Button>
            <Button onClick={this.switchNum}
            style={{color:buttonTextColor()}}>前後入れ替え</Button>
          </ButtonGroup>
          <TextField
            label="変化前BPM"
            type="number"
            InputLabelProps={{
              shrink: true,
            }}
            value={beforeBPM === 0 ? "" : beforeBPM}
            onChange={(e)=>this.onChange("beforeBPM",e)}
            fullWidth
            style={{margin:"10px 0"}}
          />
          <TextField
            label="変化後BPM"
            type="number"
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
            value={afterBPM === 0 ? "" : afterBPM}
            onChange={(e)=>this.onChange("afterBPM",e)}
            style={{margin:"10px 0"}}
          />
          <TextField
            label="計算結果(緑数字)"
            type="number"
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth disabled
            value={result}
            style={{margin:"10px 0"}}
          />
          <Divider style={{margin:"10px auto"}}/>
          <Typography component="h5" variant="h5" color="textPrimary" paragraph>
            個人設定
          </Typography>
          <TextField
            label="適正緑数字"
            type="number"
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
            value={pref === 0 ? "" : pref}
            onChange={(e)=>this.onChange("pref",e)}
            style={{margin:"10px 0"}}
          />
        </Paper>
        {isDialogOpen && <SongSearchDialog isDialogOpen={isDialogOpen} close={this.dialogToggle} decide={this.decide}/>}
      </Container>
    );
  }
}

export default injectIntl(Cont);

interface UP{
  isDialogOpen:boolean,
  close:()=>void,
  decide:(input:string)=>void,
}

class SongSearchDialog extends React.Component<UP,{value:string,isLoading:boolean,fullset:songData[],display:songData[]}> {

  constructor(props:UP){
    super(props);
    this.state = {
      value:"",
      isLoading:true,
      fullset:[],
      display:[]
    }
  }

  async componentDidMount(){
    const db = new songsDB();
    const allItems = (await db.getAll()).filter((item:songData)=>/\-/.test(item.bpm));
    return this.setState({fullset:allItems,display:allItems,isLoading:false});
  }

  handleClose = () => {
    this.props.close();
  };

  render(){
    const {isDialogOpen,decide} = this.props;
    const {isLoading,display,fullset} = this.state;
    return (
      <div>
        <Dialog
          open={isDialogOpen}
          onClose={this.handleClose}>
          <DialogTitle>楽曲検索</DialogTitle>
          <DialogContent>
          {isLoading &&
            <Container className="loaderCentered">
              <CircularProgress />
            </Container>
          }
          {!isLoading &&
            <div>
              <TextField
                margin="dense"
                id="name"
                label="楽曲名で絞り込み"
                type="text"
                value={this.state.value}
                onChange={(e:React.ChangeEvent<HTMLInputElement>)=>this.setState({value:e.target.value,display:fullset.filter(item=>item.title.toLowerCase().indexOf(e.target.value.toLowerCase()) > -1)})}
                fullWidth
              />
              <List subheader={<li />}>
                {display.map(item=>
                  <ListItem alignItems="flex-start" key={item.title + item.difficulty} button onClick={()=>decide(item.bpm)}>
                  <ListItemText
                    primary={"☆" + item.difficultyLevel + " " + item.title + _prefixFromNum(item.difficulty,false)}
                    secondary={
                    <React.Fragment>
                      <Typography
                        component="span"
                        variant="body2"
                        color="textPrimary"
                      >
                        {item.bpm}
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
