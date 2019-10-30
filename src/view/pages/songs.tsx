import * as React from 'react';
import SongsList from '../components/songs/songsList';
import { scoresDB } from '../../components/indexedDB';
import { scoreData } from '../../types/data';

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
      return (null);
    }
    return (
      <div>
        <SongsList title="Songs.title" full={this.state.full} updateScoreData={this.updateScoreData}/>
      </div>
    );
  }
}
