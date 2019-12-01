import * as React from 'react';
import SongsList from '../components/songs/played/songsList';
import { scoresDB, songsDB } from '../../components/indexedDB';
import { scoreData, songData } from '../../types/data';
import { difficultyDiscriminator } from '../../components/songs/filter';
import { _currentStore, _isSingle } from '../../components/settings';

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
    const db = new scoresDB();
    const songs:songData[] = await new songsDB().getAllFavoritedItems();
    let full:scoreData[] = [];
    for(let i =0;i < songs.length;++i){
      const song = songs[i];
      const d = difficultyDiscriminator(song.difficulty);
      const res = await db.getItem(song.title,d,_currentStore(),_isSingle());
      if((_isSingle() && song["dpLevel"] !== "0") || (!_isSingle() && song["dpLevel"] === "0")){
        continue;
      }
      if(res.length === 0){
        full.push({
          title:song.title,
          clearState:7,
          currentBPI:-15,
          difficulty:d,
          difficultyLevel:song.difficultyLevel,
          exScore:0,
          isSingle:_isSingle(),
          storedAt:_currentStore(),
          lastScore:-1,
          updatedAt:"-",
        });
      }else{
        full.push(res[0]);
      }
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
