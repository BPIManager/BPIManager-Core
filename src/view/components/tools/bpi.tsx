import * as React from 'react';
import Container from '@material-ui/core/Container';
import { injectIntl } from 'react-intl';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import bpiCalcuator from "../../../components/bpi";

interface S {
  [key:string]:any,
  wr:number,
  avg:number,
  notes:number,
  ex:number,
  coef:number,
}

class Cont extends React.Component<{},S> {

  private bpiCalc = new bpiCalcuator();

  constructor(props:{}){
    super(props);
    this.state ={
      wr:0,
      avg:0,
      notes:0,
      ex:0,
      coef:1.5,
    }
  }

  onChange = (target:string,e:any)=>{
    const val = e.target.value;
    if(typeof val !== "string"){return;}
    return this.setState({[target]:Number(val)});
  }

  render(){
    const {wr,avg,notes,ex,coef} = this.state;
    const boxes = [
      {"label":"全一","target":"wr","num":wr},
      {"label":"皆伝平均","target":"avg","num":avg},
      {"label":"ノート数","target":"notes","num":notes},
      {"label":"EXスコア","target":"ex","num":ex},
      {"label":"譜面係数","target":"coef","num":coef},
    ]
    return (
      <Container fixed style={{padding:0}}>
        <Paper style={{padding:"15px"}}>
        {boxes.map(item=>
          <TextField
            key={item.label}
            label={item.label}
            type="number"
            InputLabelProps={{
              shrink: true,
            }}
            value={item.num}
            onChange={(e)=>this.onChange(item.target,e)}
            fullWidth
            style={{margin:"10px 0"}}
          />
        )}
        <TextField
          label={"計算結果"}
          type="number"
          InputLabelProps={{
            shrink: true,
          }}
          disabled
          value={this.bpiCalc.setManual(wr,avg,notes,ex,coef) || -15}
          fullWidth
          style={{margin:"10px 0"}}
        />
        </Paper>
      </Container>
    );
  }
}

export default injectIntl(Cont);
