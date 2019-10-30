import * as React from 'react';
import SongsList from '../components/songs/songsList';
import { scoresDB, songsDB } from '../../components/indexedDB';
import { scoreData, songData } from '../../types/data';
import { difficultyDiscriminator } from '../../components/songs/filter';

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
    const songs:songData[] = await new songsDB().getAllFavoritedItems();
    const db = new scoresDB();
    const currentStore = "27";
    const isSingle = true;
    let full:scoreData[] = [];
    for(let i =0;i < songs.length;++i){
      const song = songs[i];
      const res = await db.getItem(song.title,difficultyDiscriminator(song.difficulty),currentStore);
      if(res && (isSingle && res[0]["isSingle"] === true) ) full.push(res[0]);
    }
    this.setState({full:full});
  }

  render(){
    if(!this.state.full){
      return (null);
    }
    return (
      <div>
        <SongsList title="Favorites.Title" full={this.state.full} updateScoreData={this.updateScoreData}/>
      </div>
    );
  }
}
