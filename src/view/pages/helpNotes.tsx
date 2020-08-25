import * as React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import {Link as RefLink} from '@material-ui/core/';
import { _currentTheme } from '@/components/settings';
import ContactSupportIcon from '@material-ui/icons/ContactSupport';
import FavoriteIcon from '@material-ui/icons/Favorite';
import CreateIcon from '@material-ui/icons/Create';
import { Link } from 'react-router-dom';
import InfoIcon from '@material-ui/icons/Info';

export default class HelpNotes extends React.Component<{},{}> {

  render(){
    const themeColor = _currentTheme();
    return (
      <div>
          <div style={{background:`url("/images/background/${themeColor}.svg")`,backgroundSize:"cover"}}>
            <div style={{background:themeColor === "light" ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.4)",display:"flex",padding:"7vh 0",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
              <Typography variant="h4">Notesについて</Typography>
            </div>
          </div>
          <Container fixed style={{marginTop:"15px"}}>
            <Typography variant="h4" style={{display: 'flex',alignItems: 'center'}}><ContactSupportIcon/>&nbsp;Notesとは?</Typography>
            <p>Notesとは、beatmania IIDXの攻略情報を共有するための機能です。<br/>
            誰でも書き込めることはもちろん、BPIや「いいね」を用いることで、書き込みの信頼性を可視化することを目的としています。</p>
            <Divider style={{margin:"10px 0"}}/>
            <Typography variant="h4" style={{display: 'flex',alignItems: 'center'}}><FavoriteIcon/>&nbsp;Notesの特徴</Typography>
            <ul>
              <li><b>有用な情報のストック機能</b></li>
            </ul>
              <p>いいねを押した書き込みは、あとからまとめて確認できます</p>
            <ul>
              <li><b>有用な情報の検索機能</b></li>
            </ul>
            <p>単曲BPIが高い=その曲が得意な人による書き込みや、いいねが沢山ついている=多くの人の役に立っている投稿を素早く見つけられます</p>
            <ul>
              <li><b>憶測による書き込みの防止</b></li>
            </ul>
            <p>未プレイの場合書き込みができません</p>
            <Divider style={{margin:"10px 0"}}/>
            <Typography variant="h4" style={{display: 'flex',alignItems: 'center'}}><CreateIcon/>&nbsp;Notesの使い方</Typography>
            <div>
              <Typography variant="h6" style={{display: 'flex',alignItems: 'center'}}>投稿する</Typography>
              <b>書き込みはアカウント無しでも可能です(ただし<Link to="/data"><RefLink component="span" color="secondary">データ取り込み</RefLink></Link>から楽曲のプレイ状況を送信する必要があります)。</b><br/>
              <Link to="/songs"><RefLink component="span" color="secondary">楽曲一覧</RefLink></Link>にアクセスし、情報を共有したい楽曲を長押ししてください。<br/>
              「Notes」タブが開いたら、右下の書き込みボタンをタップして書き込みできます。<br/><br/>
              ログイン状態で書き込んだ投稿を削除したい場合、<Link to="/notes"><RefLink component="span" color="secondary">Notes</RefLink></Link>にアクセスし、「MYノート」から削除できます。<br/>
              (未ログインユーザーによる書き込みは削除できません。)
            </div>
            <div style={{marginTop:"5px"}}>
              <Typography variant="h6" style={{display: 'flex',alignItems: 'center'}}>閲覧する</Typography>
              <Link to="/songs"><RefLink component="span" color="secondary">楽曲一覧</RefLink></Link>にアクセスし、任意の楽曲を長押しすることで当該楽曲のノートを参照できます。<br/>
              または、<Link to="/notes"><RefLink component="span" color="secondary">Notes</RefLink></Link>から最近投稿されたノートを一覧表示できます。<br/>
            </div>
            <Divider style={{margin:"10px 0"}}/>
            <div>
              <Typography variant="h4" style={{display: 'flex',alignItems: 'center'}}><InfoIcon/>&nbsp;BPIManagerとは</Typography>
              BPIManagerは、<RefLink href="http://norimiso.web.fc2.com/" color="secondary">norimiso様</RefLink>が考案された、皆伝平均を0、全国1位を100としてスコアを評価する仕組み(BPI)を用いてbeatmania IIDXのスコアを管理できるツールです。<br/>
              たんにスコアを管理するにとどまらず、ライバル機能やNotesといった独自要素を搭載することにより、beatmania IIDXの上達を一層促進しつつユーザー間の交流が図れるようなサービスを目指しています。<br/>
              ご利用にはeAMUSEMENTプレミアムコースもしくはベーシックコースへ加入していることが望ましいですが、有料プランに入っておらずともご利用いただけます。
            </div>
            <Divider style={{margin:"10px 0"}}/>
          </Container>
      </div>
    );
  }
}
