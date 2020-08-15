import * as React from 'react';
import SongsList from '@/view/components/songs/played/songsList';
import { scoresDB, favsDB, songsDB } from '@/components/indexedDB';
import { scoreData, songData } from '@/types/data';
import { difficultyDiscriminator } from '@/components/songs/filter';
import { _currentStore, _isSingle } from '@/components/settings';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { defaultLists, getListsForNobi } from '@/components/lists';

interface S {
  full:scoreData[],
  title:string,
}

class FavBody extends React.Component<{}&RouteComponentProps,S> {

  constructor(props:Object&RouteComponentProps){
    super(props);
    this.state ={
      full:[],
      title:"",
    }
    this.updateScoreData = this.updateScoreData.bind(this);
  }

  async componentDidMount(){
    await this.updateScoreData();
  }

  async updateScoreData(){
    const db = new scoresDB();
    const num = Number((this.props.match.params as any).listTitle);
    if(num < 0){
      const listInfo = defaultLists(num);
      const full = await getListsForNobi(-num);
      return this.setState({full:full,title:listInfo ? listInfo.title : "List"});
    }
    const songs:songData[] = await new favsDB().getAllItemsInAList(num);
    const listInfo = await new favsDB().getListFromNum(num);
    let full:scoreData[] = [];
    for(let i =0;i < songs.length;++i){
      const song = songs[i];
      const d = difficultyDiscriminator(song.difficulty);
      const res = await db.getItem(song.title,d,_currentStore(),_isSingle());
      if((_isSingle() && ["3","4","10"].indexOf(song["difficulty"]) === -1) || (!_isSingle() && ["3","4","10"].indexOf(song["difficulty"]) !== -1)){
        continue;
      }
      if(res.length === 0){
        const songData = await new songsDB().getOneItemIsSingle(song.title,song.difficulty);
        if(songData.length !== 0){
          full.push({
            title:song.title,
            clearState:7,
            currentBPI:-15,
            difficulty:d,
            difficultyLevel:songData[0].difficultyLevel,
            exScore:0,
            isSingle:_isSingle(),
            storedAt:_currentStore(),
            lastScore:-1,
            updatedAt:"-",
          });
        }
      }else{
        full.push(res[0]);
      }
    }
    this.setState({full:full,title:listInfo ? listInfo.title : "List"});
  }

  render(){
    if(!this.state.full){
      return (null);
    }
    return (
      <div>
        <SongsList isFav={true} title={this.state.title} full={this.state.full} updateScoreData={this.updateScoreData}/>
      </div>
    );
  }
}


export default withRouter(FavBody);
