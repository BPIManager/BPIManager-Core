import * as React from 'react';
import SongsList from '../components/songs/played/songsList';
import { scoresDB } from '../../components/indexedDB';
import { scoreData } from '../../types/data';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';

interface S {
  full:scoreData[]
}

export default class Songs extends React.Component<{},S> {

  constructor(props:Object){
    super(props);
    this.state ={
      full:[]
    }
    this.updateScoreData = this.updateScoreData.bind(this);
  }

  async componentDidMount(){
    await this.updateScoreData();
  }

  async updateScoreData(){
    const full:scoreData[] = await new scoresDB().getAll();
    this.setState({full:full});
  }

  render(){
    if(!this.state.full){
      return (<Container className="loaderCentered">
        <CircularProgress />
      </Container>);
    }
    return (
      <div>
        <SongsList title="Songs.title" full={this.state.full} updateScoreData={this.updateScoreData}/>
      </div>
    );
  }
}
