import * as React from 'react';
import Container from '@material-ui/core/Container';
import { injectIntl } from 'react-intl';
import { scoresDB } from '../../components/indexedDB';
import { scoreData } from '../../types/data';
import ClearLampTable from '../components/table/table';
import {_isSingle,_currentStore} from '../../components/settings/';
import Loader from '../components/common/loader';

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
      return (<Loader/>);
    }
    return (
      <Container className="commonLayout" fixed>
        <p>表の見方: 左の数字がAAA+0におけるBPI、右の数字が表示中のユーザーの現在のBPI<br/>AAA達成時のBPIが高い順に5刻みでカテゴライズしています</p>
        <ClearLampTable data={data}/>
      </Container>
    );
  }
}

export default injectIntl(Stats);
