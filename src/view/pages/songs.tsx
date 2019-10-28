import * as React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from "react-intl";
import {scoresDB} from "../../components/indexedDB";

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

import SongsTable from "../components/songs/table";
import TextField from '@material-ui/core/TextField';
import PermDataSettingIcon from '@material-ui/icons/PermDataSetting';

interface stateInt {
  isLoading:boolean,
  filterByName:string,
  full:any[],
  scoreData:any[],
  options:{ [s:string]:string[]},
  unregisteredSongs: any[]
}

export default class Index extends React.Component<{},stateInt> {

  constructor(props:Object){
    super(props);
    this.state = {
      isLoading:true,
      filterByName:"",
      full:[],
      scoreData:[],
      unregisteredSongs:[],
      options:{
        level:["11","12"],
        difficulty:["hyper","another","leggendaria"],
      }
    }
  }

  async componentDidMount(){
    const full = await new scoresDB().getAll();
    this.setState({
      full:full,
      scoreData:full,
      isLoading:false,
    })
  }

  handleLevelChange = (name:string) => (e:React.ChangeEvent<HTMLInputElement>) =>{
    this.handleExec(name,e.target.checked,"level");
  }

  handleDiffChange = (name:string) => (e:React.ChangeEvent<HTMLInputElement>) =>{
    this.handleExec(name,e.target.checked,"difficulty");
  }

  handleExec = (name:string,checked:boolean,target:string)=>{
    let newOptions = this.state.options;
    if(checked){
      newOptions[target].push(name);
    }else{
      newOptions[target] = newOptions[target].filter((t:number|string)=> t !== name);
    }
    return this.setState({scoreData:this.songFilter(newOptions),options:newOptions});
  }

  handleInputChange = (e:React.ChangeEvent<HTMLInputElement>)=>{
    return this.setState({scoreData:this.songFilter(this.state.options,e.target.value),filterByName:e.target.value});
  }

  songFilter = (newOptions:{[s:string]:string[]} = this.state.options,newName:string = this.state.filterByName) => this.state.full.filter((data)=>{
    return (
      newOptions["level"].some(item=>item === data.difficultyLevel) &&
      newOptions["difficulty"].some(item=>item === data.difficulty) &&
      data.title.indexOf(newName) === 0
    )
  })

  render(){
    const {filterByName,scoreData,options} = this.state;
    return (
      <Container className="commonLayout" fixed>
        <Typography component="h4" variant="h4" color="textPrimary" gutterBottom
          style={{display:"flex",justifyContent:"space-between"}}>
          <FormattedMessage id="Songs.title"/>
          <Button variant="outlined" color="primary">
            <PermDataSettingIcon/>
            <FormattedMessage id="Songs.detailedFilter"/>
          </Button>
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <FormControl component="fieldset">
              <FormLabel component="legend"><FormattedMessage id="Songs.filterByLevel"/></FormLabel>
              <FormGroup row>
                <FormControlLabel
                  control={<Checkbox checked={options.level.some(t=> t === "11")} onChange={this.handleLevelChange("11")} value="11" />}
                  label="☆11"
                />
                <FormControlLabel
                  control={<Checkbox checked={options.level.some(t=> t === "12")} onChange={this.handleLevelChange("12")} value="12" />}
                  label="☆12"
                />
              </FormGroup>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl component="fieldset">
              <FormLabel component="legend"><FormattedMessage id="Songs.filterByDifficulty"/></FormLabel>
              <FormGroup row>
                <FormControlLabel
                  control={<Checkbox checked={options.difficulty.some(t=> t === "hyper")} onChange={this.handleDiffChange("hyper")} value="hyper" />}
                  label="H"
                />
                <FormControlLabel
                  control={<Checkbox checked={options.difficulty.some(t=> t === "another")} onChange={this.handleDiffChange("another")} value="another" />}
                  label="A"
                />
                <FormControlLabel
                  control={<Checkbox checked={options.difficulty.some(t=> t === "leggendaria")} onChange={this.handleDiffChange("leggendaria")} value="leggendaria" />}
                  label="†"
                />
              </FormGroup>
            </FormControl>
          </Grid>
        </Grid>
        <form noValidate autoComplete="off">
          <TextField
            style={{width:"100%"}}
            id="standard-name"
            label={<FormattedMessage id="Songs.filterByName"/>}
            value={filterByName}
            onChange={this.handleInputChange}
            margin="normal"
          />
        </form>

        <SongsTable data={scoreData.sort((a,b)=> b.currentBPI - a.currentBPI)}/>
      </Container>
    );
  }
}
