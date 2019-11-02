import * as React from 'react';
import { scoresDB, songsDB } from '../../components/indexedDB';
import { songData } from '../../types/data';
import { difficultyDiscriminator } from '../../components/songs/filter';
import { _isSingle,_currentStore } from '../../components/settings';
import Container from '@material-ui/core/Container';
import CircularProgress from '@material-ui/core/CircularProgress';
import NotPlayList from '../components/songs/notplayed/notPlayList';

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
      let currentState = this.state.full;
      currentState = currentState.filter((item:songData)=>item.title !== willDeleteItem.title && willDeleteItem.difficulty);
      return this.setState({full:currentState});
    }
    const currentStore = _currentStore();
    const isSingle = _isSingle();
    const songs:songData[] = await new songsDB().getAll(isSingle);
    const db = new scoresDB();
    let full:songData[] = [];
    for(let i =0;i < songs.length;++i){
      let song = songs[i];
      const res = await db.getItem(song.title,difficultyDiscriminator(song.difficulty),currentStore,isSingle);
      if(res.length === 0) full.push(song);
    }
    this.setState({full:full});
  }

  render(){
    if(this.state.full.length === 0){
      return (
        <Container className="loaderCentered">
          <CircularProgress />
        </Container>);
    }
    return (
      <div>
        <NotPlayList title="NotPlayed.Title" full={this.state.full} updateScoreData={this.updateScoreData}/>
      </div>
    );
  }
}
