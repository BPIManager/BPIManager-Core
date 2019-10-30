import * as React from 'react';
import SongsList from '../components/songs/played/songsList';
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
    const isSingle = 1;
    let full:scoreData[] = [];
    for(let i =0;i < songs.length;++i){
      const song = songs[i];
      const d = difficultyDiscriminator(song.difficulty);
      const res = await db.getItem(song.title,d,currentStore,isSingle);
      if((isSingle && song["dpLevel"] !== "0") || (!isSingle && song["dpLevel"] === "0")){
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
          isSingle:isSingle,
          storedAt:currentStore,
          DJLevel:"-",
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
