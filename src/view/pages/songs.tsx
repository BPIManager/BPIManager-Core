import * as React from 'react';
import SongsList from '@/view/components/songs/played/songsList';
import { scoresDB } from '@/components/indexedDB';
import { scoreData } from '@/types/data';
import Loader from '@/view/components/common/loader';
import AdsCard from '@/components/ad';
import Container from '@material-ui/core/Container';
import Alert from '@material-ui/lab/Alert/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle/AlertTitle';
import Link from '@material-ui/core/Link';
import {Link as RLink} from "react-router-dom";

interface S {
  full:scoreData[],
  isLoading:boolean,
}

export default class Songs extends React.Component<{},S> {

  constructor(props:Object){
    super(props);
    this.state ={
      full:[],
      isLoading:true
    }
    this.updateScoreData = this.updateScoreData.bind(this);
  }

  async componentDidMount(){
    await this.updateScoreData();
  }

  async updateScoreData(){
    const full:scoreData[] = await new scoresDB().getAll();
    this.setState({full:full,isLoading:false});
  }

  render(){
    if(!this.state.full || this.state.isLoading){
      return (<Loader/>);
    }
    if(this.state.full.length === 0){
      return (
        <Container fixed className="commonLayout">
          <Alert severity="warning">
            <AlertTitle>楽曲スコアが登録されていません</AlertTitle>
            <p>
              「<RLink to="/data" style={{textDecoration:"none"}}><Link color="secondary" component="span">データ取り込み</Link></RLink>」ページからCSVまたはブックマークレットを用いて一括インポートするか、「<RLink to="/notPlayed" style={{textDecoration:"none"}}><Link color="secondary" component="span">未プレイ楽曲</Link></RLink>」ページから手動でスコアを登録してください。
            </p>
            <p>
              *1 CSVを用いたインポートにはeAMUSEMENTプレミアムコースへの加入が必要です。<br/>
              *2 ブックマークレットを用いたインポートにはeAMUSEMENTベーシックコースまたはプレミアムコースへの加入が必要です。<br/>
              CSV・ブックマークレットを用いたインポートの方法については、「データ取り込み」ページに記載の説明文をお読みください。
            </p>
          </Alert>
        </Container>
      )
    }
    return (
      <div>
        <SongsList isFav={false} title="Songs.title" full={this.state.full} updateScoreData={this.updateScoreData}/>
        <AdsCard/>
      </div>
    );
  }
}
