import * as React from 'react';

import { rivalScoreData } from '../../../types/data';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import ClearLampTable from './table';

interface S {
}

interface P{
  backToMainPage:()=>void|null
  name:string,
  data:rivalScoreData[]
}

class ClearLampView extends React.Component<P,S> {

  handleChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
    this.setState({currentTab:newValue});
  };

  render(){
    const {backToMainPage,name,data} = this.props;
    return (
      <div>
        <Typography component="h5" variant="h5" color="textPrimary" gutterBottom>
          <Button onClick={backToMainPage} style={{minWidth:"auto",padding:"6px 0px"}}><ArrowBackIcon/></Button>
          &nbsp;{name}
        </Typography>
        <p>表の見方: 左の数字がAAA+0におけるBPI、右の数字が表示中のユーザーの現在のBPI<br/>AAA達成時のBPIが高い順に5刻みでカテゴライズしています</p>
        <ClearLampTable data={data}/>
      </div>
    );
  }
}

export default ClearLampView;
