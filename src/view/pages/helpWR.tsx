import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { _currentTheme } from '@/components/settings';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import FavoriteIcon from '@mui/icons-material/Favorite';
import Button from '@mui/material/Button';
import { RouteComponentProps, withRouter } from 'react-router-dom';

class HelpWR extends React.Component<RouteComponentProps,{}> {

  render(){
    const themeColor = _currentTheme();
    return (
      <div>
          <div style={{background:`url("/images/background/${themeColor}.svg")`,backgroundSize:"cover"}}>
            <div style={{background:themeColor === "light" ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.4)",display:"flex",padding:"7vh 0",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
              <Typography variant="h4">ランキング</Typography>
              <Button style={{margin:"5px 0"}} size="small" color="secondary" variant="outlined" onClick={()=>this.props.history.push("/ranking/")}>
                ランキングを検索
              </Button>
            </div>
          </div>
          <Container fixed style={{marginTop:"15px"}}>
            <Typography variant="h5" style={{display: 'flex',alignItems: 'center'}}><ContactSupportIcon/>&nbsp;ランキングについて</Typography>
            <p>
              BPIManager v0.0.7.1より生まれ変わったランキング機能では、ユーザーの皆様が自由にランキングを作成・開催いただけるようになりました。<br/>
            </p>
            <Divider style={{margin:"10px 0"}}/>
            <Typography variant="h5" style={{display: 'flex',alignItems: 'center',marginBottom:"5px"}}><FavoriteIcon/>&nbsp;開催方法</Typography>
            <b>開催方法</b>
            <img src="https://files.poyashi.me/bpim/gt/ranking.jpg" alt="ランキング一覧画面右下のボタン" style={{display:"block",margin:"3px auto"}}/>
              <ul>
                <li>BPIManagerにログインします。</li>
                <li>ランキング一覧画面右下のボタンから「ランキングを作成」ボタンをタップします。</li>
                <li>ランキングの開催名称、対象楽曲、開始日時、終了日時を入力します。</li>
                <li>レギュレーションなどがある場合には、「ランキングの概要」欄に記入します（特にない場合、空白のままでOK）</li>
                <li>「確認画面へ」ボタンをタップし、内容に問題ない場合は「作成」ボタンからランキングを作成します。</li>
                <li>作成されたランキングURLをSNSなどで周知して参加を募りましょう！</li>
              </ul>
              <b style={{color:"#ff0000"}}>ルール</b>
              <ul>
                <li>現状☆11および☆12のみの対応ですが、利用状況が芳しければ☆10以下の楽曲についてもランキングの対象楽曲に含める予定です。</li>
                <li>ランキング一覧に用いられるアイキャッチ画像は、アカウントに紐付いたプロフィール画像が用いられます</li>
              </ul>
            <Divider style={{margin:"10px 0"}}/>
            <Typography variant="h5" style={{display: 'flex',alignItems: 'center',marginBottom:"5px"}}><FavoriteIcon/>&nbsp;参加方法・ルール</Typography>
            <b>参加方法</b>
              <ul>
                <li>トップページまたは「ソーシャル」→「ランキング」より、開催中のランキングを検索できます。</li>
                <li>参加したいランキングをタップし、「参加 / 更新」ボタンから自己スコアを入力・送信してください。</li>
              </ul>
              <b>スコアの編集・削除</b>
              <p>登録したスコアを編集したり、送信を取り消すことができます。</p>
                <ul>
                  <li>編集：「参加 / 更新」ボタンから新しいスコアを入力・送信します。</li>
                  <li>削除：ランキング画面内「登録済みのスコアを削除」をタップします。</li>
                </ul>
              <b>参加済みWRの確認</b>
              <p>ランキング一覧画面右下のボタンから「参加したランキング」をタップして、スコアを送信したランキングの一覧を表示できます。</p>
              <b style={{color:"#ff0000"}}>ルール</b>
              <ul>
                <li>ランキングに参加するには<b>Syncより「プロフィールを一般公開」をオンにする必要</b>があります。</li>
                <li>ランキング画面「ランキング詳細」ボタンより、ランキングを開催したユーザーが設定した条件を確認できます。<br/>
                こちらを確認のうえ、レギュレーション等が設定されている場合はそれらに違反しないよう参加してください。</li>
                <li>スコアは自己申告制ですが、ランキングに掲載されたスコアが明らかに正しくない場合、 是正措置を取る場合があります。</li>
              </ul>
          </Container>
      </div>
    );
  }
}

export default withRouter(HelpWR);
