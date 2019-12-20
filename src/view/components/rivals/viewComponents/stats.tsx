import * as React from 'react';

import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';

interface S {
  scoresAbout:number[],
  scoresByLevel11:number[],
  scoresByLevel12:number[],
  clearAbout:number[],
  clearByLevel11:number[],
  clearByLevel12:number[],
  sum:number,
  sum11:number,
  sum12:number,
  percentage:boolean,
}

interface P {
  rivalData:any,
  full:any[],
}

class RivalSettings extends React.Component<P,S> {

  constructor(props:P){
    super(props);
    this.state = {
      scoresAbout:[],
      scoresByLevel11:[0,0,0],
      scoresByLevel12:[0,0,0],
      clearAbout:[],
      clearByLevel11:[0,0,0],
      clearByLevel12:[0,0,0],
      sum:0,
      sum11:0,
      sum12:0,
      percentage:true,
    }
  }

  componentDidMount(){
    const {full} = this.props;
    const scoresAbout = [0,0,0],scoresByLevel11 = [0,0,0],scoresByLevel12 = [0,0,0];
    const clearAbout = [0,0,0],clearByLevel11 = [0,0,0],clearByLevel12 = [0,0,0];
    let sum11 = 0, sum12 = 0;
    for(let i = 0;i < full.length; ++i){
      const indv = full[i];
      scoresAbout[indv.myEx > indv.rivalEx ? 0 : indv.myEx === indv.rivalEx ? 1 : 2]++;
      clearAbout[indv.myClearState > indv.rivalClearState ? 0 : indv.myClearState === indv.rivalClearState ? 1 : 2]++;
      if(indv.difficultyLevel === "11"){
        scoresByLevel11[indv.myEx > indv.rivalEx ? 0 : indv.myEx === indv.rivalEx ? 1 : 2]++;
        clearByLevel11[indv.myClearState > indv.rivalClearState ? 0 : indv.myClearState === indv.rivalClearState ? 1 : 2]++;
        sum11++;
      }
      if(indv.difficultyLevel === "12"){
        scoresByLevel12[indv.myEx > indv.rivalEx ? 0 : indv.myEx === indv.rivalEx ? 1 : 2]++;
        clearByLevel12[indv.myClearState > indv.rivalClearState ? 0 : indv.myClearState === indv.rivalClearState ? 1 : 2]++;
        sum12++;
      }
    }
    return this.setState({
      scoresAbout:scoresAbout,
      scoresByLevel11:scoresByLevel11,
      scoresByLevel12:scoresByLevel12,
      clearAbout:clearAbout,
      clearByLevel11:clearByLevel11,
      clearByLevel12:clearByLevel12,
      sum:full.length,
      sum11:sum11,
      sum12:sum12,
    })
  }

  render(){
    const {scoresAbout,scoresByLevel11,scoresByLevel12,clearAbout,clearByLevel11,clearByLevel12,sum,sum11,sum12,percentage} = this.state;
    return (
      <div>
        <FormControlLabel
          style={{float:"right"}}
          control={
          <Switch
            checked={percentage}
            onChange={(e:React.ChangeEvent<HTMLInputElement>,)=>{
              if(typeof e.target.checked === "boolean"){
                this.setState({percentage:e.target.checked});
              }
            }}
          />
          }
          label="パーセント表示"
        />
        <div className="clearBoth"/>
        <Paper style={{padding:"15px",margin:"0 0 15px 0"}}>
          <Typography component="h5" variant="h5" color="textPrimary" gutterBottom>
            スコア勝敗
          </Typography>
          <Typography component="h6" variant="h6" color="textPrimary" gutterBottom>
            全体
          </Typography>
          <Graph sum={sum} content={scoresAbout} p={percentage}/>
          <Typography component="h6" variant="h6" color="textPrimary" gutterBottom>
            ☆11
          </Typography>
          <Graph sum={sum11} content={scoresByLevel11} p={percentage}/>
          <Typography component="h6" variant="h6" color="textPrimary" gutterBottom>
            ☆12
          </Typography>
          <Graph sum={sum12} content={scoresByLevel12} p={percentage}/>
        </Paper>
        <Paper style={{padding:"15px"}}>
          <Typography component="h5" variant="h5" color="textPrimary" gutterBottom>
            クリア勝敗
          </Typography>
          <Typography component="h6" variant="h6" color="textPrimary" gutterBottom>
            全体
          </Typography>
          <Graph sum={sum} content={clearAbout} p={percentage}/>
          <Typography component="h6" variant="h6" color="textPrimary" gutterBottom>
            ☆11
          </Typography>
          <Graph sum={sum11} content={clearByLevel11} p={percentage}/>
          <Typography component="h6" variant="h6" color="textPrimary" gutterBottom>
            ☆12
          </Typography>
          <Graph sum={sum12} content={clearByLevel12} p={percentage}/>
        </Paper>
      </div>
    );
  }
}

interface P2 {
  content:number[],
  sum:number,
  p:boolean,
}

class Graph extends React.Component<P2,{}>{

  render(){
    const {content,sum,p} = this.props;
    const calc = (m:number)=> Math.round(m / sum * 100);
    return (
      <div style={{width:"100%",height:"30px",background:"#ccc",display:"flex"}}>
        { content[0] !== 0 &&
          <div style={{width:calc(content[0]) + "%",height:"100%",background:"#82ca9d",display:calc(content[0]) === 0 ? "none" : "flex",justifyContent:"center",alignItems:"center"}}>
            {p ? calc(content[0]) + "%" : content[0]}
          </div>
        }
        { content[1] !== 0 &&
          <div style={{width:calc(content[1]) + "%",height:"100%",background:"#ccc",display:calc(content[1]) === 0 ? "none" : "flex",justifyContent:"center",alignItems:"center"}}>
            {p ? calc(content[1]) + "%" : content[1]}
          </div>
        }
        { content[2] !== 0 &&
          <div style={{width:calc(content[2]) + "%",height:"100%",background:"#8884d8",justifyContent:"center",alignItems:"center",display:calc(content[2]) === 0 ? "none" : "flex"}}>
            {p ? calc(content[2]) + "%" : content[2]}
          </div>
        }
      </div>
    )
  }
}

export default RivalSettings;
