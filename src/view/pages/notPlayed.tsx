import * as React from 'react';
import { scoresDB, songsDB } from '@/components/indexedDB';
import { songData } from '@/types/data';
import { difficultyDiscriminator } from '@/components/songs/filter';
import { _isSingle,_currentStore, _showLatestSongs } from '@/components/settings';
import NotPlayList from '@/view/components/songs/notplayed/notPlayList';
import Loader from '@/view/components/common/loader';
import AdsCard from '@/components/ad';

interface S {
  full:songData[]
}

export default class NotPlayed extends React.Component<{},S> {

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

  async updateScoreData(whenUpdated:boolean = false,willDeleteItem?:{title:string,difficulty:string}){
    if(whenUpdated && willDeleteItem){
      return this.setState({full:this.state.full.filter((item:songData)=>{
        if(item.title !== willDeleteItem.title){
          return true;
        }else{
          if(difficultyDiscriminator(item.difficulty) !== willDeleteItem.difficulty){
            return true;
          }
        }
        return false;
      })});
    }
    const currentStore = _currentStore();
    const isSingle = _isSingle();
    const songs:songData[] = await new songsDB().getAll(isSingle);
    const db = new scoresDB();
    let full:songData[] = [];
    for(let i =0;i < songs.length;++i){
      let song = songs[i];
      const res = await db.getItem(song.title,difficultyDiscriminator(song.difficulty),currentStore,isSingle);
      if(res.length === 0){
        if(song.wr === -1 && !_showLatestSongs()){
          continue;
        }
        full.push(song);
      }
    }
    this.setState({full:full});
  }

  render(){
    if(this.state.full.length === 0){
      return (<Loader/>);
    }
    return (
      <div id="_notPlayed">
        <NotPlayList title="NotPlayed.Title" full={this.state.full} updateScoreData={this.updateScoreData}/>
        <AdsCard/>
      </div>
    );
  }
}
