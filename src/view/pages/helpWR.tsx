import * as React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import { _currentTheme } from '@/components/settings';
import ContactSupportIcon from '@material-ui/icons/ContactSupport';
import FavoriteIcon from '@material-ui/icons/Favorite';
import Button from '@material-ui/core/Button';
import { RouteComponentProps, withRouter } from 'react-router-dom';

class HelpWR extends React.Component<RouteComponentProps,{}> {

  render(){
    const themeColor = _currentTheme();
    return (
      <div>
          <div style={{background:`url("/images/background/${themeColor}.svg")`,backgroundSize:"cover"}}>
            <div style={{background:themeColor === "light" ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.4)",display:"flex",padding:"7vh 0",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
              <Typography variant="h4">ランキング</Typography>
              <Button style={{margin:"5px 0"}} size="small" color="secondary" variant="outlined" onClick={()=>this.props.history.push("/ranking/ongoing")}>
                最新のランキングを表示
              </Button>
            </div>
          </div>
          <Container fixed style={{marginTop:"15px"}}>
            <Typography variant="h5" style={{display: 'flex',alignItems: 'center'}}><ContactSupportIcon/>&nbsp;ランキングについて</Typography>
            <p>
              ランキングは、参加を通して実力の近いユーザーを見つけるなど、交流促進を目的とした機能です。<br/>
              BPIManagerにアカウントを登録しており、プロフィールを一般公開していれば誰でも参加できます。<br/>
              将来的にはマイページ上で詳細な分析を表示できるようにする予定ですので、奮ってご参加ください！
            </p>
            <Divider style={{margin:"10px 0"}}/>
            <Typography variant="h5" style={{display: 'flex',alignItems: 'center',marginBottom:"5px"}}><FavoriteIcon/>&nbsp;参加方法・ルール</Typography>
            <b>参加方法</b>
              <ul>
                <li>トップページまたは「ソーシャル」→「ランキング」より、開催中のランキングにスコアを送信することができます。</li>
                <li>ランキングは原則として毎月2回、2週間ごとに曲目が変更されます。</li>
                <li>ランキング対象楽曲は☆11および☆12のBPI対象楽曲から無作為に選出され、同一バージョン内で選曲が被ることはありません。</li>
              </ul>
              <b style={{color:"#ff0000"}}>ルール</b>
              <ul>
                <li>登録するスコアは<b>当該ランキング開催期間中に達成したものを使用してください</b>。</li>
                <li>スコアは自己申告制ですが、ランキングに掲載されたスコアが明らかに正しくない場合、 是正措置を取る場合があります。</li>
              </ul>
          </Container>
      </div>
    );
  }
}

export default withRouter(HelpWR);
