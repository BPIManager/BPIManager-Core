import * as React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import { FormattedMessage, injectIntl } from 'react-intl';
import { scoresDB } from '../../components/indexedDB';
import { scoreData } from '../../types/data';
import ClearLampTable from '../components/table/table';
import {_isSingle,_currentStore} from '../../components/settings/';

interface S {
  data:any[],
  isLoading:boolean,
}

class Stats extends React.Component<{intl:any},S> {

  constructor(props:{intl:any}){
    super(props);
    this.state ={
      data:[],
      isLoading:true,
    }
  }

  async componentDidMount(){
    const db = await new scoresDB(_isSingle(),_currentStore()).loadStore();
    const full:scoreData[] = await db.getItemsBySongDifficulty("12");
    this.setState({data:full,isLoading:false,});
  }

  render(){
    const {data,isLoading} = this.state;
    if(isLoading){
      return (
        <Container fixed style={{padding:0}}>
          <Container className="loaderCentered">
            <CircularProgress />
          </Container>
        </Container>
      )
    }
    return (
      <Container className="commonLayout" fixed>
        <Typography component="h5" variant="h5" color="textPrimary" gutterBottom>
          <FormattedMessage id="GlobalNav.AAATable"/>
        </Typography>
        <p>表の見方: 左の数字がAAA+0におけるBPI、右の数字が表示中のユーザーの現在のBPI<br/>AAA達成時のBPIが高い順に5刻みでカテゴライズしています</p>
        <ClearLampTable data={data}/>
      </Container>
    );
  }
}

export default injectIntl(Stats);
