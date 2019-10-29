import * as React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { FormattedMessage } from "react-intl";
import {scoresDB} from "../../components/indexedDB";
import TextField from '@material-ui/core/TextField';
import Divider from '@material-ui/core/Divider';

import Snackbar from '@material-ui/core/Snackbar';

import importCSV from "../../components/csv/import";
import bpiCalculator from "../../components/bpi";
import timeFormatter from "../../components/common/timeFormatter";

export default class Index extends React.Component<{},{raw:string,isSnackbarOpen:boolean,stateText:string,errors:string[]}> {

  constructor(props:Object){
    super(props);
    this.state = {
      raw: "",
      isSnackbarOpen:false,
      stateText:"Data.Success",
      errors:[]
    }
    this.execute = this.execute.bind(this);
  }

  async execute(){
    try{
      let errors = [];
      const executor = new importCSV(this.state.raw);
      const calc = new bpiCalculator();
      const exec = await executor.execute();
      if(!exec){
        throw new Error("CSVデータの形式が正しくありません");
      }
      const result = executor.getResult();
      for(let i = 0;i < result.length;++i){
        const calcData = await calc.calc(result[i]["title"],result[i]["difficulty"],result[i]["exScore"])
        if(calcData.error && calcData.reason){
          errors.push(result[i]["title"] + " - " + calcData.reason);
          continue;
        }
        await new scoresDB().resetImportedItems();
        await new scoresDB().setItem(Object.assign(
          result[i],
          {
            difficultyLevel:calcData.difficultyLevel,
            currentBPI : calcData.bpi,
            storedAt : localStorage.getItem("storedAt") || "27",
            isSingle: true,
            isImported: true,
            updatedAt : timeFormatter(0),
          }
        ),true);
      }
      return this.setState({raw:"",isSnackbarOpen:true,stateText:"Data.Success",errors:errors});
    }catch(e){
      return this.setState({isSnackbarOpen:true,stateText:"Data.Failed",errors:[e.message]});
    }
  }

  onChangeText = (e: React.ChangeEvent<HTMLInputElement>)=> this.setState({raw:e.target.value});
  handleClose = ()=> this.setState({isSnackbarOpen:false});

  render(){
    const {raw,isSnackbarOpen,stateText,errors} = this.state;
    return (
      <Container className="commonLayout" fixed>
        <Snackbar
          open={isSnackbarOpen}
          onClose={this.handleClose}
          ContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={<span id="message-id"><FormattedMessage id={stateText}/></span>}
        />
        <Typography component="h4" variant="h4" color="textPrimary" gutterBottom>
          <FormattedMessage id="Data.add"/>
        </Typography>
        <Typography variant="body1" gutterBottom>
          <FormattedMessage id="Data.infoBulk"/><br/>
          <FormattedMessage id="Data.howToBulk1"/>
          <a href="https://p.eagate.573.jp/game/2dx/27/djdata/score_download.html" target="_blank" rel="noopener noreferrer">
            <FormattedMessage id="Data.CSVURL"/>
          </a>
          <FormattedMessage id="Data.howToBulk2"/>
        </Typography>
        <TextField
          onChange={this.onChangeText}
          value={raw}
          style={{width:"100%"}}
          id="outlined-dense-multiline"
          label="Paste here"
          margin="dense"
          variant="outlined"
          multiline
          rowsMax="4"/>
        <Button
          variant="contained"
          color="primary"
          onClick={this.execute}
          style={{width:"100%",margin:"5px 0"}}>
          <FormattedMessage id="Data.Execute"/>
        </Button>
        <Divider variant="middle" style={{margin:"10px 0"}}/>
        {errors && errors.map(item=><span>{item}<br/></span>)}
        <FormattedMessage id="Data.notPremium1"/>
        <Divider variant="middle" style={{margin:"10px 0"}}/>
        <Typography component="h4" variant="h4" color="textPrimary" gutterBottom>
          <FormattedMessage id="Data.edit"/>
        </Typography>
        <FormattedMessage id="Data.howToEdit"/>
        <ol>
          <li><FormattedMessage id="Data.howToEdit1"/></li>
          <li><FormattedMessage id="Data.howToEdit2"/></li>
          <li><FormattedMessage id="Data.howToEdit3"/></li>
        </ol>
      </Container>
    );
  }
}
